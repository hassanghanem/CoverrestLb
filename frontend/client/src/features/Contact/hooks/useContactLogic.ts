import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFullPageLoading } from "@/context/FullPageLoadingContext";
import { toast } from "sonner";
import { submitContact } from "@/lib/services/contact-service";
import { useTranslation } from "react-i18next";
import { contactFormSchema } from "@/lib/validations";
import { useSettings } from "@/hooks/usePublicData";
import { z } from "zod";
import { RootState } from "@/lib/store/store";
import { useSelector } from "react-redux";
import { generateCaptcha } from "@/lib/services/captcha-service";
import { usePhoneLogic } from "@/hooks/usePhoneLogic";

export type ContactFormData = z.infer<ReturnType<typeof contactFormSchema>>;

export function useContactLogic() {
  const { t } = useTranslation();
  const { setFullPageLoading } = useFullPageLoading();
  const client = useSelector((state: RootState) => state.auth.client);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data } = useSettings();
  const configurations = data?.configurations || [];
  const contact_phone = configurations.find(item => item.key === 'contact_phone')?.value;
  const contact_email = configurations.find(item => item.key === 'contact_email')?.value;
  const business_days = configurations.find(item => item.key === 'business_days')?.value;
  const business_hours = configurations.find(item => item.key === 'business_hours')?.value;

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema(t)),
    defaultValues: {
      name: client?.name || "",
      email: client?.email || "",
      phone: client?.phone || "",
      subject: "",
      message: "",
      terms: false,
    },
    mode: "onChange",
  });

  const { register, handleSubmit, setValue, trigger, reset, formState: { errors } } = form;

  // Use centralized phone logic
  const {
    phoneNumber,
    defaultCountry,
    handlePhoneChange: handlePhoneChangeBase,
    extractPhoneNumber,
    setPhoneNumber,
  } = usePhoneLogic({
    initialPhone: client?.phone || undefined,
    onPhoneChange: (formattedPhone) => {
      setValue("phone", formattedPhone, { shouldValidate: true });
      trigger("phone");
    },
  });

  const handlePhoneChange = handlePhoneChangeBase;

  // Reset form when client data is available
  useEffect(() => {
    if (client) {
      reset({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        subject: "",
        message: "",
        terms: false,
      });
    }
  }, [client, reset]);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setFullPageLoading(true);

    try {
      const res = await generateCaptcha();
      if (!res.result || !res.token) {
        toast.error(t("Captcha verification failed, please try again"));
        return;
      }
      const recaptchaToken = res.token;

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("phone", data.phone ?? "");
      formData.append("subject", data.subject);
      formData.append("message", data.message);
      formData.append("recaptcha_token", recaptchaToken);

      const response = await submitContact(formData);
      if (response.result) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        reset({
          name: client?.name || "",
          email: client?.email || "",
          phone: "",
          subject: "",
          message: "",
          terms: false,
        });
        setPhoneNumber(client?.phone ? extractPhoneNumber(client.phone) : "");
        setSubmitted(true);
      }

    } catch (error) {
      toast.error(t("An unexpected error occurred. Please try again."));
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setFullPageLoading(false);
    }
  };


  return {
    form,
    register,
    handleSubmit,
    errors,
    onSubmit,
    isSubmitting,
    submitted,
    setSubmitted,
    phoneNumber,
    handlePhoneChange,
    defaultCountry,
    contact_phone,
    contact_email,
    business_days,
    business_hours
  };
}
