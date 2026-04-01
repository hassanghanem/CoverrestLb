"use client";

import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS } from "@/i18n";
import { CategoryFormValues } from "@/types/form.interfaces";
import { FormActions } from "@/components/fields/FormActions";
import { ImageUploadInput } from "@/components/fields/ImageUploadInput";

const createFormSchema = (
  t: (key: string) => string,
  isEdit: boolean
) => {
  const baseImageSchema = z
    .any()
    .refine((val) => val === null || val instanceof File, { message: t("Image must be a valid file") })
    .refine(
      (val) => val === null || (val instanceof File && ["image/jpeg", "image/png", "image/jpg", "image/gif"].includes(val.type)),
      { message: t("Image must be jpeg, png, jpg, or gif") }
    )
    .refine(
      (val) => val === null || (val instanceof File && val.size <= 2 * 1024 * 1024),
      { message: t("Image size must be less than 2MB") }
    );

  const imageSchema = isEdit
    ? z.union([baseImageSchema, z.string().url()]).optional()
    : baseImageSchema.nullable().refine((val) => val !== null && val !== undefined, { message: t("Image is required") });

  return z.object({
    name: z.object(
      SUPPORTED_LANGS.reduce((acc, lang) => {
        acc[lang] = z
          .string()
          .min(1, t(`Name is required`))
          .max(191, t("Max length is 191 characters"));
        return acc;
      }, {} as Record<string, z.ZodString>)
    ),
    arrangement: z.string().optional(),
    image: imageSchema,
  });
};

interface CategoryFormProps {
  onSubmit: (data: z.infer<ReturnType<typeof createFormSchema>>) => void;
  onCancel: () => void;
  isEdit?: boolean;
  initialData?: Partial<CategoryFormValues>;
  arrangements: string[];
}

export const CategoryForm = ({
  onSubmit,
  onCancel,
  isEdit = false,
  initialData,
  arrangements,
}: CategoryFormProps) => {
  const { t } = useTranslation();
  const formSchema = createFormSchema(t, isEdit);
  type FormValues = z.infer<typeof formSchema>;

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: SUPPORTED_LANGS.reduce((acc, lang) => {
        acc[lang] = initialData?.name?.[lang] || "";
        return acc;
      }, {} as Record<string, string>),
      arrangement: initialData?.arrangement ? String(initialData.arrangement) : "",
      image: initialData?.image || null,
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <div className={`grid gap-4 ${SUPPORTED_LANGS.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
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

        {isEdit && (
          <FormField
            control={methods.control}
            name="arrangement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Arrangement")}</FormLabel>
                <FormControl>
                  <Select value={String(field.value)} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select arrangement")} />
                    </SelectTrigger>
                    <SelectContent>
                      {arrangements.map((arrangement) => (
                        <SelectItem key={arrangement} value={String(arrangement)}>
                          {arrangement}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <ImageUploadInput
          form={methods}
          name="image"
          label={t("Image")}
          existingImageUrl={typeof initialData?.image === "string" ? initialData.image : undefined}
        />

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
