import { useEffect } from "react";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { PaginatedData } from "@/types/api.interfaces";
import { FormActions } from "@/components/fields/FormActions";
import { SearchablePaginatedSelect } from "@/components/fields/SearchablePaginatedSelect";

type CouponFormValues = {
  code: string;
  type: "fixed" | "percentage";
  value: number;
  usage_limit?: number | null;
  min_order_amount?: number | null;
  coupon_type: number;
  client_id?: number | null;
  valid_from?: string | null;
  valid_to?: string | null;
  status: string;
};

interface CouponFormProps<T> {
  onSubmit: (data: CouponFormValues) => void;
  onCancel: () => void;
  initialData?: Partial<CouponFormValues>;
  isEdit?: boolean;
  useAllClientsData: (searchTerm: string) => PaginatedData<T>;
}

export function CouponForm<T>({
  onSubmit,
  onCancel,
  initialData,
  isEdit,
  useAllClientsData,
}: CouponFormProps<T>) {
  const { t } = useTranslation();
  const today = new Date().toISOString().split("T")[0];

  const formSchema = z
    .object({
      code: z.string().min(1, t("Code required")).max(255),
      type: z.enum(["fixed", "percentage"]),
      value: z.number().min(0, t("Value required")),
      usage_limit: z.number({ message: t("Usage limit invalid") }).int().min(0).optional().nullable(),
      min_order_amount: z.union([z.number().min(0), z.literal(null)]).optional().nullable(),
      coupon_type: z.number().int().min(0).max(4),
      client_id: z.number().int().optional().nullable(),
      valid_from: z
        .string()
        .optional()
        .nullable()
        .refine((date) => !date || new Date(date) >= new Date(today), { message: t("Valid from today") }),
      valid_to: z
        .string()
        .optional()
        .nullable()
        .refine((date) => !date || new Date(date) >= new Date(today), { message: t("Valid to today") }),
      status: z.string(),
    })
    .superRefine(({ valid_from, valid_to, coupon_type, min_order_amount, client_id }, ctx) => {
      if (valid_from && valid_to && new Date(valid_to) < new Date(valid_from)) {
        ctx.addIssue({ code: "custom", message: t("Valid to must be after valid from"), path: ["valid_to"] });
      }
      if (coupon_type === 3 && (min_order_amount === null || min_order_amount === undefined)) {
        ctx.addIssue({ code: "custom", message: t("Minimum order amount required"), path: ["min_order_amount"] });
      }
      if (coupon_type === 1 && (client_id === null || client_id === undefined)) {
        ctx.addIssue({ code: "custom", message: t("Client required"), path: ["client_id"] });
      }
    });

  const methods = useForm<CouponFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: initialData?.code || "",
      type: initialData?.type || "percentage",
      value: Number(initialData?.value ?? 0),
      usage_limit: initialData?.usage_limit ?? null,
      min_order_amount: Number(initialData?.min_order_amount) ?? null,
      coupon_type: initialData?.coupon_type ?? 0,
      client_id: initialData?.client_id ?? null,
      valid_from: initialData?.valid_from ?? null,
      valid_to: initialData?.valid_to ?? null,
      status: initialData?.status ?? "0",
    },
  });

  const couponType = methods.watch("coupon_type");

  useEffect(() => {
    if (couponType !== 1) methods.setValue("client_id", initialData?.client_id ?? null);
    if (couponType !== 3) methods.setValue("min_order_amount", null);
    if (couponType === 4) {
      methods.setValue("type", "fixed");
      methods.setValue("value", 0);
    }
  }, [couponType, methods]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Coupon Type */}
          <FormField
            control={methods.control}
            name="coupon_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Coupon type")}</FormLabel>
                <FormControl className="w-full">
                  <Select value={field.value.toString()} onValueChange={(val) => field.onChange(Number(val))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("Select coupon type")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">{t("All")}</SelectItem>
                      <SelectItem value="1">{t("Specific")}</SelectItem>
                      <SelectItem value="2">{t("First time")}</SelectItem>
                      <SelectItem value="3">{t("Amount")}</SelectItem>
                      <SelectItem value="4">{t("Free delivery")}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Code */}
          <FormField
            control={methods.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Code")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Type and Value */}
          {couponType !== 4 && (
            <>
              <FormField
                control={methods.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Type")}</FormLabel>
                    <FormControl className="w-full">
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("Select type")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">{t("Percentage")}</SelectItem>
                          <SelectItem value="fixed">{t("Fixed")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Value")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* Usage Limit */}
          <FormField
            control={methods.control}
            name="usage_limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Usage limit")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Min Order Amount */}
          {(couponType === 3 || couponType === 4) && (
            <FormField
              control={methods.control}
              name="min_order_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Minimum order amount")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Client Select */}
          {couponType === 1 && (
            <FormField
              control={methods.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Client")}</FormLabel>
                  <FormControl>
                    <SearchablePaginatedSelect
                      placeholder={t("Select client")}
                      fetchData={useAllClientsData}
                      field={{ ...field, value: field.value ?? undefined }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Valid From / To */}
          <FormField
            control={methods.control}
            name="valid_from"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Valid from")}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ""} min={today} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={methods.control}
            name="valid_to"
            render={({ field }) => {
              const validFrom = methods.watch("valid_from");
              const minValidTo = validFrom && validFrom > today ? validFrom : today;

              return (
                <FormItem>
                  <FormLabel>{t("Valid to")}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ""} min={minValidTo} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* Status (Edit only) */}
          {isEdit && (
            <FormField
              control={methods.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Status")}</FormLabel>
                  <FormControl className="w-full">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("Select status")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">{t("Pending")}</SelectItem>
                        <SelectItem value="1">{t("Active")}</SelectItem>
                        <SelectItem value="2">{t("Inactive")}</SelectItem>
                        <SelectItem value="5">{t("Canceled")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Form Actions */}
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
}
