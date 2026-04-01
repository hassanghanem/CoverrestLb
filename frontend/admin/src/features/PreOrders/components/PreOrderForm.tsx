import {
  FormProvider,
  useForm,
} from "react-hook-form";
import { useEffect } from "react";
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
import { ReusableDialog } from "@/components/public/reusable-dialog";
import { AddressForm } from "@/features/Addresses/components/AddressForm";
import { useClientAddressDialog } from "@/features/Addresses/hooks/useClientAddressDialog";
import { ClientForm } from "@/features/Clients/components/ClientForm";
import { useClientDialog } from "@/features/Clients/hooks/useClientDialog";


type PreOrderFormValues = {
  client_id: number;
  address_id: number;
  coupon_code?: string;
  notes?: string;
  payment_method: string;
  payment_status: number;
  products: { variant_id: number; quantity: number }[];
};

interface PreOrderFormProps<TClient, TAddress, TVariant extends { available_quantity?: number }> {
  onSubmit: (data: PreOrderFormValues) => void;
  onCancel: () => void;
  useAllClientsData: (search: string) => PaginatedData<TClient>;
  useAllAddressesData: (search: string, selectedClientId: number) => PaginatedData<TAddress>;
  useAllVariantsData: (search: string) => PaginatedData<TVariant>;
  defaultValues?: Partial<PreOrderFormValues>;
}

export function PreOrderForm<TClient, TAddress, TVariant extends { available_quantity?: number }>({
  onSubmit,
  onCancel,
  useAllClientsData,
  useAllAddressesData,
  useAllVariantsData,
  defaultValues,
}: PreOrderFormProps<TClient, TAddress, TVariant>) {
  const { t } = useTranslation();
  const { data: settingsData } = useSettings();
  
  // Get payment methods and statuses from settings
  const paymentMethods = settingsData?.payment_methods || [];
  const paymentStatuses = settingsData?.payment_statuses || [];

  const formSchema = z.object({
    client_id: z.number({ message: t("Client is required") }),
    address_id: z.number({ message: t("Address is required") }),
    coupon_code: z.string().optional(),
    notes: z.string().max(255).optional(),
    payment_method: z.string().max(255),
    payment_status: z.number().min(0).max(3),
    products: z
      .array(
        z.object({
          variant_id: z.number({
            message: t("Product variant is required"),
          }),
          quantity: z.number().min(1),
        })
      )
      .min(1, t("At least one product is required"))
      .refine(
        (products) => products.every((p) => typeof p.variant_id === "number" && !isNaN(p.variant_id) && p.variant_id !== 0),
        { message: t("Product variant is required") }
      )
      .refine(
        (products) => {
          const variantIds = products.map((p) => p.variant_id);
          return new Set(variantIds).size === variantIds.length;
        },
        { message: t("Duplicate variants are not allowed") }
      ),
  });

  const methods = useForm<PreOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payment_method: paymentMethods.length > 0 ? paymentMethods[0].value : "",
      payment_status: 0,
      products: [],
      ...defaultValues,
    },
  });

  const { control, handleSubmit, watch, setValue, clearErrors } = methods;
  const selectedClientId = watch("client_id");
  const {
    isOpen: isClientDialogOpen,
    isEditing: isEditingClient,
    initialData: clientFormInitialData,
    openCreateDialog: openCreateClientDialog,
    openEditDialog: openEditClientDialog,
    closeDialog: closeClientDialog,
    handleSubmit: handleClientDialogSubmit,
  } = useClientDialog();

  useEffect(() => {
    // When client changes, reset selected address without triggering validation
    setValue("address_id", undefined as any, { shouldDirty: true });
  }, [selectedClientId, setValue]);

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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="client_id"
            render={({ field }) => (
              <FormItem className="w-full block col-span-1 md:col-span-2">
                <FormLabel className="mb-2">{t("Client")}</FormLabel>
                <FormControl>
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <SearchablePaginatedSelect
                      placeholder={t("Select client")}
                      fetchData={useAllClientsData}
                      field={field}
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
                        {t("Add")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={() => field.value && openEditClientDialog(field.value)}
                        disabled={!field.value}
                      >
                        {t("Edit")}
                      </Button>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="address_id"
            render={({ field }) => (
              <FormItem className="w-full block col-span-1 md:col-span-2">
                <FormLabel className="mb-2">{t("Address")}</FormLabel>
                <FormControl>
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <SearchablePaginatedSelect
                      placeholder={t("Select address")}
                      fetchData={(search) => useAllAddressesData(search, selectedClientId)}
                      field={field}
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
                        {t("Add")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={() => field.value && openEditDialog(field.value)}
                        disabled={!field.value}
                      >
                        {t("Edit")}
                      </Button>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="coupon_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Coupon code")}</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} placeholder={t("Enter coupon code")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Notes")}</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} placeholder={t("Enter notes")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="payment_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Payment method")}</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("Select payment method")} />
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

          <FormField
            control={control}
            name="payment_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Payment status")}</FormLabel>
                <FormControl>
                  <Select
                    value={field.value.toString()}
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("Select payment status")} />
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
        </div>

        <ProductVariantFields methods={methods} useAllVariantsData={useAllVariantsData} isPreOrder={true} />

        <FormActions
          onCancel={onCancel}
          isSubmitting={methods.formState.isSubmitting}
          cancelLabel={t("Cancel")}
          submitLabel={t("Submit")}
          submitingLabel={t("Submitting...")}
        />
        <ReusableDialog
          open={isClientDialogOpen}
          onClose={closeClientDialog}
          title={isEditingClient ? t("Edit Client") : t("Add Client")}
          description={
            isEditingClient
              ? t("Update existing client details")
              : t("Add a new client")
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
          title={isEditingAddress ? t("Edit Address") : t("Add Address")}
          description={
            isEditingAddress
              ? t("Update existing address details")
              : t("Add a new address")
          }
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