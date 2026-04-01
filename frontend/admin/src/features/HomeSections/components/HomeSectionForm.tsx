import { FormProvider, useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useTranslation } from "react-i18next";
import { Banner, PaginatedData, ProductSectionItem } from "@/types/api.interfaces";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductSectionFields } from "./ProductSectionFields";
import { BannerFields } from "./BannerFields";
import { HomeSectionFormValues } from "@/types/form.interfaces";
import { SUPPORTED_LANGS } from "@/i18n";
import { FormActions } from "@/components/fields/FormActions";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

const createLangSchema = () =>
  SUPPORTED_LANGS.reduce((acc, lang) => {
    acc[lang] = z.string().max(255);
    return acc;
  }, {} as Record<string, z.ZodString>);

const createBaseImageValidation = (t: (key: string) => string) =>
  z.any()
    .refine(val => !val || val instanceof File || typeof val === "string",
      { message: t("Banner image must be a valid file") })
    .refine(val => !val || typeof val === "string" || (val instanceof File && ACCEPTED_IMAGE_TYPES.includes(val.type)),
      { message: t("Banner image must be JPEG, JPG, PNG, or GIF") })
    .refine(val => !val || typeof val === "string" || (val instanceof File && val.size <= MAX_FILE_SIZE),
      { message: t("Banner image size must be less than 2MB") });

export const createFormSchema = (t: (key: string) => string) => {
  const baseImageValidation = createBaseImageValidation(t);
  const imageRequiredValidation = baseImageValidation.refine(val => !!val,
    { message: t("Banner image is required") });

  const langSchema = createLangSchema();
  const commonBannerFields = {
    home_section_id: z.number().int().optional(),
    link: z.string().url(t("Please enter a valid URL")).max(255).optional().or(z.literal("")),
    title: z.object(langSchema).optional().nullable(),
    subtitle: z.object(langSchema).optional().nullable(),
    arrangement: z.string().min(1, t("Arrangement is required")),
    is_active: z.boolean().optional(),
  };

  const newBannerSchema = z.object({
    isNew: z.literal(true),
    id: z.undefined(),
    image: imageRequiredValidation,
    image_mobile: imageRequiredValidation,
    ...commonBannerFields,
  });

  const existingBannerSchema = z.object({
    isNew: z.literal(false),
    id: z.number().int(),
    image: baseImageValidation.optional(),
    image_mobile: baseImageValidation.optional(),
    ...commonBannerFields,
  });

  const bannerSchema = z.discriminatedUnion("isNew", [newBannerSchema, existingBannerSchema]);

  const productItemSchema = z.object({
    id: z.number().int().optional(),
    product_id: z.number().int().min(1, t("Product is required")),
    home_section_id: z.number().int().optional(),
    arrangement: z.string().optional(),
    is_active: z.boolean().optional(),
  });

  return z.object({
    type: z.string().min(1, t("Type is required")).max(50),
    title: z.object(SUPPORTED_LANGS.reduce((acc, lang) => {
      acc[lang] = z.string().min(1, t("Title is required")).max(255);
      return acc;
    }, {} as Record<string, z.ZodString>)),
    is_active: z.boolean().optional(),
    arrangement: z.string().optional(),
    banners: z.array(bannerSchema).refine(
      banners => new Set(banners.map(b => b.arrangement)).size === banners.length,
      { message: t("All banners must have unique arrangements") }
    ),
    product_section_items: z.array(productItemSchema).optional().refine(
      items => !items || new Set(items.map(item => item.product_id)).size === items.length,
      { message: t("Duplicate products are not allowed") }
    ),
  }).superRefine((data, ctx) => {

    if (data.type === "banner" && !data.banners?.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("At least one banner is required"), path: ["banners"] });
    }
    if (data.type === "product_section" && !data.product_section_items?.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("At least one product is required"), path: ["product_section_items"] });
    }
  });
};

const transformTitleData = (titleData: any) =>
  SUPPORTED_LANGS.reduce((acc, lang) => {
    const value = Array.isArray(titleData) ? titleData[0]?.[lang] : titleData?.[lang];
    acc[lang] = value ?? "";
    return acc;
  }, {} as Record<string, string>);

const getDefaultValues = (initialData?: Partial<HomeSectionFormValues>) => ({
  type: initialData?.type || "product_section",
  title: transformTitleData(initialData?.title),
  arrangement: initialData?.arrangement ? String(initialData.arrangement) : "",
  banners: (initialData?.banners ?? []).map(banner => ({
    id: banner.id,
    home_section_id: banner.home_section_id,
    image: banner.image,
    image_mobile: banner.image_mobile,
    link: banner.link ?? "",
    title: transformTitleData(banner.title),
    subtitle: transformTitleData(banner.subtitle),
    arrangement: banner.arrangement ? String(banner.arrangement) : "",
    is_active: banner.is_active ?? true,
    isNew: false as const,
  })),
  product_section_items: (initialData?.product_section_items ?? []).map(item => ({
    id: item.id,
    product_id: item.product_id,
    home_section_id: item.home_section_id,
    arrangement: item.arrangement ? String(item.arrangement) : "",
    is_active: item.is_active,
  })),
  is_active: initialData?.is_active ?? true,
});

type FormSchema = ReturnType<typeof createFormSchema>;
type FormValues = z.infer<FormSchema>;

const transformFormValues = (formValues: FormValues): HomeSectionFormValues => {
  const banners: Banner[] = formValues.banners.map(banner => {
    const { isNew, ...bannerData } = banner;
    return {
      ...bannerData,
      arrangement: Number(banner.arrangement), id: banner.id ?? 0,
      home_section_id: banner.home_section_id ?? 0,
      link: banner.link ?? "",
      title: banner.title ?? {},
      subtitle: banner.subtitle ?? {},
      is_active: banner.is_active ?? true,
    } as Banner;
  });

  const product_section_items: ProductSectionItem[] = (formValues.product_section_items ?? []).map(item => ({
    ...item,
    arrangement: item.arrangement ? Number(item.arrangement) : 0,
    home_section_id: item.home_section_id ?? 0,
    product: (item as any).product || { id: item.product_id, name: '' }
  } as ProductSectionItem));

  return {
    ...formValues,
    arrangement: formValues.arrangement || "",
    banners,
    product_section_items,
    is_active: formValues.is_active ?? true,
  };
};

interface HomeSectionFormProps<T> {
  onSubmit: (data: HomeSectionFormValues) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
  initialData?: Partial<HomeSectionFormValues>;
  arrangements: string[];
  useAllProductsData: (searchTerm: string) => PaginatedData<T>;
  onExistingBannerDelete: (bannerId: number) => Promise<{ result: boolean; message?: string }>;
}

export function HomeSectionForm<T>({
  onSubmit,
  onCancel,
  isEdit = false,
  initialData,
  arrangements,
  useAllProductsData,
  onExistingBannerDelete,
}: HomeSectionFormProps<T>) {
  const { t } = useTranslation();
  const formSchema = createFormSchema(t);

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    shouldUseNativeValidation: false,
    defaultValues: getDefaultValues(initialData),
  });

  useEffect(() => {
    if (initialData) methods.reset(getDefaultValues(initialData));
  }, [initialData, methods]);

  const type = useWatch({ control: methods.control, name: "type" });

  const handleFormSubmit = async (formData: FormValues) => {
    const transformedData = transformFormValues(formData);
    await onSubmit(transformedData);
  };


  return (
    <div className="h-full w-full flex items-center justify-center mb-5 p-7">
      <Card className="w-full mx-10">
        <CardHeader>
          <CardTitle className="text-2xl">
            {t(isEdit ? "Edit Home Section" : "Create Home Section")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleFormSubmit)} className="space-y-4">
              {isEdit ? (
                <FormItem>
                  <FormLabel>{t("Type")}</FormLabel>
                  <div>{t(`${methods.getValues("type")}`) || t("Select type")}</div>
                </FormItem>
              ) : (
                <FormField control={methods.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Type")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("Select type")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="product_section">{t("Product Section")}</SelectItem>
                        <SelectItem value="banner">{t("Banner")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SUPPORTED_LANGS.map((lang) => (
                  <FormField key={lang} control={methods.control} name={`title.${lang}`} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Title")} ({lang.toLocaleUpperCase()})</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder={t("Enter title")}
                          dir={lang === "ar" ? "rtl" : "ltr"} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                ))}
              </div>

              {isEdit && (
                <FormField control={methods.control} name="arrangement" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Arrangement")}</FormLabel>
                    <FormControl>
                      <Select value={String(field.value)} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("Select arrangement")} />
                        </SelectTrigger>
                        <SelectContent>
                          {arrangements.map((arrangement) => (
                            <SelectItem key={arrangement} value={arrangement}>
                              {arrangement}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}

              {type === "banner" && (
                <BannerFields
                  methods={methods}
                  initialBanners={initialData?.banners}
                  onExistingBannerDelete={onExistingBannerDelete}
                />
              )}

              {type === "product_section" && (
                <ProductSectionFields
                  methods={methods}
                  useAllProductsData={useAllProductsData}
                  existingItems={initialData?.product_section_items}
                />
              )}

              <FormActions
                onCancel={onCancel}
                isSubmitting={methods.formState.isSubmitting}
                cancelLabel={t("Cancel")}
                submitLabel={t(isEdit ? "Update" : "Create")}
                submitingLabel={t(isEdit ? "Updating..." : "Creating...")}
              />
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}