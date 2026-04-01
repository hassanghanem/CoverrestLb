import {
  FormProvider,
  useForm,
} from "react-hook-form";
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
import { Page } from "@/types/api.interfaces";
import { FormActions } from "@/components/fields/FormActions";
import HtmlEditor from "@/components/fields/HtmlEditor";

/**
 * Dynamic Zod schema builder for multilingual page validation
 */
const createFormSchema = (t: (key: string) => string) => {
  return z.object({
    title: z.object(
      SUPPORTED_LANGS.reduce((acc, lang) => {
        acc[lang] = z
          .string()
          .min(1, t("Title is required"))
          .max(255, t("Title must be less than 255 characters"));
        return acc;
      }, {} as Record<string, z.ZodString>)
    ),
    content: z.object(
      SUPPORTED_LANGS.reduce((acc, lang) => {
        acc[lang] = z
          .string()
          .min(1, t("Content is required"));
        return acc;
      }, {} as Record<string, z.ZodString>)
    ),
  });
};

interface PageFormProps {
  onSubmit: (data: z.infer<ReturnType<typeof createFormSchema>>) => void;
  onCancel: () => void;
  isEdit?: boolean;
  initialData?: Partial<Page>;
}

export const PageForm = ({
  onSubmit,
  onCancel,
  isEdit = false,
  initialData,
}: PageFormProps) => {
  const { t } = useTranslation();
  const formSchema = createFormSchema(t);
  type FormValues = z.infer<typeof formSchema>;

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: SUPPORTED_LANGS.reduce((acc, lang) => {
        acc[lang] = initialData?.title?.[lang] || "";
        return acc;
      }, {} as Record<string, string>),
      content: SUPPORTED_LANGS.reduce((acc, lang) => {
        acc[lang] = initialData?.content?.[lang] || "";
        return acc;
      }, {} as Record<string, string>),
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SUPPORTED_LANGS.map((lang) => (
            <FormField
              key={lang}
              control={methods.control}
              name={`title.${lang}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Title")} ({lang.toLocaleUpperCase()})</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      placeholder={`${t("Enter title in")} (${lang.toLocaleUpperCase()})`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {SUPPORTED_LANGS.map((lang) => (
            <FormField
              key={lang}
              control={methods.control}
              name={`content.${lang}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>  {t("Content")} ({lang.toLocaleUpperCase()})</FormLabel>
                  <FormControl>
                    <HtmlEditor
                      key={`editor-${lang}`}
                      value={field.value}
                      onChange={field.onChange}
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      placeholder={`${t("Enter content in")} (${lang.toLocaleUpperCase()})`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        {/* FORM ACTIONS */}
        <FormActions
          onCancel={onCancel}
          isSubmitting={methods.formState.isSubmitting}
          cancelLabel={t("Cancel")}
          submitLabel={isEdit ? t("Update") : t("Save")}
          submitingLabel={isEdit ? t("Updating...") : t("Saving...")}
        />
      </form>
    </FormProvider>
  );
};