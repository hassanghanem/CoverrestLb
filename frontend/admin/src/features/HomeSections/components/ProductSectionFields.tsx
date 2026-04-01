import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { useTranslation } from "react-i18next";
import { PaginatedData, ProductSectionItem } from "@/types/api.interfaces";
import { X } from "lucide-react";
import { SearchablePaginatedSelect } from "@/components/fields/SearchablePaginatedSelect";

interface ProductSectionFieldsProps<T> {
  methods: UseFormReturn<any>;
  useAllProductsData: (searchTerm: string) => PaginatedData<T>;
  existingItems?: ProductSectionItem[] | null;
}

type SectionItemWithMeta = {
  id?: number;
  product_id: number;
  home_section_id?: number;
  arrangement: string;
  is_active?: boolean;
  isNew: boolean;
};

export const ProductSectionFields = <T extends unknown>({
  methods,
  useAllProductsData,
  existingItems = [],
}: ProductSectionFieldsProps<T>) => {
  const { control, formState, setValue } = methods;
  const { t } = useTranslation();

  const [items, setItems] = useState<SectionItemWithMeta[]>([]);

  useEffect(() => {
    // Only sync and validate when there are actual existing items
    if (existingItems && existingItems.length > 0) {
      const synced = existingItems.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        home_section_id: item.home_section_id,
        arrangement: String(item.arrangement),
        is_active: item.is_active,
        isNew: false,
      }));
      setItems(synced);
      // Initialize form value without triggering validation so
      // "At least one product is required" doesn't show on load
      setValue("product_section_items", synced, { shouldValidate: false });
    }
  }, [JSON.stringify(existingItems)]);

  const updateFormItems = (updated: SectionItemWithMeta[]) => {
    const sorted = [...updated].sort(
      (a, b) => Number(a.arrangement) - Number(b.arrangement)
    );
    setValue(
      "product_section_items",
      sorted.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        home_section_id: item.home_section_id,
        arrangement: item.arrangement,
        is_active: item.is_active,
      })),
      { shouldValidate: true }
    );
  };

  const addNewItem = () => {
    const newItem: SectionItemWithMeta = {
      product_id: 0,
      arrangement: String(items.length + 1),
      is_active: true,
      isNew: true,
    };
    const updated = [...items, newItem];
    setItems(updated);
    updateFormItems(updated);
  };

  const handleDelete = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    updated.forEach((item, i) => {
      item.arrangement = String(i + 1);
    });
    setItems(updated);
    updateFormItems(updated);
  };

  const handleArrangementChange = (index: number, newArrangement: string) => {
    const updated = [...items];
    const current = updated[index];
    const currentArrangement = current.arrangement;

    const swapIndex = updated.findIndex(
      (item, i) => item.arrangement === newArrangement && i !== index
    );

    if (swapIndex !== -1) {
      updated[swapIndex].arrangement = currentArrangement;
    }

    updated[index].arrangement = newArrangement;

    setItems(updated);
    updateFormItems(updated);
  };

  return (
    <div className="space-y-4">
      <Label>{t("Products")}</Label>

      {formState.errors.product_section_items?.root && (
        <p className="text-red-600 text-sm mb-2">
          {formState.errors.product_section_items.root.message as string}
        </p>
      )}

      {formState.errors.product_section_items &&
        typeof formState.errors.product_section_items.message === "string" && (
          <p className="text-red-600 text-sm mb-2">
            {formState.errors.product_section_items.message}
          </p>
        )}

      {items.map((item, index) => (
        <div
          key={`product-item-${index}-${item.arrangement}`}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg relative"
        >
          <FormField
            control={control}
            name={`product_section_items.${index}.product_id`}
            render={({ field }) => {
              // Find the existing product data for this item
              const existingProduct = existingItems?.find(
                (item) => item.product_id === items[index]?.product_id
              );

              // Create initialValue object if we have existing product data
              const initialValue = existingProduct?.product
                ? {
                  id: existingProduct.product.id,
                  label: `${existingProduct.product.name?.en || existingProduct.product.name || `Product ${existingProduct.product.id}`} (${existingProduct.product.barcode || ""})`
                }
                : undefined;

              return (
                <FormItem>
                  <FormLabel>{t("Product")}</FormLabel>
                  <FormControl>
                    <SearchablePaginatedSelect<T>
                      placeholder={t("Select product")}
                      fetchData={useAllProductsData}
                      initialValue={initialValue as T}
                      field={{
                        ...field,
                        onChange: (value) => {
                          const numericValue = Number(value);
                          field.onChange(numericValue);
                          const updated = [...items];
                          updated[index].product_id = numericValue;
                          setItems(updated);
                          updateFormItems(updated);
                        },
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormItem>
            <FormLabel>{t("Arrangement")}</FormLabel>
            <Select
              value={item.arrangement}
              onValueChange={(value) => handleArrangementChange(index, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("Select arrangement")} />
              </SelectTrigger>
              <SelectContent>
                {items.map((_, i) => (
                  <SelectItem key={i} value={String(i + 1)}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={() => handleDelete(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addNewItem}>
        {t("Add product")}
      </Button>
    </div>
  );
};
