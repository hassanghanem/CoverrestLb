import {
  FormProvider,
  useForm,
} from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { PaginatedData } from "@/types/api.interfaces";
import { FormActions } from "@/components/fields/FormActions";
import { useSettings } from "@/hooks/usePublicData";
import ProductVariantFields from "@/components/fields/ProductVariantFields";
import { SearchablePaginatedSelect } from "@/components/fields/SearchablePaginatedSelect";
import { useEffect } from "react";
import { ReusableDialog } from "@/components/public/reusable-dialog";
import { AddressForm } from "@/features/Addresses/components/AddressForm";
import { useClientAddressDialog } from "@/features/Addresses/hooks/useClientAddressDialog";
import { ClientForm } from "@/features/Clients/components/ClientForm";
import { useClientDialog } from "@/features/Clients/hooks/useClientDialog";

type OrderFormValues = {
  client_id: number;
  address_id: number;
  coupon_code?: string;
  notes?: string;
  payment_method: string;
  payment_status: number;
  source: string;
  products: { variant_id: number; quantity: number }[];
};

interface OrderFormProps<T> {
  onSubmit: (data: OrderFormValues) => void;
  onCancel: () => void;
  useAllClientsData: (search: string) => PaginatedData<T>;
  useAllAddressesData: (search: string, selectedClientId: number) => PaginatedData<T>;
  useAllVariantsData: (search: string) => PaginatedData<T & { available_quantity?: number }>;
}

export function OrderForm<T>({
  onSubmit,
  onCancel,
  useAllClientsData,
  useAllAddressesData,
  useAllVariantsData,
}: OrderFormProps<T>) {
  const { t: messages } = useTranslation();
  const { data: settingsData } = useSettings();

  // Get variants data at component level for validation
  const variantsData = useAllVariantsData("");
  const allVariants = variantsData.items || [];

  // Get payment methods and statuses from settings
  const paymentMethods = settingsData?.payment_methods || [];
  const paymentStatuses = settingsData?.payment_statuses || [];
  const orderSources = settingsData?.order_sources || [];

  const formSchema = z.object({
    client_id: z.number({
      message: messages("Client is required"),
    }).refine(val => val && val > 0, {
      message: messages("Client is required")
    }),
    address_id: z.number({
      message: messages("Address is required"),
    }).refine(val => val && val > 0, {
      message: messages("Address is required")
    }),
    coupon_code: z.string().optional().or(z.literal("")).transform(val => val === "" ? undefined : val),
    notes: z.string().max(255, messages("Notes may not be greater than 255 characters")).optional().or(z.literal("")).transform(val => val === "" ? undefined : val),
    payment_method: z.string({
      message: messages("Payment method is required"),
    }).min(1, messages("Payment method is required")).max(255, messages("Payment method may not be greater than 255 characters")),
    payment_status: z.number({
      message: messages("Payment status is required"),
    }).min(0).max(3, messages("Payment status is invalid")),
    source: z
      .string({ message: messages("Source is required") })
      .min(1, messages("Source is required"))
      .max(255, messages("Source may not be greater than 255 characters")),
    products: z
      .array(
        z.object({
          variant_id: z.number({
            message: messages("Variant is required"),
          }).refine(val => val && val > 0, {
            message: messages("Variant is required")
          }),
          quantity: z.number({
            message: messages("Quantity is required"),
          }).min(1, messages("Quantity must be at least 1")),
        })
      )
      .min(1, messages("At least one product is required"))
      .refine(
        (products) =>
          products.every(
            (p) => typeof p.variant_id === "number" && p.variant_id != 0
          ),
        { message: messages("Variant is required") }
      )
      .refine(
        (products) => {
          const variantIds = products.map((p) => p.variant_id);
          return new Set(variantIds).size === variantIds.length;
        },
        { message: messages("Duplicate variants are not allowed") }
      )
      .refine(
        (products) => {
          for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const variant = allVariants.find((v: any) => v.id === product.variant_id);
            if (variant && variant.available_quantity !== undefined && product.quantity > variant.available_quantity) {
              return false;
            }
          }
          return true;
        },
        {
          message: messages("One or more products exceed available stock"),
        }
      ),
  });

  const methods = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit", // Ensure validation happens on submit
    defaultValues: {
      client_id: undefined,
      address_id: undefined,
      coupon_code: "",
      notes: "",
      source: "",
      payment_method: "0",
      payment_status: 0,
      products: [],
    },
  });

  const { control, handleSubmit, watch, setError, reset, setValue, clearErrors } = methods;
  const selectedClientId = watch("client_id");
  useEffect(() => {
    if (orderSources.length > 0) {
      setValue("source", orderSources[0], { shouldDirty: false });
      clearErrors("source");
    }
  }, [orderSources, setValue, clearErrors]);
  // When client changes, reset selected address without triggering validation
  useEffect(() => {
    setValue("address_id", undefined as any, { shouldDirty: true });
  }, [selectedClientId, setValue]);

  // Update default payment method when settings load
  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedClientId) {
      reset(prev => ({
        ...prev,
        payment_method: paymentMethods[0].value,
      }), { keepDefaultValues: true });
    }
  }, [paymentMethods, reset, selectedClientId]);

  // Custom validation function for form submission
  const validateAndSubmit = async (data: OrderFormValues) => {
    let hasErrors = false;

    // Check for required fields
    if (!data.client_id || data.client_id === 0) {
      setError("client_id", {
        type: "manual",
        message: messages("Client is required")
      });
      hasErrors = true;
    }

    if (!data.address_id || data.address_id === 0) {
      setError("address_id", {
        type: "manual",
        message: messages("Address is required")
      });
      hasErrors = true;
    }

    if (!data.payment_method || data.payment_method.trim() === "") {
      setError("payment_method", {
        type: "manual",
        message: messages("Payment method is required")
      });
      hasErrors = true;
    }

    if (!data.products || data.products.length === 0) {
      setError("products", {
        type: "manual",
        message: messages("At least one product is required")
      });
      hasErrors = true;
    }

    // Check each product's quantity against available stock
    for (let i = 0; i < data.products.length; i++) {
      const product = data.products[i];

      if (!product.variant_id || product.variant_id === 0) {
        setError(`products.${i}.variant_id`, {
          type: "manual",
          message: messages("Variant is required")
        });
        hasErrors = true;
      }

      if (!product.quantity || product.quantity < 1) {
        setError(`products.${i}.quantity`, {
          type: "manual",
          message: messages("Quantity must be at least 1")
        });
        hasErrors = true;
      }

      // Critical: Check stock availability
      const variant = allVariants.find((v: any) => v.id === product.variant_id);

      if (variant && variant.available_quantity !== undefined && product.quantity > variant.available_quantity) {
        setError(`products.${i}.quantity`, {
          type: "manual",
          message: messages("Quantity exceeds available stock") + ` (Available: ${variant.available_quantity})`
        });
        hasErrors = true;
      }
    }


    // Only submit if no errors
    if (!hasErrors) {
      onSubmit(data);
    } else {
    }
  };
  const {
    isOpen: isClientDialogOpen,
    isEditing: isEditingClient,
    initialData: clientFormInitialData,
    openCreateDialog: openCreateClientDialog,
    openEditDialog: openEditClientDialog,
    closeDialog: closeClientDialog,
    handleSubmit: handleClientDialogSubmit,
  } = useClientDialog();

  const {
    isOpen: isAddressDialogOpen,
    isEditing: isEditingAddress,
    isSubmitting: addressFormLoading,
    initialData: addressFormInitialData,
    openCreateDialog: openCreateAddressDialog,
    openEditDialog,
    closeDialog: closeAddressDialog,
    handleSubmit: handleAddressFormSubmit,
  } = useClientAddressDialog({
    clientId: selectedClientId,
    onAddressCreated: async (newAddressId) => {
      setValue("address_id", newAddressId, { shouldDirty: true });
      clearErrors("address_id");
    },
    onAddressUpdated: async () => {
      // Address list is refreshed by the dialog hook's invalidation; form keeps current value
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(validateAndSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Client */}
          <FormField
            control={control}
            name="client_id"
            render={({ field }) => (
              <FormItem className="w-full block col-span-1 md:col-span-2">
                <FormLabel>{messages("Client")}</FormLabel>
                <FormControl>
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <SearchablePaginatedSelect
                      placeholder={messages("Select client")}
                      fetchData={useAllClientsData}
                      field={{
                        ...field,
                        onChange: (value: string | number) => field.onChange(Number(value)),
                      }}
                      className="flex-1"
                    />
                    <div className="flex gap-2 sm:w-auto w-full">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={openCreateClientDialog}
                      >
                        {messages("Add")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={() => field.value && openEditClientDialog(field.value)}
                        disabled={!field.value}
                      >
                        {messages("Edit")}
                      </Button>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={control}
            name="address_id"
            render={({ field }) => (
              <FormItem className="w-full block col-span-1 md:col-span-2">
                <FormLabel>{messages("Address")}</FormLabel>
                <FormControl>
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <SearchablePaginatedSelect
                      placeholder={messages("Select address")}
                      fetchData={(search) =>
                        useAllAddressesData(search, selectedClientId)
                      }
                      field={{
                        ...field,
                        onChange: (value: string | number) => field.onChange(Number(value))
                      }}
                      className="flex-1"
                    />
                    <div className="flex gap-2 sm:w-auto w-full">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={openCreateAddressDialog}
                        disabled={!selectedClientId}
                      >
                        {messages("Add")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={() => field.value && openEditDialog(field.value)}
                        disabled={!field.value}
                      >
                        {messages("Edit")}
                      </Button>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Coupon Code */}
          <FormField
            control={control}
            name="coupon_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{messages("Coupon code")}</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes */}
          <FormField
            control={control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{messages("Notes")}</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Method */}
          <FormField
            control={control}
            name="payment_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{messages("Payment method")}</FormLabel>
                <FormControl>
                  <Select
                    value={field.value || ""}
                    onValueChange={(val) => field.onChange(val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={messages("Select payment method")} />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Status */}
          <FormField
            control={control}
            name="payment_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{messages("Payment status")}</FormLabel>
                <FormControl>
                  <Select
                    value={field.value.toString()}
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={messages("Select payment status")} />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentStatuses.map((status, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {status}
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
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{messages("Source")}</FormLabel>
                <FormControl>
                  <Select value={field.value || ""} onValueChange={(val) => field.onChange(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder={messages("Select source")} />
                    </SelectTrigger>
                    <SelectContent>
                      {orderSources.map((src, idx) => (
                        <SelectItem key={`${src}-${idx}`} value={src}>
                          {src}
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

        <ProductVariantFields
          methods={methods}
          useAllVariantsData={useAllVariantsData}
          allVariants={allVariants}
        />

        <FormActions
          onCancel={onCancel}
          isSubmitting={methods.formState.isSubmitting}
          cancelLabel={messages("Cancel")}
          submitLabel={messages("Submit")}
          submitingLabel={messages("Submitting")}
        />
        <ReusableDialog
          open={isClientDialogOpen}
          onClose={closeClientDialog}
          title={isEditingClient ? messages("Edit Client") : messages("Add Client")}
          description={
            isEditingClient
              ? messages("Update existing client details")
              : messages("Add a new client")
          }
        >
          <ClientForm
            onSubmit={async (data) => {
              const createdId = await handleClientDialogSubmit(data as any);
              if (createdId) {
                setValue('client_id', createdId, { shouldDirty: true });
                clearErrors('client_id');
              }
            }}
            onCancel={closeClientDialog}
            initialData={clientFormInitialData}
            isEdit={isEditingClient}
          />
        </ReusableDialog>
        <ReusableDialog
          open={isAddressDialogOpen}
          onClose={closeAddressDialog}
          title={isEditingAddress ? messages("Edit Address") : messages("Add Address")}
          description={isEditingAddress ? messages("Update existing address details") : messages("Add a new address")}
        >
          <AddressForm
            onSubmit={handleAddressFormSubmit}
            onCancel={closeAddressDialog}
            initialData={addressFormInitialData}
            isEdit={isEditingAddress}
            isSubmitting={addressFormLoading}
          />
        </ReusableDialog>
      </form>
    </FormProvider>
  );
}
