import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { forgetPassword } from "@/lib/services/Auth-services";
import AuthCardComponent from "../../components/AuthCardComponent";
import { generateCaptcha } from "@/lib/services/Captcha-services";
import SubmitButton from "@/components/fields/SubmitButton";

function ForgetPasswordFormComponent() {
  const { t } = useTranslation();

  const formSchema = z.object({
    email: z
      .string()
      .min(1, { message: t("Email is required") })
      .email({ message: t("Please enter a valid email address") }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const res = await generateCaptcha();

    if (!res.result || !res.token) {
      toast.error(t("Captcha verification failed, please try again"));
      return;
    }

    const recaptchaToken = res.token;
    await forgetPassword(data.email, recaptchaToken);
  };

  return (
    <AuthCardComponent
      title={t("Forgot Password")}
      description={t("Enter your email address below and we'll send you a link to reset your password")}
    >
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Email")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("Enter your email")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <SubmitButton
            pendingLabel={t("Sending...")}
            disabled={form.formState.isSubmitting}
          >
            {t("Send reset link")}
          </SubmitButton>
        </form>
      </FormProvider>
    </AuthCardComponent>
  );
}

export default ForgetPasswordFormComponent;
