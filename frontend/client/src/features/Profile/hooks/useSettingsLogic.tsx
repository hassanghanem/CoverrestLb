import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useFullPageLoading } from "@/context/FullPageLoadingContext";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { RootState } from "@/lib/store/store";
import { updateProfile } from "@/lib/services/profile-service";
import { useQueryClient } from "@tanstack/react-query";
import { AccountDetailsFormData, accountDetailsFormSchema } from "@/lib/validations";
import { usePhoneLogic } from "@/hooks/usePhoneLogic";

export function useSettingsLogic() {
  const { t } = useTranslation();

  const client = useSelector((state: RootState) => state.auth.client);
  const { setFullPageLoading } = useFullPageLoading();
  const queryClient = useQueryClient();

  const [notifications, setNotifications] = useState({
    orderUpdates: client?.order_updates ?? true,
    newsletter: client?.newsletter ?? true,
  });

  const parseBirthdate = (birthdate?: string) => {
    if (!birthdate) return { day: "", month: "", year: "" };

    try {
      const date = new Date(birthdate);
      if (isNaN(date.getTime())) return { day: "", month: "", year: "" };

      return {
        day: date.getDate().toString(),
        month: (date.getMonth() + 1).toString(),
        year: date.getFullYear().toString(),
      };
    } catch {
      return { day: "", month: "", year: "" };
    }
  };

  // Use centralized phone logic
  const {
    phoneNumber,
    defaultCountry,
    handlePhoneChange,
  } = usePhoneLogic({
    initialPhone: client?.phone || undefined,
    onPhoneChange: (formattedPhone) => {
      setValue("phone", formattedPhone, { shouldValidate: true });
      trigger("phone");
    },
  });

  const getDefaultValues = (): AccountDetailsFormData => {
    const { day, month, year } = parseBirthdate(client?.birthdate!);

    return {
      name: client?.name ?? "",
      email: client?.email ?? "",
      birthdate: client?.birthdate ?? "",
      gender: client?.gender ?? "",
      phone: client?.phone ?? "",
      birthDay: day,
      birthMonth: month,
      birthYear: year,
    };
  };

  const form = useForm<AccountDetailsFormData>({
    resolver: zodResolver(accountDetailsFormSchema(t)),
    defaultValues: getDefaultValues(),
    mode: "onChange",
  });

  const { setValue, reset, watch, trigger } = form;

  const onSubmit = async (data: AccountDetailsFormData) => {
    setFullPageLoading(true);
    try {
      const birthdate =
        data.birthYear && data.birthMonth && data.birthDay
          ? `${data.birthYear}-${data.birthMonth.padStart(2, "0")}-${data.birthDay.padStart(2, "0")}`
          : data.birthdate;

      const response = await updateProfile({
        name: data.name,
        gender: data.gender,
        birthdate,
        phone: data.phone,
        order_updates: notifications.orderUpdates,
        newsletter: notifications.newsletter,
      });

      if (response.result) {
        queryClient.invalidateQueries({ queryKey: ["getCurrentUser"] });
        reset(getDefaultValues());
      } else {
      form.reset(); 

       }
    } catch (error: any) {
      toast.error(error.message || t("Something went wrong"));
    } finally {
      setFullPageLoading(false);
    }
  };



  const handleBirthMonthChange = (val: string) => {
    setValue("birthMonth", val, { shouldDirty: true });
    trigger("birthMonth");
  };

  const handleBirthDayChange = (val: string) => {
    setValue("birthDay", val, { shouldDirty: true });
    trigger("birthDay");
  };

  const handleBirthYearChange = (val: string) => {
    setValue("birthYear", val, { shouldDirty: true });
    trigger("birthYear");
  };

  const handleGenderChange = (val: string) => {
    setValue("gender", val, { shouldDirty: true });
    trigger("gender");
  };

  useEffect(() => {
    if (client) {
      setNotifications({
        orderUpdates: client.order_updates ?? true,
        newsletter: client.newsletter ?? true,
      });
    }
  }, [client]);

  useEffect(() => {
    if (client) {
      const defaultValues = getDefaultValues();
      reset(defaultValues);
    }
  }, [client, reset]);

  const handleNotificationChange = async (key: keyof typeof notifications, checked: boolean) => {
    const newNotifications = { ...notifications, [key]: checked };
    setNotifications(newNotifications);

    try {
      setFullPageLoading(true);
      const response = await updateProfile({
        name: watch("name"),
        gender: watch("gender"),
        birthdate: watch("birthdate"),
        phone: watch("phone"),
        order_updates: newNotifications.orderUpdates,
        newsletter: newNotifications.newsletter,
      });

      if (response.result) {
        queryClient.invalidateQueries({ queryKey: ["getCurrentUser"] });

      }
      reset(getDefaultValues());
    } catch (error: any) {
      setNotifications(notifications);
      toast.error(error.message || t("Something went wrong") || "Something went wrong");
    } finally {
      setFullPageLoading(false);
    }
  };

  return {
    form,
    onSubmit,
    phoneNumber,
    defaultCountry,
    watch,
    setValue,
    notifications,
    setNotifications,
    handleNotificationChange,
    handlePhoneChange,
    handleBirthMonthChange,
    handleBirthDayChange,
    handleBirthYearChange,
    handleGenderChange,
  };
}
