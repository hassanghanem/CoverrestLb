import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { Order, PaginatedData } from "@/types/api.interfaces";
import { useEffect } from "react";
import { FormActions } from "@/components/fields/FormActions";
import { SearchablePaginatedSelect } from "@/components/fields/SearchablePaginatedSelect";

type ReturnOrderFormValues = {
  order_id: number;
  reason?: string;
  products: { variant_id: number; quantity: number }[];
};

interface ReturnOrderFormProps<T> {
  onSubmit: (data: ReturnOrderFormValues) => void;
  onCancel: () => void;
  useAllOrdersData: (search: string) => PaginatedData<T>;
}

export function ReturnOrderForm<T extends { id: number; order: Order }>({
  onSubmit,
  onCancel,
  useAllOrdersData,
}: ReturnOrderFormProps<T>) {
  const { t } = useTranslation();

  const formSchema = z.object({
    order_id: z.number({ message: t("Order is required") }),
    reason: z.string().max(1000).optional(),
    products: z
      .array(
        z.object({
          variant_id: z.number({ message: t("Variant is required") }),
          quantity: z.number().min(1, { message: t("Quantity must be at least 1") }),
        })
      )
      .min(1, { message: t("At least one product is required") }),
  });

  const methods = useForm<ReturnOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { products: [] },
  });

  const { control, handleSubmit, watch } = methods;
  const searchTerm = "";
  const ordersData = useAllOrdersData(searchTerm);
  const selectedOrderId = watch("order_id");
  const selectedOrder = ordersData.items.find(item => item.id === selectedOrderId)?.order;

  useEffect(() => {
    if (selectedOrderId && selectedOrder?.order_details?.length) {
      const defaultProducts = selectedOrder.order_details.map((detail) => ({
        variant_id: detail.variant_id,
        quantity: detail.quantity ?? 0,
      }));
      methods.setValue("products", defaultProducts);
    }
  }, [selectedOrderId, selectedOrder, methods]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="order_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Order")}</FormLabel>
                <FormControl>
                  <SearchablePaginatedSelect
                    placeholder={t("Select order")}
                    fetchData={useAllOrdersData}
                    field={field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Reason")}</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4 space-y-4">
          {selectedOrder?.order_details.map((detail, index) => (
            <div
              key={detail.id}
              className="grid grid-cols-1 md:grid-cols-2 items-start gap-4 bg-muted/30 p-4 rounded-lg"
            >
              <div>
                <div className="font-medium text-sm text-muted-foreground">
                  {t("Product")}
                </div>
                <div className="text-base">
                  {detail.product.name.en}
                  {detail.variant.color?.name.en ? ` - ${detail.variant.color.name.en}` : ""}
                </div>
              </div>

              <FormField
                control={control}
                name={`products.${index}.quantity`}
                render={({ field: qtyField }) => (
                  <FormItem>
                    <FormLabel className="text-sm">
                      {t("Quantity")} (max: {detail.quantity})
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={detail.quantity}
                        {...qtyField}
                        onChange={(e) =>
                          qtyField.onChange(Math.min(detail.quantity, Number(e.target.value)))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                    <input
                      type="hidden"
                      {...methods.register(`products.${index}.variant_id`)}
                      value={detail.variant_id ?? ""}
                    />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <FormActions
          onCancel={onCancel}
          isSubmitting={methods.formState.isSubmitting}
          cancelLabel={t("Cancel")}
          submitLabel={t("Submit")}
          submitingLabel={t("Submitting...")}
        />
      </form>
    </FormProvider>
  );
}
