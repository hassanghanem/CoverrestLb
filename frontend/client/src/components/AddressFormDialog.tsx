import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "./ui/dialog";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { PhoneInput } from "./ui/PhoneInput";
import { Textarea } from "./ui/textarea";
import { LocationPicker } from "./LocationPicker";
import { AddressFormData } from "@/lib/validations";
import { usePhoneLogic } from "@/hooks/usePhoneLogic";
import { z } from "zod";
import parsePhoneNumberFromString from "libphonenumber-js";

interface AddressFormProps {
  onSubmit: (data: AddressFormData) => void;
  initialData?: Partial<AddressFormData>;
  isEdit?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  onSubmit,
  onClose,
  initialData,
  isEdit,
  isOpen,
}) => {
  const { t } = useTranslation();

  // Get country from existing phone number for better UX, and extract display phone
  const { getCountryFromPhone, extractPhoneNumber, formatPhoneForForm } = usePhoneLogic();
  const defaultCountry = getCountryFromPhone(initialData?.phone_number) || "LB";

  // Extract display phone number (remove country code for display)
  const displayPhone = initialData?.phone_number ? extractPhoneNumber(initialData.phone_number) : "";

  // Handle form submission with proper phone formatting
  const handleFormSubmit = (data: AddressFormData) => {
    // Format phone number for API submission
    const formattedPhone = data.phone_number ? formatPhoneForForm(data.phone_number, defaultCountry) : "";

    // Submit with properly formatted phone
    onSubmit({
      ...data,
      phone_number: formattedPhone,
    });
  };

  // Create custom schema with country context for phone validation
  const customAddressSchema = z.object({

    recipient_name: z.string().min(1, t("Recipient name is required")).max(191),
    address: z.string().min(1, t("Address is required")).max(191),
    phone_number: z
      .string()
      .min(5, t("Phone number is required"))
      .max(20)
      .refine((val) => {
        try {
          // Try parsing with international format first
          let phone = parsePhoneNumberFromString(val);
          if (phone?.isValid()) return true;

          // Try parsing with detected country
          phone = parsePhoneNumberFromString(val, defaultCountry as any);
          if (phone?.isValid()) return true;

          // Try with Lebanon as fallback
          phone = parsePhoneNumberFromString(val, "LB");
          return phone?.isValid() ?? false;
        } catch {
          return false;
        }
      }, { message: t("Invalid phone number") }),
    city: z.string().min(2, t("City is required")).max(191),
    notes: z.string().max(500).optional().nullable(),
    latitude: z.string().optional().nullable(),
    longitude: z.string().optional().nullable(),
    is_default: z.boolean(),
  });

  const methods = useForm<AddressFormData>({
    resolver: zodResolver(customAddressSchema),
    defaultValues: {
      recipient_name: initialData?.recipient_name || "",
      address: initialData?.address || "",
      phone_number: displayPhone,
      city: initialData?.city || "",
      notes: initialData?.notes ?? "",
      latitude: initialData?.latitude ?? "",
      longitude: initialData?.longitude ?? "",
      is_default: initialData?.is_default ?? true,
    },
  });

  useEffect(() => {
    if (initialData) {
      const resetDisplayPhone = initialData.phone_number ? extractPhoneNumber(initialData.phone_number) : "";
      methods.reset({
        recipient_name: initialData.recipient_name || "",
        address: initialData.address || "",
        phone_number: resetDisplayPhone,
        city: initialData.city || "",
        notes: initialData.notes ?? "",
        latitude: initialData.latitude ?? "",
        longitude: initialData.longitude ?? "",
        is_default: initialData.is_default ?? false,
      });
    }
  }, [initialData, methods, extractPhoneNumber]);

  const handleCancel = () => onClose();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent >
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("Edit Address") : t("Add New Address")}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t("Update the saved address details for faster checkout.")
              : t("Save a shipping address for quicker checkout in the future.")}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={methods.control}
                name="recipient_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Recipient Name")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("Enter recipient name")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Phone Number")}</FormLabel>
                    <FormControl>
                      <PhoneInput
                        value={field.value}
                        onChange={field.onChange}
                        defaultCountry={defaultCountry}
                        placeholder={t('Enter your contact number')}
                        disableFormatting={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>



            {/* City */}
            <FormField
              control={methods.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("City")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("Enter your city")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Address")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("Enter full delivery address")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Notes (Optional)")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("Delivery instructions (optional)")}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
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

            {/* Notes */}


            {/* Default Checkbox */}
            <FormField
              control={methods.control}
              name="is_default"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
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

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                {t("Cancel")}
              </Button>
              <Button type="submit">
                {isEdit ? t("Update Address") : t("Save New Address")}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
