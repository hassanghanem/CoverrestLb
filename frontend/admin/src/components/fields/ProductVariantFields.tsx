import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PaginatedData } from "@/types/api.interfaces";
import { Card, CardContent } from "@/components/ui/card";
import { SearchablePaginatedSelect } from "./SearchablePaginatedSelect";

interface ProductVariantFieldsProps<T> {
  methods: UseFormReturn<any>;
  useAllVariantsData: (search: string) => PaginatedData<T & { available_quantity?: number }>;
  allVariants?: (T & { available_quantity?: number })[];
  isPreOrder?: boolean;
}

export function ProductVariantFields<T>({
  methods,
  useAllVariantsData,
  allVariants: passedVariants,
  isPreOrder = false,
}: ProductVariantFieldsProps<T>) {
  const { t } = useTranslation();
  const { control, watch, formState, setValue, setError, clearErrors } = methods;
  const { fields, remove } = useFieldArray({ control, name: "products" });
  const products = watch("products");
  
  // Use passed variants or fetch if not provided
  const variantsData = useAllVariantsData("");
  const allVariants = passedVariants || variantsData.items || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t("Products")}</h3>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setValue("products", [...products, { variant_id: 0, quantity: 1 }])
          }
        >
          {t("Add product")}
        </Button>
      </div>

      {formState.errors.products?.root && (
        <p className="text-red-600 text-sm mb-2">
          {formState.errors.products.root.message as string}
        </p>
      )}
      {formState.errors.products &&
        typeof formState.errors.products.message === "string" && (
          <p className="text-red-600 text-sm mb-2">
            {formState.errors.products.message}
          </p>
        )}

      <Card className="max-h-[400px] overflow-y-auto border rounded-lg shadow-sm">
        <CardContent className="space-y-4 pt-6">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end"
            >
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 min-w-0">
                <FormField
                  control={control}
                  rules={{ required: true }}
                  name={`products.${index}.variant_id`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Variant")}</FormLabel>
                      <FormControl>
                        <SearchablePaginatedSelect
                          placeholder={t("Select variant")}
                          fetchData={useAllVariantsData}
                          field={{
                            ...field,
                            onChange: (value) => {
                              const numericValue = Number(value);
                              field.onChange(numericValue);
                              
                              // Clear quantity error when variant changes
                              clearErrors(`products.${index}.quantity`);
                              
                              // Reset quantity to 1 to avoid issues with max limits
                              const currentQuantity = products[index]?.quantity || 1;
                              const newVariant = allVariants.find((v: any) => v.id === numericValue);
                              if (newVariant?.available_quantity && currentQuantity > newVariant.available_quantity) {
                                setValue(`products.${index}.quantity`, Math.min(currentQuantity, newVariant.available_quantity));
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-1 sm:col-span-1 lg:col-span-2">
                <FormField
                  control={control}
                  name={`products.${index}.quantity`}
                  render={({ field }) => {
                    // Get the selected variant's available quantity
                    const selectedVariant = allVariants.find((v: any) => v.id === products[index]?.variant_id);
                    const maxQuantity = selectedVariant?.available_quantity;
                    
                    return (
                      <FormItem>
                        <FormLabel>
                          {t("Quantity")}
                          {!isPreOrder && maxQuantity !== undefined && (
                            <span className={`text-sm ml-1 ${
                              maxQuantity === 0 
                                ? "text-red-500" 
                                : maxQuantity <= 5 
                                  ? "text-orange-500" 
                                  : "text-muted-foreground"
                            }`}>
                              (Available: {maxQuantity})
                              {maxQuantity === 0 && " - Out of Stock"}
                              {maxQuantity > 0 && maxQuantity <= 5 && " - Low Stock"}
                            </span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={!isPreOrder ? maxQuantity : undefined}
                            disabled={!isPreOrder && maxQuantity === 0}
                            {...field}
                            onChange={(e) => {
                              let value = Number(e.target.value);
                              
                              // Prevent setting values higher than available stock (only for regular orders, not pre-orders)
                              if (!isPreOrder && maxQuantity !== undefined && value > maxQuantity) {
                                value = maxQuantity;
                                e.target.value = maxQuantity.toString();
                              }
                              
                              // Ensure minimum value is 1
                              if (value < 1) {
                                value = 1;
                                e.target.value = "1";
                              }
                              
                              field.onChange(value);
                              
                              // Real-time validation: show error if exceeds available quantity or below minimum (only for regular orders)
                              if (!isPreOrder && maxQuantity !== undefined && value > maxQuantity) {
                                setError(`products.${index}.quantity`, {
                                  type: "manual",
                                  message: t("Quantity exceeds available stock")
                                });
                              } else if (value < 1) {
                                setError(`products.${index}.quantity`, {
                                  type: "manual",
                                  message: t("Quantity must be at least 1")
                                });
                              } else {
                                clearErrors(`products.${index}.quantity`);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <div className="col-span-1 sm:col-span-1 lg:col-span-1 flex justify-end sm:justify-start lg:justify-end">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => remove(index)}
                  size="icon"
                  className="mt-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProductVariantFields;
