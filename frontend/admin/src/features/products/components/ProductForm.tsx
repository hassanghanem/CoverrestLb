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
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { AvailabilityStatus, Brand, Category, Color, ProductImage, Size, Tag, Warehouse } from "@/types/api.interfaces";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useMemo, useRef } from "react";
import { ProductImagesInput } from "./ProductImagesInput";
import { ProductVariants } from "./ProductVariants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductSpecificationsInput from "./ProductSpecificationsInput";
import { SUPPORTED_LANGS } from "@/i18n";
import { ProductFormValues } from "@/types/form.interfaces";
import BarcodeInput from "@/components/fields/BarcodeInput";
import { FormActions } from "@/components/fields/FormActions";
import { MultiSelect } from "@/components/fields/MultiSelect";
import { getText } from "@/utils/getText";
import { Checkbox } from "@/components/ui/checkbox";

const createFormSchema = (t: (key: string) => string, isEdit: boolean, availabilityIds: string[]) => {
  const MAX_FILE_SIZE = 2 * 1024 * 1024;
  const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

  const imageItemSchema = z.object({
    image: z.union([
      z.instanceof(File)
        .refine(file => ACCEPTED_IMAGE_TYPES.includes(file.type), {
          message: t("Image must be JPEG, JPG, PNG, or GIF"),
        })
        .refine(file => file.size <= MAX_FILE_SIZE, {
          message: t("Image size must be less than 2MB"),
        }),
      z.string().url({ message: t("Image is required") }),
    ]),
    is_active: z.boolean(),
    arrangement: z.number(),
  });

  const imageSchema = isEdit
    ? z.array(imageItemSchema).optional()
    : z.array(imageItemSchema).min(1, { message: t("At least one image is required") });

  const variantsSchema = z
    .array(
      z.object({
        color_id: z.number().nullable().optional(),
        size_id: z.number().nullable().optional(),
        price: z.number().nullable().optional(),
        discount: z.number().min(0).max(100).nullable().optional(),
        open_quantity: z.number().min(1).nullable().optional(),
        warehouse_id: z.number().nullable().optional(),
        cost_per_item: z.number().min(0).nullable().optional(),
      })
    )
    .optional()
    .refine(
      variants =>
        !variants ||
        variants.every(v => v.color_id !== null && v.color_id !== undefined),
      { message: t("Variant requires a color") }
    )
    .refine(
      variants => {
        if (!variants) return true;
        const seen = new Set();
        for (const v of variants) {
          const key = `${v.color_id ?? "null"}-${v.size_id ?? "null"}`;
          if (seen.has(key)) return false;
          seen.add(key);
        }
        return true;
      },
      { message: t("Duplicate variant combinations are not allowed") }
    )
    .refine(
      variants => {
        if (!variants) return true;
        // If open_quantity is provided, warehouse_id must be provided
        return variants.every(v => {
          if (v.open_quantity && v.open_quantity > 0) {
            return (
              v.warehouse_id !== null && v.warehouse_id !== undefined &&
              v.cost_per_item !== null && v.cost_per_item !== undefined
            );
          }
          return true;
        });
      },
      { message: t("Warehouse is required when opening stock is provided") + " / " + t("Cost per item is required") }
    );

  const defaultAvailabilityIds = [
    "available",
    "coming_soon",
    "discontinued",
    "pre_order",
    "out_of_stock",
  ];

  const statusIds = availabilityIds && availabilityIds.length ? availabilityIds : defaultAvailabilityIds;

  return z.object({
    name: z.object(
      SUPPORTED_LANGS.reduce((acc, lang) => {
        acc[lang] = z.string().min(1, t("Name is required"));
        return acc;
      }, {} as Record<string, z.ZodString>)
    ),

    short_description: z.object(
      SUPPORTED_LANGS.reduce((acc, lang) => {
        acc[lang] = z.string().min(0, t("Short description is required"));
        return acc;
      }, {} as Record<string, z.ZodString>)
    ),

    description: z.object(
      SUPPORTED_LANGS.reduce((acc, lang) => {
        acc[lang] = z.string().min(0, t("Description is required"));
        return acc;
      }, {} as Record<string, z.ZodString>)
    ),

    barcode: z.string().min(1, t("Barcode is required")),
    category_id: z
      .union([
        z.undefined(),
        z.number().min(1, { message: t("Category is required") }),
      ])
      .refine(
        (val) => typeof val === "number" && val >= 1,
        { message: t("Category is required") }
      ),
    brand_id: z
      .union([
        z.undefined(),
        z.number().min(1, { message: t("Brand is required") }),
      ])
      .refine(
        (val) => typeof val === "number" && val >= 1,
        { message: t("Brand is required") }
      ),
    availability_status: z
      .enum(statusIds as [string, ...string[]])
      .refine((val) => !!val, { message: t("Availability status is required") }),
    price: z.number().min(0, t("Price must be a positive number")),
    discount: z.number().min(0).max(100, t("Discount must be between 0 and 100")),
    min_order_quantity: z.number().min(1, t("Minimum order quantity must be at least 1")),
    max_order_quantity: z.number().min(0, t("Maximum order quantity must be a positive number")),
    warranty: z.string().max(255).optional().nullable(),
    coupon_eligible: z.boolean().optional().nullable(),
    images: imageSchema,
    tags: z.array(z.number()).optional(),
    variants: variantsSchema,

    specifications: z
      .array(
        z.object({
          description: z.object(
            SUPPORTED_LANGS.reduce((acc, lang) => {
              acc[lang] = z
                .string()
                .min(1, { message: t("Specification description is required") });
              return acc;
            }, {} as Record<string, z.ZodString>)
          ),
        })
      )
      .optional(),
  });
};

interface ProductFormProps {
  onSubmit: (data: z.infer<ReturnType<typeof createFormSchema>>) => void;
  onCancel: () => void;
  onExistingImageUpdate: (productImageId: number, data: { arrangement: number; is_active?: boolean }) => Promise<{ result: boolean; message?: string }>;
  onExistingImageDelete: (productImageId: number) => Promise<{ result: boolean; message?: string }>;
  onExistingVariantDelete: (productVariantId: number) => Promise<{ result: boolean; message?: string }>;
  onExistingVariantImageUpdate: (variantImageId: number, data: { arrangement: number; is_active?: boolean }) => Promise<{ result: boolean; message?: string }>;
  onExistingVariantImageDelete: (variantImageId: number) => Promise<{ result: boolean; message?: string }>;
  onGenerateBarcode: () => Promise<string | null>;
  isEdit?: boolean;
  initialData?: Partial<ProductFormValues>;
  rawProductData?: any;
  colors: Color[];
  sizes: Size[];
  tags: Tag[];
  categories: Category[];
  brands: Brand[];
  warehouses: Warehouse[];
  availabilityOptions: AvailabilityStatus[];
  availabilityDisabled: boolean;
  missingItems: String[];
  onAddCategory?: () => void;
  onAddBrand?: () => void;
  onAddTag?: () => void;
  onAddColor?: () => void;
  onAddSize?: () => void;
}

export const ProductForm = ({
  onSubmit,
  onCancel,
  onExistingImageUpdate,
  onExistingImageDelete,
  onExistingVariantDelete,
  onExistingVariantImageUpdate,
  onExistingVariantImageDelete,
  onGenerateBarcode,
  isEdit = false,
  initialData,
  rawProductData,
  colors,
  sizes,
  tags,
  categories,
  brands,
  warehouses,
  availabilityOptions,
  availabilityDisabled,
  missingItems,
  onAddCategory,
  onAddBrand,
  onAddTag,
  onAddColor,
  onAddSize,
}: ProductFormProps) => {
  const { t, i18n } = useTranslation();
  const availabilityIds = availabilityOptions?.map((opt) => opt.id) || [];
  const formSchema = createFormSchema(t, isEdit, availabilityIds);
  type FormValues = z.infer<typeof formSchema>;

  const defaultMultiLangValue = SUPPORTED_LANGS.reduce((acc, lang) => {
    acc[lang] = "";
    return acc;
  }, {} as Record<string, string>);

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || defaultMultiLangValue,
      short_description: initialData?.short_description || defaultMultiLangValue,
      description: initialData?.description || defaultMultiLangValue,
      barcode: initialData?.barcode || "",
      category_id: initialData?.category_id || undefined,
      brand_id: initialData?.brand_id || undefined,
      availability_status: initialData?.availability_status || "available",
      price: Number(initialData?.price ?? 0),
      discount: Number(initialData?.discount ?? 0),
      min_order_quantity: Number(initialData?.min_order_quantity ?? 1),
      max_order_quantity: Number(initialData?.max_order_quantity ?? 0),
      warranty: initialData?.warranty ?? "",
      coupon_eligible:
        typeof (initialData as any)?.coupon_eligible === "boolean"
          ? (initialData as any).coupon_eligible
          : true,
      images: [],
      tags: initialData?.tags?.map(tag => tag.id) || [],
      variants: [],
      specifications:
        initialData?.specifications?.map(spec => ({
          description: SUPPORTED_LANGS.reduce((acc, lang) => {
            acc[lang] = spec.description?.[lang] ?? "";
            return acc;
          }, {} as Record<string, string>),
        })) || [],
    },
  });

  // Wrapper function to merge existing variants with new variants before submission
  const handleFormSubmit = async (
    data: FormValues,
    topAction?: "move_to_top" | "remove_from_top"
  ) => {
    // Yield to the UI so isSubmitting state renders before any heavy work
    await Promise.resolve();

    // Check if ProductVariants component has attached the _getAllVariants getter
    const getAllVariantsFn =
      (methods as any)?.control?._getAllVariants || (methods as any)._getAllVariants;
    const getExistingVariantNewImagesFn =
      (methods as any)?.control?._getExistingVariantNewImages ||
      (methods as any)._getExistingVariantNewImages;

    // Prefer the getter if available; otherwise fall back to initialData variants (edit mode)
    const allVariants =
      getAllVariantsFn && typeof getAllVariantsFn === "function"
        ? getAllVariantsFn()
        : (initialData?.variants as any[]) || data.variants || [];

    // Get new images for existing variants
    const existingVariantNewImages =
      getExistingVariantNewImagesFn &&
        typeof getExistingVariantNewImagesFn === "function"
        ? getExistingVariantNewImagesFn()
        : {};

    // Avoid mutating RHF submit data directly
    const enhancedData: any = {
      ...data,
      variants: allVariants,
      existingVariantNewImages, // Add this to the form data
    } as FormValues & { existingVariantNewImages: { [variantId: number]: any[] } };

    if (topAction) {
      enhancedData.__topAction = topAction;
    }

    // Call the original onSubmit with merged data
    await onSubmit(enhancedData);
  };

  // Only hydrate form once when initialData arrives to avoid overwriting user edits on refetch
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initialData && !initializedRef.current) {
      initializedRef.current = true;
      methods.reset({
        ...initialData,
        name: initialData.name || defaultMultiLangValue,
        short_description: initialData.short_description || defaultMultiLangValue,
        description: initialData.description || defaultMultiLangValue,
        barcode: initialData.barcode || "",
        category_id: initialData.category_id || undefined,
        brand_id: initialData.brand_id || undefined,
        availability_status: initialData.availability_status || "available",
        price: initialData.price ? Number(initialData.price) : 0,
        discount: initialData.discount ? Number(initialData.discount) : 0,
        min_order_quantity: initialData.min_order_quantity ? Number(initialData.min_order_quantity) : 1,
        max_order_quantity: initialData.max_order_quantity ? Number(initialData.max_order_quantity) : 0,
        warranty: initialData.warranty ?? "",
        coupon_eligible:
          typeof (initialData as any).coupon_eligible === "boolean"
            ? (initialData as any).coupon_eligible
            : true,
        tags: initialData.tags?.map(tag => tag.id) || [],
        images: [], variants: [],
      });
    }
  }, [initialData, methods]);

  const existingVariantsMemo = useMemo(() => (
    Array.isArray(rawProductData?.variants)
      ? rawProductData.variants.map((variant: any) => ({
        id: variant.id,
        sku: variant.sku,
        available_quantity: variant.available_quantity,
        color_id: variant.color?.id ?? null,
        size_id: variant.size?.id ?? null,
        price: variant.price ?? null,
        discount: variant.discount ?? null,
        images: variant.images?.map((img: any) => ({
          id: img.id,
          image: img.image,
          arrangement: img.arrangement,
          is_active: img.is_active,
        })) || [],
      }))
      : []
  ), [rawProductData]);

  return (
    <div className="h-full w-full flex items-center justify-center mb-5 p-7 ">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">  {isEdit ? t("Edit Product") : t("Create Product")}</CardTitle>
        </CardHeader>
        <CardContent>
          {missingItems.length > 0 ? (
            <div className="text-red-500 space-y-2 bg-red-50 border border-red-300 p-4 rounded-md">
              <p className="font-semibold">{t("Missing required data")}</p>
              <ul className="list-disc list-inside">
                {missingItems.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
              {(onAddCategory || onAddBrand || onAddTag || onAddColor || onAddSize) && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {onAddCategory && (
                    <Button type="button" variant="outline" size="sm" onClick={onAddCategory}>
                      {t("Add category")}
                    </Button>
                  )}
                  {onAddBrand && (
                    <Button type="button" variant="outline" size="sm" onClick={onAddBrand}>
                      {t("Add brand")}
                    </Button>
                  )}
                  {onAddTag && (
                    <Button type="button" variant="outline" size="sm" onClick={onAddTag}>
                      {t("Add tag")}
                    </Button>
                  )}
                  {onAddColor && (
                    <Button type="button" variant="outline" size="sm" onClick={onAddColor}>
                      {t("Add color")}
                    </Button>
                  )}
                  {onAddSize && (
                    <Button type="button" variant="outline" size="sm" onClick={onAddSize}>
                      {t("Add size")}
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit((data) => handleFormSubmit(data))}
                className="space-y-4"
              >
                {isEdit && (
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={methods.formState.isSubmitting}
                      onClick={() =>
                        methods.handleSubmit((data) =>
                          handleFormSubmit(data, "move_to_top")
                        )()
                      }
                    >
                      {t("Move to Top")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={methods.formState.isSubmitting}
                      onClick={() =>
                        methods.handleSubmit((data) =>
                          handleFormSubmit(data, "remove_from_top")
                        )()
                      }
                    >
                      {t("Remove from Top")}
                    </Button>
                  </div>
                )}



                <div className="grid gap-4 md:grid-cols-2">
                  <BarcodeInput
                    name="barcode"
                    onGenerateBarcode={onGenerateBarcode}
                    autoGenerateIfEmpty={!isEdit}
                  />
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

                  {SUPPORTED_LANGS.map((lang) => (
                    <FormField
                      key={lang}
                      control={methods.control}
                      name={`short_description.${lang}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("Short Description")} ({lang.toLocaleUpperCase()})
                          </FormLabel>
                          <FormControl>
                            <Input {...field} dir={lang === "ar" ? "rtl" : "ltr"} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}

                  {SUPPORTED_LANGS.map((lang) => (
                    <FormField
                      key={lang}
                      control={methods.control}
                      name={`description.${lang}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("Description")} ({lang.toLocaleUpperCase()})
                          </FormLabel>
                          <FormControl>
                            <Textarea {...field} dir={lang === "ar" ? "rtl" : "ltr"} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}

                  <FormField
                    control={methods.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Price")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === "" ? "" : Number(e.target.value)
                              )
                            }
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Discount")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            step="1"
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === "" ? 0 : Number(e.target.value)
                              )
                            }
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name="min_order_quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Minimum Order Quantity")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === "" ? "" : Number(e.target.value)
                              )
                            }
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name="max_order_quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Maximum Order Quantity")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === "" ? "" : Number(e.target.value)
                              )
                            }
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name="warranty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Warranty")}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />



                  <FormField
                    control={methods.control}
                    name="availability_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Availability Status")}</FormLabel>
                        <FormControl className="w-full">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={initialData?.availability_status?.toString()}
                            disabled={availabilityDisabled}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t("Select status")} />
                            </SelectTrigger>
                            <SelectContent>
                              {availabilityOptions.map((status) => (
                                <SelectItem key={status.id} value={status.id}>
                                  {status.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center justify-between gap-2">
                          <span>{t("Category")}</span>
                          {onAddCategory && (
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              onClick={onAddCategory}
                            >
                              {t("Add Category")}
                            </Button>
                          )}
                        </FormLabel>
                        <FormControl className="w-full">
                          <Select
                            onValueChange={(val) => field.onChange(Number(val))}
                            value={field.value?.toString()}
                            defaultValue={initialData?.category_id?.toString()}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t("Select category")} />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {getText(category.name, i18n.language)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name="brand_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center justify-between gap-2">
                          <span>{t("Brand")}</span>
                          {onAddBrand && (
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              onClick={onAddBrand}
                            >
                              {t("Add Brand")}
                            </Button>
                          )}
                        </FormLabel>
                        <FormControl className="w-full">
                          <Select
                            onValueChange={(val) => field.onChange(Number(val))}
                            value={field.value?.toString()}
                            defaultValue={initialData?.brand_id?.toString()}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t("Select brand")} />
                            </SelectTrigger>
                            <SelectContent>
                              {brands.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id.toString()}>
                                  {brand.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center justify-between gap-2">
                          <span>{t("Tags")}</span>
                          {onAddTag && (
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              onClick={onAddTag}
                            >
                              {t("Add Tag")}
                            </Button>
                          )}
                        </FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={tags.map((tag) => ({ label: tag.name, value: tag.id }))}
                            value={field.value ?? []}
                            onChange={field.onChange}
                            placeholder={t("Select tags")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name="coupon_eligible"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-md border bg-muted/30 px-4 py-3 gap-3">
                        <div className="space-y-1">
                          <FormLabel className="text-sm font-medium">
                            {t("Coupon Eligible")}
                          </FormLabel>
                          <p className="text-xs text-muted-foreground max-w-md">
                            {t("If enabled, coupons and discounts can be applied to this product at checkout.")}
                          </p>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                            className="h-5 w-5"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <ProductImagesInput
                  key={JSON.stringify(initialData?.images)}
                  form={methods}
                  name="images"
                  label={t("Images")}
                  onExistingImageDelete={onExistingImageDelete}
                  onExistingImageUpdate={onExistingImageUpdate}
                  existingImages={
                    Array.isArray(initialData?.images)
                      ? initialData.images
                        .filter((img): img is ProductImage =>
                          img !== null &&
                          typeof img === "object" &&
                          "id" in img &&
                          "image" in img
                        )
                        .map((img) => ({
                          id: img.id,
                          url: img.image,
                          is_active: img.is_active,
                          arrangement: Number(img.arrangement) || 1,
                        }))
                      : []
                  }
                />

                <ProductSpecificationsInput />

                <ProductVariants
                  colors={colors}
                  sizes={sizes}
                  warehouses={warehouses}
                  onAddColor={onAddColor}
                  onAddSize={onAddSize}
                  existingVariants={existingVariantsMemo}
                  onExistingVariantDelete={onExistingVariantDelete}
                  onExistingVariantImageUpdate={onExistingVariantImageUpdate}
                  onExistingVariantImageDelete={onExistingVariantImageDelete}
                />

                <FormActions
                  onCancel={onCancel}
                  isSubmitting={methods.formState.isSubmitting}
                  cancelLabel={t("Cancel")}
                  submitLabel={isEdit ? t("Update") : t("Create")}
                  submitingLabel={isEdit ? t("Updating...") : t("Creating...")}
                />
              </form>
            </FormProvider>
          )}

        </CardContent>
      </Card>
    </div>
  );
};