import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS } from "@/i18n";
import { SizeFormValues } from "@/types/form.interfaces";
import { FormActions } from "@/components/fields/FormActions";

const createFormSchema = (t: (key: string) => string) => {
  return z.object({
    name: z.object(
      SUPPORTED_LANGS.reduce((acc, lang) => {
        acc[lang] = z
          .string()
          .min(1, t("Name is required"))
          .max(191, t("Maximum 191 characters allowed"));
        return acc;
      }, {} as Record<string, z.ZodString>)
    ),
  });
};

interface SizeFormProps {
  onSubmit: (data: z.infer<ReturnType<typeof createFormSchema>>) => void;
  onCancel: () => void;
  isEdit?: boolean;
  initialData?: Partial<SizeFormValues>;
}

export const SizeForm = ({
  onSubmit,
  onCancel,
  isEdit = false,
  initialData,
}: SizeFormProps) => {
  const { t } = useTranslation();
  const schema = createFormSchema(t);
  type FormValues = z.infer<typeof schema>;

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: SUPPORTED_LANGS.reduce((acc, lang) => {
        acc[lang] = initialData?.name?.[lang] || "";
        return acc;
      }, {} as Record<string, string>),
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SUPPORTED_LANGS.map((lang) => (
            <FormField
              key={lang}
              control={methods.control}
              name={`name.${lang}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("Name")} ({lang.toLocaleUpperCase()})
                  </FormLabel>
                  <FormControl>
                    <Input {...field} dir={lang === "ar" ? "rtl" : "ltr"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <FormActions
          onCancel={onCancel}
          isSubmitting={methods.formState.isSubmitting}
          cancelLabel={t("Cancel")}
          submitLabel={isEdit ? t("Update") : t("Create")}
          submitingLabel={isEdit ? t("Updating") : t("Creating")}
        />
      </form>
    </FormProvider>
  );
};
