import { FC } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";


import { useTranslation } from "react-i18next";
import { changePassword } from "@/lib/services/Profile-services";
import PasswordInput from "@/components/fields/password-input";
import SubmitButton from "@/components/fields/SubmitButton";

const ChangePassword: FC = () => {
  const { t } = useTranslation();

  const formSchema = z
    .object({
      current_password: z.string().min(8, { message: t("Password must be at least 8 characters") }),
      new_password: z
        .string()
        .min(8, { message: t("Password must be at least 8 characters") })
        .regex(/[A-Z]/, { message: t("Password must contain at least one uppercase letter") })
        .regex(/[a-z]/, { message: t("Password must contain at least one lowercase letter") })
        .regex(/[0-9]/, { message: t("Password must contain at least one number") })
        .regex(/[^A-Za-z0-9]/, { message: t("Password must contain at least one special character") }),
      new_password_confirmation: z.string(),
    })
    .refine((data) => data.new_password === data.new_password_confirmation, {
      message: t("Passwords must match"),
      path: ["new_password_confirmation"],
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { current_password: "", new_password: "", new_password_confirmation: "" },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const response = await changePassword(
      data.current_password,
      data.new_password,
      data.new_password_confirmation
    );
    if (response.result) {
      form.reset();
    } else {
      toast.error(response.message);
    }
  };

  return (
    <FormProvider {...form}>
      <Card>
        <CardHeader>
          <CardTitle>{t("Change password")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <PasswordInput
              id="current_password"
              name="current_password"
              label={t("Current password")}
            />
            <PasswordInput
              id="new_password"
              name="new_password"
              label={t("New password")}
            />
            <PasswordInput
              id="new_password_confirmation"
              name="new_password_confirmation"
              label={t("Confirm new password")}
            />

            <SubmitButton pendingLabel={t("Updating...")} disabled={form.formState.isSubmitting}>
              {t("Update password")}
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
};

export default ChangePassword;
