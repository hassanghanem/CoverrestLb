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
import "react-international-phone/style.css";

import parsePhoneNumberFromString, {
  getCountries,
  getCountryCallingCode,
} from "libphonenumber-js";
import { FormActions } from "@/components/fields/FormActions";
import { PhoneInput } from "@/components/fields/PhoneInput";

type ClientFormValues = {
  name: string;
  gender?: string;
  birthdate?: string | null;
  phone?: string | null;
  email: string;
};

interface ClientFormProps {
  onSubmit: (data: ClientFormValues) => void;
  onCancel: () => void;
  initialData?: Partial<ClientFormValues>;
  isEdit?: boolean;
}

function extractCountryCallingCode(phone: string) {
  if (!phone.startsWith("+")) return null;
  const countries = getCountries();
  const callingCodes = countries
    .map((country) => getCountryCallingCode(country))
    .sort((a, b) => b.length - a.length);

  for (const code of callingCodes) {
    if (phone.startsWith(`+${code}`)) return code;
  }
  return null;
}


export const ClientForm = ({
  onSubmit,
  onCancel,
  initialData,
  isEdit,
}: ClientFormProps) => {
  const { t } = useTranslation();

  const formSchema = z.object({
    name: z.string().min(1, t("Name is required")).max(100),
    gender: z.string().optional(),
    birthdate: z
      .string()
      .optional()
      .nullable()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: t("Invalid birthdate"),
      }),
    phone: z
      .string()
      .optional()
      .nullable()
      .refine((val) => {
        if (!val) return true;
        const countryCode = extractCountryCallingCode(val);
        if (!countryCode) return false;
        if (val.length <= countryCode.length + 1) return false;
        const phoneNumber = parsePhoneNumberFromString(val);
        return phoneNumber?.isValid() ?? false;
      }, {
        message: t("Invalid phone number"),
      }),
    email: z.string().email(t("Please enter a valid email")).max(150),
  });

  const methods = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      gender: initialData?.gender ?? "",
      birthdate: initialData?.birthdate ?? "",
      phone: initialData?.phone ?? "",
      email: initialData?.email ?? "",
    },
  });


  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <FormField
            control={methods.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Name")}</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gender */}
          <FormField
            control={methods.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Gender")}</FormLabel>
                <FormControl>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("Select gender")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t("Male")}</SelectItem>
                      <SelectItem value="female">{t("Female")}</SelectItem>
                      <SelectItem value="other">{t("Other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Birthdate */}
          <FormField
            control={methods.control}
            name="birthdate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Birthdate")}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={methods.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Phone")}</FormLabel>
                <FormControl>
                  <PhoneInput
                    value={field.value ?? ""}
                    onChange={(value) => field.onChange(value)}
                    defaultCountry="LB"
                    placeholder={t('Enter contact number')}
                  />

                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={methods.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Email")}</FormLabel>
                <FormControl>
                  <Input type="email" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Actions */}
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
};
