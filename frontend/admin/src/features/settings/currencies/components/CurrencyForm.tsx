import {
  FormProvider,
  useForm,
} from "react-hook-form";
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
import { CurrencyFormValues } from "@/types/form.interfaces";
import { SUPPORTED_LANGS } from "@/i18n";
import { FormActions } from "@/components/fields/FormActions";


const createFormSchema = (t: (key: string) => string) => {
  return z.object({
    name: z.object(
      SUPPORTED_LANGS.reduce((acc, lang) => {
        acc[lang] = z
          .string()
          .min(1, t("Name is required"))
          .max(255, t("Name must be less than 255 characters"));
        return acc;
      }, {} as Record<string, z.ZodString>)
    ),
    code: z
      .string()
      .min(1, t("Currency code is required"))
      .max(3, t("Currency code must be 3 characters")),
    symbol: z.string().max(10, t("Symbol must be less than 10 characters")).optional(),
    exchange_rate: z
      .number()
      .min(0, t("Exchange rate must be at least 0")),
  });
};

interface CurrencyFormProps {
  onSubmit: (data: z.infer<ReturnType<typeof createFormSchema>>) => void;
  onCancel: () => void;
  isEdit?: boolean;
  initialData?: Partial<CurrencyFormValues>;
}

export const CurrencyForm = ({
  onSubmit,
  onCancel,
  isEdit = false,
  initialData,
}: CurrencyFormProps) => {
  const { t } = useTranslation();
  const formSchema = createFormSchema(t);
  type FormValues = z.infer<typeof formSchema>;

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: SUPPORTED_LANGS.reduce((acc, lang) => {
        acc[lang] = initialData?.name?.[lang] || "";
        return acc;
      }, {} as Record<string, string>),
      code: initialData?.code || "",
      symbol: initialData?.symbol || "",
      exchange_rate: initialData?.exchange_rate || 0,
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SUPPORTED_LANGS.map((lang) => (
            <FormField
              key={lang}
              control={methods.control}
              name={`name.${lang}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Name")} ({lang.toLocaleUpperCase()})</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      placeholder={`${t("Enter name in")} (${lang.toLocaleUpperCase()})`}

                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <FormField
            control={methods.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Currency code")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("Enter currency code (e.g., USD)")}
                    maxLength={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={methods.control}
            name="symbol"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Currency symbol")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("Enter currency symbol (e.g., $)")}
                    maxLength={10}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={methods.control}
            name="exchange_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Exchange rate")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.0001"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder={t("Enter exchange rate")}
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
          submitLabel={isEdit ? t("Update") : t("Create")}
          submitingLabel={isEdit ? t("Updating...") : t("Creating...")}
        />
      </form>
    </FormProvider>
  );
};