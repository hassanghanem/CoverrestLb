import {
  FormProvider,
  useForm,
} from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { PaginatedData, Warehouse } from "@/types/api.interfaces";
import { FormActions } from "@/components/fields/FormActions";
import { SearchablePaginatedSelect } from "@/components/fields/SearchablePaginatedSelect";

interface StockAdjustmentFormProps<T> {
  onSubmit: (data: StockAdjustmentFormValues) => void;
  onCancel: () => void;
  warehouses: Warehouse[];
  useProductVariantData: (searchTerm: string) => PaginatedData<T>;
  fixedVariantId?: number;
}

const createFormSchema = (t: (key: string) => string) =>
  z.object({
    variant_id: z
      .number()
      .int()
      .positive({ message: t("Product variant is required") }),
    warehouse_id: z
      .number()
      .int()
      .positive({ message: t("Warehouse is required") }),
    direction: z.enum(["increase", "decrease"] as const)
      .refine(val => val === "increase" || val === "decrease", {
        message: t("Direction is required"),
      }),

    quantity: z
      .number({ message: t("Quantity is required") })
      .int()
      .min(1, { message: t("Quantity must be at least 1") }),
    cost_per_item: z
      .number({ message: t("Cost per item is required") })
      .min(0, { message: t("Cost per item must be a positive number") }),
    reason: z.string().max(255).optional(),
  });


export type StockAdjustmentFormValues = z.infer<ReturnType<typeof createFormSchema>>;

export function StockAdjustmentForm<T>({
  onSubmit,
  onCancel,
  warehouses,
  useProductVariantData,
  fixedVariantId,
}: StockAdjustmentFormProps<T>) {
  const { t } = useTranslation();
  const schema = createFormSchema(t);

  const methods = useForm<StockAdjustmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      quantity: 1,
      warehouse_id: warehouses.length > 0 ? warehouses[0].id : undefined,
      cost_per_item: 0,
      direction: "increase",
      ...(fixedVariantId ? { variant_id: fixedVariantId } : {}),
    },
  });

  const { setValue } = methods;


  return (
    <FormProvider {...methods}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          methods.handleSubmit(onSubmit)(e);
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!fixedVariantId && (
            <FormField
              control={methods.control}
              name="variant_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Product Variant")}</FormLabel>
                  <FormControl>
                    <SearchablePaginatedSelect
                      placeholder={t("Select product variant")}
                      fetchData={useProductVariantData}
                      field={field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={methods.control}
            name="warehouse_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Warehouse")}</FormLabel>
                <FormControl className="w-full">
                  <Select
                    value={field.value?.toString() || ""}
                    onValueChange={(val) => setValue("warehouse_id", Number(val))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("Select warehouse")} />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                          {warehouse.name}
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
            name="direction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Direction")}</FormLabel>
                <FormControl className="w-full">
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("Select direction")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="increase">{t("Increase")}</SelectItem>
                      <SelectItem value="decrease">{t("Decrease")}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={methods.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Quantity")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder={t("Enter quantity")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          <FormField
            control={methods.control}
            name="cost_per_item"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Cost Per Item")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                    value={field.value}
                    placeholder={t("Enter cost per item")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={methods.control}
            name="reason"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("Reason")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder={t("Enter reason for adjustment")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormActions
          onCancel={onCancel}
          isSubmitting={methods.formState.isSubmitting}
          cancelLabel={t("Cancel")}
          submitLabel={t("Save")}
          submitingLabel={t("Saving...")}
        />
      </form>
    </FormProvider>
  );
}