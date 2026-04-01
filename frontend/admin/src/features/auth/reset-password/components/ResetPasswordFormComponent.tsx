import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { resetPassword } from "@/lib/services/Auth-services";
import AuthCardComponent from "../../components/AuthCardComponent";
import { generateCaptcha } from "@/lib/services/Captcha-services";
import PasswordInput from "@/components/fields/password-input";
import SubmitButton from "@/components/fields/SubmitButton";

function ResetPasswordFormComponent({ token, email }: { token: string; email: string }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const formSchema = z
    .object({
      password: z
        .string()
        .min(8, { message: t("Password must be at least 8 characters") })
        .regex(/[A-Z]/, { message: t("Password must include at least one uppercase letter") })
        .regex(/[a-z]/, { message: t("Password must include at least one lowercase letter") })
        .regex(/[0-9]/, { message: t("Password must include at least one number") })
        .regex(/[^A-Za-z0-9]/, { message: t("Password must include at least one special character") }),
      password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t("Passwords must match"),
      path: ["password_confirmation"],
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", password_confirmation: "" },
  });

  if (!token || !email) {
    navigate("/");
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!token || !email) {
      toast.error(t("Invalid or missing token and email."));
      return;
    }

    const res = await generateCaptcha();
    if (!res.result || !res.token) {
      toast.error(t("Captcha verification failed, please try again"));
      return;
    }

    const recaptchaToken = res.token;
    const response = await resetPassword(token, email, data.password, data.password_confirmation, recaptchaToken);

    if (response.result) {
      navigate("/");
    }
  };

  return (
    <AuthCardComponent
      title={t("Reset Password")}
      description={t("Enter a new password to reset your account")}
    >
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <PasswordInput id="password" name="password" label={t("New Password")} />
          <PasswordInput id="password_confirmation" name="password_confirmation" label={t("Confirm Password")} />
          <SubmitButton pendingLabel={t("Resetting...")} disabled={form.formState.isSubmitting}>
            {t("Reset Password")}
          </SubmitButton>
        </form>
      </FormProvider>
    </AuthCardComponent>
  );
}

export default ResetPasswordFormComponent;
