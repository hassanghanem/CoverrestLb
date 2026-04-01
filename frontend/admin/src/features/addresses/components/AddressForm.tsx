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
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PhoneInput } from "@/components/fields/PhoneInput";
import { FormActions } from "@/components/fields/FormActions";
import { LocationPicker } from "@/components/fields/LocationPicker";


export type AddressFormValues = {
  address: string;
  phone_number: string;
  city: string;
  recipient_name: string;
  notes?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  is_default: boolean;
};

interface AddressFormProps {
  onSubmit: (data: AddressFormValues) => void | Promise<void>;
  onCancel: () => void;
  initialData?: Partial<AddressFormValues>;
  isEdit?: boolean;
  isSubmitting?: boolean;
}

export const AddressForm = ({
  onSubmit,
  onCancel,
  initialData,
  isEdit,
  isSubmitting,
}: AddressFormProps) => {
  const { t } = useTranslation();

  const formSchema = z.object({
    address: z.string().min(1, t("Address is required")).max(191, t("Maximum 191 characters allowed")),
    recipient_name: z.string().min(1, t("Recipient name is required")).max(191, t("Maximum 191 characters allowed")),
    phone_number: z.string().min(1, t("Phone number is required")).max(20, t("Maximum 20 characters allowed")),
    city: z.string().min(1, t("City is required")).max(191, t("Maximum 191 characters allowed")),
    notes: z.string().optional().nullable(),
    latitude: z.string().optional().nullable(),
    longitude: z.string().optional().nullable(),
    is_default: z.boolean(),
  });

  const methods = useForm<AddressFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: initialData?.address || "",
      recipient_name: initialData?.recipient_name || "",
      phone_number: initialData?.phone_number || "",
      city: initialData?.city || "",
      notes: initialData?.notes ?? null,
      latitude: initialData?.latitude ?? null,
      longitude: initialData?.longitude ?? null,
      is_default: initialData?.is_default ?? true,
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={methods.control}
            name="recipient_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Recipient Name")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Recipient Name")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Phone */}
          <FormField
            control={methods.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Phone Number")}</FormLabel>
                <FormControl>
                  <PhoneInput
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    placeholder={t("Enter your contact number")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={methods.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Address")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Address")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* City */}
          <FormField
            control={methods.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("City")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("e.g., Beirut")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes */}
          <FormField
            control={methods.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("Notes (Optional)")}</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Default checkbox */}
          <FormField
            control={methods.control}
            name="is_default"
            render={({ field }) => (
              <FormItem className="md:col-span-2 flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <FormLabel className="text-base">{t("Set as Default")}</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    {t("Use this address for future orders automatically.")}
                  </p>
                </div>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(value) => field.onChange(Boolean(value))}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Location Picker */}
          <LocationPicker
            value={{
              lat: methods.watch("latitude") ?? "",
              lon: methods.watch("longitude") ?? "",
            }}
            onChange={(lat, lon) => {
              methods.setValue("latitude", lat);
              methods.setValue("longitude", lon);
            }}
          />
        </div>

        <FormActions
          onCancel={onCancel}
          isSubmitting={isSubmitting ?? methods.formState.isSubmitting}
          cancelLabel={t("Cancel")}
          submitLabel={isEdit ? t("Update") : t("Create")}
          submitingLabel={isEdit ? t("Updating") : t("Creating")}
        />
      </form>
    </FormProvider>
  );
};
