import {
    FormProvider,
    useForm,
} from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

const createFormSchema = (t: (key: string) => string) =>
    z.object({
        theme_color1: z.string().max(7).optional().default(""),
        theme_color2: z.string().max(7).optional().default(""),
        delivery_charge: z
            .number()
            .min(0, t("Delivery charge must be at least 0"))
            .optional()
            .default(0),
        delivery_duration: z
            .number()
            .int()
            .min(1, t("Delivery duration must be at least 1 day"))
            .optional()
            .default(1),
        min_stock_alert: z
            .number()
            .int()
            .min(1, t("Minimum stock alert must be at least 1"))
            .optional()
            .default(1),
        store_name: z.string().max(255).optional().default(""),
        contact_email: z.string().email(t("Please enter a valid email address")).max(255).optional().default(""),
        contact_phone: z.string().max(20).optional().default(""),
        store_address: z.string().max(255).optional().default(""),
        business_days: z.string().max(255).optional().default(""),
        business_hours: z.string().max(255).optional().default(""),
        facebook_link: z.string().url(t("Please enter a valid URL")).or(z.literal("")).optional().default(""),
        instagram_link: z.string().url(t("Please enter a valid URL")).or(z.literal("")).optional().default(""),
        youtube_link: z.string().url(t("Please enter a valid URL")).or(z.literal("")).optional().default(""),
        tiktok_link: z.string().url(t("Please enter a valid URL")).or(z.literal("")).optional().default(""),
        cost_method: z.string().optional().default("fifo"),
    });

export type ConfigurationsFormValues = {
    theme_color1?: string;
    theme_color2?: string;
    delivery_charge?: number;
    delivery_duration?: number;
    min_stock_alert?: number;
    store_name?: string;
    contact_email?: string;
    contact_phone?: string;
    store_address?: string;
    business_days?: string;
    business_hours?: string;
    facebook_link?: string;
    instagram_link?: string;
    youtube_link?: string;
    tiktok_link?: string;
    cost_method?: string;
};

interface ConfigurationFormProps {
    onSubmit: (data: ConfigurationsFormValues) => void;
    initialData?: Partial<ConfigurationsFormValues>;
    costMethods?: Record<string, string>;
}

export const ConfigurationForm = ({
    onSubmit,
    initialData,
    costMethods,
}: ConfigurationFormProps) => {
    const { t } = useTranslation();
    const formSchema = createFormSchema(t);

    const methods = useForm<ConfigurationsFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            theme_color1: initialData?.theme_color1 || "#000000",
            theme_color2: initialData?.theme_color2 || "#000000",
            delivery_charge: initialData?.delivery_charge ?? 0,
            delivery_duration: initialData?.delivery_duration ?? 1,
            min_stock_alert: initialData?.min_stock_alert ?? 1,
            store_name: initialData?.store_name || "",
            contact_email: initialData?.contact_email || "",
            contact_phone: initialData?.contact_phone || "",
            store_address: initialData?.store_address || "",
            business_days: initialData?.business_days || "",
            business_hours: initialData?.business_hours || "",
            facebook_link: initialData?.facebook_link || "",
            instagram_link: initialData?.instagram_link || "",
            youtube_link: initialData?.youtube_link || "",
            tiktok_link: initialData?.tiktok_link || "",
            cost_method: initialData?.cost_method || "fifo",
        },
    });

    // Ensure form resets if initialData changes
    useEffect(() => {
        if (initialData) {
            const sanitizedData = Object.fromEntries(
                Object.entries(initialData).map(([key, value]) => [
                    key,
                    value === null ? "" : value
                ])
            );
            methods.reset(sanitizedData);
        }
    }, [initialData, methods]);

    // Safe value getter to ensure no null values
    const getSafeValue = (value: any, fallback: string | number = "") => {
        return value === null ? fallback : (value ?? fallback);
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4 w-full">
                {/* Store Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                    <FormField
                        control={methods.control}
                        name="store_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("Store name")}</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        value={getSafeValue(field.value) as string} 
                                        placeholder={t("Enter store name")} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={methods.control}
                        name="store_address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("Store address")}</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        value={getSafeValue(field.value) as string} 
                                        placeholder={t("Enter store address")} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={methods.control}
                        name="contact_email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("Contact email")}</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="email" 
                                        {...field} 
                                        value={getSafeValue(field.value) as string} 
                                        placeholder={t("Enter contact email")} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={methods.control}
                        name="contact_phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("Contact phone")}</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        value={getSafeValue(field.value) as string} 
                                        placeholder={t("Enter contact phone")} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={methods.control}
                        name="business_days"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("Business days")}</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        value={getSafeValue(field.value) as string} 
                                        placeholder={t("Enter business days")} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={methods.control}
                        name="business_hours"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("Business hours")}</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        value={getSafeValue(field.value) as string} 
                                        placeholder={t("Enter business hours")} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Delivery & Stock Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                    <FormField
                        control={methods.control}
                        name="delivery_charge"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("Delivery charge")}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        {...field}
                                        value={getSafeValue(field.value, "")}
                                        onChange={(e) => {
                                            const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                            field.onChange(isNaN(value) ? 0 : value);
                                        }}
                                        placeholder={t("Enter delivery charge")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={methods.control}
                        name="delivery_duration"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("Delivery duration (days)")}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        value={getSafeValue(field.value, "")}
                                        onChange={(e) => {
                                            const value = e.target.value === "" ? 1 : parseInt(e.target.value, 10);
                                            field.onChange(isNaN(value) ? 1 : value);
                                        }}
                                        placeholder={t("Enter delivery duration")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={methods.control}
                        name="min_stock_alert"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("Minimum stock alert")}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        value={getSafeValue(field.value, "")}
                                        onChange={(e) => {
                                            const value = e.target.value === "" ? 1 : parseInt(e.target.value, 10);
                                            field.onChange(isNaN(value) ? 1 : value);
                                        }}
                                        placeholder={t("Enter minimum stock alert")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={methods.control}
                        name="cost_method"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>{t("Cost Method")}</FormLabel>
                                <FormControl>
                                    <Select  value={field.value || "fifo"} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={t("Select cost method")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {costMethods && Object.entries(costMethods).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
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

                {/* Theme Colors */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                    {["theme_color1", "theme_color2"].map((field) => (
                        <FormField
                            key={field}
                            control={methods.control}
                            name={field as keyof ConfigurationsFormValues}
                            render={({ field: f }) => (
                                <FormItem>
                                    <FormLabel>{t(field === "theme_color1" ? "Primary theme color" : "Secondary theme color")}</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="color" 
                                            {...f} 
                                            value={getSafeValue(f.value, "#000000") as string} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                    {["facebook_link", "instagram_link", "youtube_link", "tiktok_link"].map((field) => (
                        <FormField
                            key={field}
                            control={methods.control}
                            name={field as keyof ConfigurationsFormValues}
                            render={({ field: f }) => (
                                <FormItem>
                                    <FormLabel>{t(field === "facebook_link" ? "Facebook link" : 
                                                 field === "instagram_link" ? "Instagram link" : 
                                                 field === "youtube_link" ? "YouTube link" : 
                                                 "TikTok link")}</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="url" 
                                            {...f} 
                                            value={getSafeValue(f.value) as string} 
                                            placeholder={t(`Enter ${field.replace('_link', '')} URL`)} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="submit" disabled={methods.formState.isSubmitting}>
                        {methods.formState.isSubmitting ? t("Saving...") : t("Save settings")}
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
};