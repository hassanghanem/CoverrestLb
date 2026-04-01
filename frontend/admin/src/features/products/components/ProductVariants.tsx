import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Color, Size, Warehouse } from "@/types/api.interfaces";
import { Printer, Trash2Icon } from "lucide-react";
import { Icons } from "@/components/public/icons";
import { ProductImagesInput } from "./ProductImagesInput";
import { useState, useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StockAdjustmentForm } from "@/features/StockAdjustments/components/StockAdjustmentForm";
import { createStockManualAdjustment } from "@/lib/services/StockAdjustments-services";
import { toast } from "sonner";
import type { StockAdjustmentFormValues } from "@/features/StockAdjustments/components/StockAdjustmentForm";
import { BulkVariantGeneratorDialog } from "./BulkVariantGeneratorDialog.tsx";
import { openBulkBarcodesPrint } from "@/lib/services/Products-services";

interface VariantFormData {
  color_id: number;
  size_id: number;
  price: number;
  discount: number;
  index?: number;
  images?: File[];
  open_quantity?: number | null;
  warehouse_id?: number | null;
  cost_per_item?: number | null;
}

export function buildVariantsFormData({ minOrderQuantity, maxOrderQuantity, variants }: {
  minOrderQuantity: number;
  maxOrderQuantity: number;
  variants: VariantFormData[];
}): FormData {
  const formData = new FormData();
  formData.append("min_order_quantity", String(minOrderQuantity));
  formData.append("max_order_quantity", String(maxOrderQuantity));
  variants.forEach((variant: VariantFormData, idx: number) => {
    formData.append(`variants[${idx}][color_id]`, String(variant.color_id));
    formData.append(`variants[${idx}][size_id]`, String(variant.size_id));
    formData.append(`variants[${idx}][price]`, String(variant.price));
    formData.append(`variants[${idx}][discount]`, String(variant.discount));
    formData.append(`variants[${idx}][index]`, String(idx));
    if (variant.images && Array.isArray(variant.images) && variant.images.length > 0) {
      const validFiles = variant.images.filter((img: any) => img instanceof File && img.size > 0);
      validFiles.forEach((file: File, imgIdx: number) => {
        formData.append(`variants[${idx}][images][${imgIdx}]`, file);
      });
    }
    if (variant.open_quantity !== undefined && variant.open_quantity !== null) {
      formData.append(`variants[${idx}][open_quantity]`, String(variant.open_quantity));
    }
    if (variant.warehouse_id !== undefined && variant.warehouse_id !== null) {
      formData.append(`variants[${idx}][warehouse_id]`, String(variant.warehouse_id));
    }
    if (variant.cost_per_item !== undefined && variant.cost_per_item !== null) {
      formData.append(`variants[${idx}][cost_per_item]`, String(variant.cost_per_item));
    }
  });
  return formData;
}

interface ProductVariantsProps {
  colors: Color[];
  sizes: Size[];
  warehouses: Warehouse[];
  onAddColor?: () => void;
  onAddSize?: () => void;
  existingVariants?: {
    id: number;
    color_id: number | null;
    size_id: number | null;
    price?: number | null;
    discount?: number | null;
    available_quantity?: number;
    sku?: string;
    images?: {
      id: number;
      image: string;
      arrangement: number;
      is_active: boolean;
    }[];
  }[];
  onExistingVariantDelete: (
    variantId: number
  ) => Promise<{ result: boolean; message?: string }>;
  onExistingVariantImageUpdate: (
    variantImageId: number,
    data: { arrangement: number; is_active?: boolean }
  ) => Promise<{ result: boolean; message?: string }>;
  onExistingVariantImageDelete: (
    variantImageId: number
  ) => Promise<{ result: boolean; message?: string }>;
}

export const ProductVariants = ({
  colors,
  sizes,
  warehouses,
  onAddColor,
  onAddSize,
  existingVariants = [],
  onExistingVariantDelete,
  onExistingVariantImageUpdate,
  onExistingVariantImageDelete,
}: ProductVariantsProps) => {

  const { t } = useTranslation();
  const form = useFormContext();
  const {
    control,
    formState: { errors },
  } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });
  const [existingVariantUpdates, setExistingVariantUpdates] = useState<{
    [key: number]: { price?: number | null; discount?: number | null };
  }>({});

  const [existingVariantStock, setExistingVariantStock] = useState<Record<number, number>>({});

  const [openStockDialogId, setOpenStockDialogId] = useState<number | null>(null);
  const [selectedExistingVariantIds, setSelectedExistingVariantIds] = useState<number[]>([]);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

  const [bulkValues, setBulkValues] = useState<{
    price: string; // keep as string for input
    discount: string;
  }>({ price: "", discount: "" });

  useEffect(() => {
    if (existingVariants.length > 0) {
      const initialUpdates: typeof existingVariantUpdates = {};
      const initialStock: Record<number, number> = {};
      existingVariants.forEach((variant) => {
        initialUpdates[variant.id] = {
          price: variant.price,
          discount: variant.discount,
        };
        initialStock[variant.id] = variant.available_quantity ?? 0;
        if (initialStock[variant.id] === 0 && variant.available_quantity !== undefined) {
          initialStock[variant.id] = variant.available_quantity;
        }
      });
      setExistingVariantUpdates(initialUpdates);
      setExistingVariantStock(initialStock);
    }
  }, [existingVariants]);

  useEffect(() => {
    const getAllVariants = () => {
      const newVariants = form.getValues("variants") || [];

      if (!existingVariants || existingVariants.length === 0) {
        return newVariants.map((variant: any, idx: number) => {
          const images = form.getValues(`variants.${idx}.images`) || [];
          const validImages = Array.isArray(images) ? images.filter((img: any) => img?.image instanceof File) : [];
          return {
            ...variant,
            images: validImages,
          };
        });
      }

      const existingVariantsWithUpdates = existingVariants.map((variant) => {
        const updates = existingVariantUpdates[variant.id];

        const newImagesFieldName = `existing_variant_${variant.id}_images`;
        const newImages = form.getValues(newImagesFieldName) || [];

        return {
          id: variant.id,
          color_id: variant.color_id,
          size_id: variant.size_id,
          price: updates?.price !== undefined ? updates.price : variant.price,
          discount: updates?.discount !== undefined ? updates.discount : variant.discount,
          images: newImages.length > 0 ? newImages : undefined,
        };
      });

      const newVariantsWithImages = newVariants.map((variant: any, idx: number) => {
        const images = form.getValues(`variants.${idx}.images`) || [];
        const validImages = Array.isArray(images) ? images.filter((img: any) => img?.image instanceof File) : [];
        return {
          ...variant,
          images: validImages,
        };
      });

      return [...existingVariantsWithUpdates, ...newVariantsWithImages];
    };

    if ((form as any)?.control) {
      (form as any).control._getAllVariants = getAllVariants;
    } else {
      (form as any)._getAllVariants = getAllVariants;
    }

    const getExistingVariantNewImages = () => {
      const result: { [variantId: number]: any[] } = {};

      existingVariants.forEach((variant) => {
        const newImagesFieldName = `existing_variant_${variant.id}_images`;
        const newImages = form.getValues(newImagesFieldName) || [];


        if (newImages.length > 0) {
          result[variant.id] = newImages;
        }
      });

      return result;
    };

    if ((form as any)?.control) {
      (form as any).control._getExistingVariantNewImages = getExistingVariantNewImages;
    } else {
      (form as any)._getExistingVariantNewImages = getExistingVariantNewImages;
    }
  }, [existingVariantUpdates, existingVariants, form]);

  const handleDelete = async (variantId: number) => {
    try {
      const response = await onExistingVariantDelete(variantId);
      if (!response?.result) return;
    } catch {
      return;
    }
  };

  const handleExistingVariantChange = (
    variantId: number,
    field: "price" | "discount",
    value: string
  ) => {
    setExistingVariantUpdates((prev) => ({
      ...prev,
      [variantId]: {
        ...prev[variantId],
        [field]: value === "" ? null : Number(value),
      },
    }));
  };

  async function handleStockAdjustmentSubmit(
    variant: { id: number },
    data: StockAdjustmentFormValues
  ) {
    try {
      const payload = { ...data, variant_id: variant.id };
      const result = await createStockManualAdjustment(payload);
      if (result?.result) {
        setExistingVariantStock((prev) => {
          const current =
            prev[variant.id] ??
            existingVariants.find((v) => v.id === variant.id)?.available_quantity ??
            0;
          const delta = data.direction === "increase" ? data.quantity : -data.quantity;
          return { ...prev, [variant.id]: Math.max(0, current + delta) };
        });
        setOpenStockDialogId(null);
      }
    } catch (e) {
      toast.error("Failed to adjust stock");
    }
  }
  const toggleSelectedVariant = (id: number) => {
    setSelectedExistingVariantIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllExisting = () => {
    setSelectedExistingVariantIds(existingVariants.map((v) => v.id));
  };

  const clearSelection = () => setSelectedExistingVariantIds([]);

  const applyBulkUpdate = () => {
    // only apply fields that are actually filled
    const priceToSet =
      bulkValues.price.trim() === "" ? undefined : Number(bulkValues.price);
    const discountToSet =
      bulkValues.discount.trim() === "" ? undefined : Number(bulkValues.discount);

    if (priceToSet === undefined && discountToSet === undefined) return;

    setExistingVariantUpdates((prev) => {
      const next = { ...prev };
      for (const id of selectedExistingVariantIds) {
        next[id] = {
          ...next[id],
          ...(priceToSet !== undefined ? { price: priceToSet } : {}),
          ...(discountToSet !== undefined ? { discount: discountToSet } : {}),
        };
      }
      return next;
    });

    setBulkDialogOpen(false);
    setBulkValues({ price: "", discount: "" });
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-lg font-semibold">{t("Variants")}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {onAddColor && (
            <Button type="button" size="sm" variant="outline" onClick={onAddColor} className="flex-1 sm:flex-none">
              {t("Add color")}
            </Button>
          )}
          {onAddSize && (
            <Button type="button" size="sm" variant="outline" onClick={onAddSize} className="flex-1 sm:flex-none">
              {t("Add size")}
            </Button>
          )}
        </div>
      </div>

      {errors.variants?.root?.message && (
        <p className="text-destructive text-sm font-medium">
          {errors.variants.root.message as string}
        </p>
      )}

      {existingVariants.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">{t("Existing Variants")}</h4>
          {existingVariants.map((variant) => (
            <div
              key={variant.id}
              className="relative p-3 sm:p-4 rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Top row: SKU and actions - responsive layout */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedExistingVariantIds.includes(variant.id)}
                      onChange={() => toggleSelectedVariant(variant.id)}
                      aria-label={t("Select variant")}
                    />
                    <span className="text-xs font-semibold">{t("SKU")}:</span>
                    {variant.sku ? (
                      <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono tracking-wider">
                        {variant.sku}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">{t("No SKU")}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {t("Available")}: {existingVariantStock[variant.id] ?? variant.available_quantity ?? 0}
                  </span>
                  <Dialog open={openStockDialogId === variant.id} onOpenChange={(open) => setOpenStockDialogId(open ? variant.id : null)}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto">
                        {t("Adjust Stock")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("Stock Adjustment")}</DialogTitle>
                        <DialogDescription>{t("Add or remove stock for this variant.")}</DialogDescription>
                      </DialogHeader>
                      <StockAdjustmentForm
                        onSubmit={(data) => handleStockAdjustmentSubmit(variant, data)}
                        onCancel={() => setOpenStockDialogId(null)}
                        warehouses={warehouses}
                        useProductVariantData={() => ({
                          items: [variant],
                          hasNextPage: false,
                          isLoading: false,
                          isFetchingNextPage: false,
                          fetchNextPage: () => { },
                          isError: false,
                        })}
                        fixedVariantId={variant.id}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await openBulkBarcodesPrint({ variantIds: [variant.id] });
                    }}
                  >
                    <Printer className="w-4 h-4 mr-1" />
                    {t("Print Barcode")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDelete(variant.id)}
                    aria-label={t("Delete")}
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                <FormItem className="w-full">
                  <FormLabel className="text-xs font-semibold">{t("Color")}</FormLabel>
                  <Select disabled value={variant.color_id?.toString() || ""}>
                    <SelectTrigger className="w-full bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
                <FormItem className="w-full">
                  <FormLabel className="text-xs font-semibold">{t("Size")}</FormLabel>
                  <Select disabled value={variant.size_id?.toString() || ""}>
                    <SelectTrigger className="w-full bg-muted/50">
                      <SelectValue placeholder={t("N/A")} />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
                <FormItem className="w-full">
                  <FormLabel className="text-xs font-semibold">{t("Price")}</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={
                      existingVariantUpdates[variant.id]?.price !== undefined &&
                        existingVariantUpdates[variant.id]?.price !== null
                        ? String(existingVariantUpdates[variant.id]?.price)
                        : ""
                    }
                    onChange={(e) =>
                      handleExistingVariantChange(variant.id, "price", e.target.value)
                    }
                    placeholder={t("Default")}
                  />
                </FormItem>
                <FormItem className="w-full">
                  <FormLabel className="text-xs font-semibold">{t("Discount")} %</FormLabel>
                  <Input
                    type="number"
                    value={
                      existingVariantUpdates[variant.id]?.discount !== undefined &&
                        existingVariantUpdates[variant.id]?.discount !== null
                        ? String(existingVariantUpdates[variant.id]?.discount)
                        : ""
                    }
                    onChange={(e) =>
                      handleExistingVariantChange(variant.id, "discount", e.target.value)
                    }
                    placeholder={t("Default")}
                  />
                </FormItem>
              </div>

              {/* Variant Images */}
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                <ProductImagesInput
                  form={form}
                  name={`existing_variant_${variant.id}_images`}
                  label="Images"
                  existingImages={(variant.images || []).map((img) => ({
                    id: img.id,
                    url: img.image,
                    arrangement: img.arrangement,
                    is_active: img.is_active,
                  }))}
                  onExistingImageUpdate={onExistingVariantImageUpdate}
                  onExistingImageDelete={onExistingVariantImageDelete}
                />
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={selectAllExisting}
              disabled={existingVariants.length === 0}
            >
              {t("Select all")}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={clearSelection}
              disabled={selectedExistingVariantIds.length === 0}
            >
              {t("Clear")}
            </Button>

            <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  disabled={selectedExistingVariantIds.length === 0}
                >
                  {t("Bulk update")} ({selectedExistingVariantIds.length})
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("Bulk update selected variants")}</DialogTitle>
                  <DialogDescription>
                    {t("Only filled fields will be updated.")}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">{t("Price")}</FormLabel>
                    <Input
                      type="number"
                      step="0.01"
                      value={bulkValues.price}
                      onChange={(e) => setBulkValues((p) => ({ ...p, price: e.target.value }))}
                      placeholder={t("Leave empty to keep")}
                    />
                  </FormItem>

                  <FormItem>
                    <FormLabel className="text-xs font-semibold">{t("Discount")} %</FormLabel>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={bulkValues.discount}
                      onChange={(e) => setBulkValues((p) => ({ ...p, discount: e.target.value }))}
                      placeholder={t("Leave empty to keep")}
                    />
                  </FormItem>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setBulkDialogOpen(false)}>
                    {t("Cancel")}
                  </Button>
                  <Button type="button" onClick={applyBulkUpdate}>
                    {t("Apply")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

        </div>
      )}
      {fields.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">{t("New Variants")}</h4>
        </div>
      )}

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="relative p-4 rounded-lg border border-primary/20  shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="space-y-4">
            {/* Row 1: Color and Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={control}
                name={`variants.${index}.color_id`}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-xs font-semibold flex items-center gap-1">
                      {t("Color")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(val) =>
                          field.onChange(val ? Number(val) : null)
                        }
                        value={field.value !== null ? field.value.toString() : ""}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("Select color")} />
                        </SelectTrigger>
                        <SelectContent>
                          {colors.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.name.en}
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
                control={control}
                name={`variants.${index}.size_id`}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-xs font-semibold">{t("Size")}</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(val) =>
                          field.onChange(val ? Number(val) : null)
                        }
                        value={field.value !== null ? field.value.toString() : ""}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("Select size")} />
                        </SelectTrigger>
                        <SelectContent>
                          {sizes.map((s) => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                              {s.name.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 2: Price and Discount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={control}
                name={`variants.${index}.price`}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-xs font-semibold text-muted-foreground">
                      {t("Price")} <span className="text-xs">({t("Optional")})</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={t("Use product price")}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`variants.${index}.discount`}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-xs font-semibold text-muted-foreground">
                      {t("Discount")} % <span className="text-xs">({t("Optional")})</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder={t("Use product discount")}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 3: Stock, Cost Per Item, and Warehouse */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={control}
                name={`variants.${index}.open_quantity`}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-xs font-semibold text-muted-foreground">
                      {t("Opening Stock")} <span className="text-xs">({t("Optional")})</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t("Initial stock quantity")}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`variants.${index}.cost_per_item`}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-xs font-semibold text-muted-foreground">
                      {t("Cost Per Item")} <span className="text-xs">({t("Required if stock")})</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={t("Enter cost per item")}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`variants.${index}.warehouse_id`}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-xs font-semibold text-muted-foreground">
                      {t("Warehouse")} <span className="text-xs">({t("Required if stock")})</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(val) =>
                          field.onChange(val ? Number(val) : null)
                        }
                        value={field.value !== null && field.value !== undefined ? String(field.value) : ""}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("Select warehouse")} />
                        </SelectTrigger>
                        <SelectContent>
                          {warehouses.map((w) => (
                            <SelectItem key={w.id} value={w.id.toString()}>
                              {w.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 4: Variant Images */}
            <div className="pt-4 border-t">
              <ProductImagesInput
                form={form}
                key={`variant-images-${index}-${field.id}`}
                name={`variants.${index}.images`}
                label={t("Variant Images (Optional)")}
                existingImages={[]}
                onExistingImageUpdate={onExistingVariantImageUpdate}
                onExistingImageDelete={onExistingVariantImageDelete}
              />
            </div>
          </div>

          {/* Delete Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => remove(index)}
            aria-label={t("Remove variant")}
          >
            <Trash2Icon className="w-4 h-4" />
          </Button>
        </div>
      ))}

      <div className="flex justify-center pt-4 gap-3 flex-wrap">
        <Button
          type="button"
          variant="outline"
          onClick={() => append({
            color_id: null,
            size_id: null,
            price: null,
            discount: null,
            open_quantity: null,
            warehouse_id: null,
          })}
        >
          <Icons.add className="w-4 h-4" />
          {t("Add variant")}
        </Button>
        <BulkVariantGeneratorDialog
          colors={colors}
          sizes={sizes}
          warehouses={warehouses}
          onAddVariants={(variants) => append(variants)}
        />

      </div>
    </div>
  );
};