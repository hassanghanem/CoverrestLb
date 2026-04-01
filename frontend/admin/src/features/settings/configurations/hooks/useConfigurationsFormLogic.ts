import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store/store";
import { fetchSettings } from "@/lib/store/slices/settingsSlice";
import { toast } from "sonner";
import { GetConfigurationsResponse } from "@/types/response.interfaces";
import { Configuration } from "@/types/api.interfaces";
import { updateConfiguration } from "@/lib/services/Configurations-services";
import { ConfigurationsFormValues } from "../components/ConfigurationForm";
import { useConfigurations } from "./useConfigurations";

export function mapConfigurationsToFormValues(response: GetConfigurationsResponse): Partial<ConfigurationsFormValues> {
    const mapped: Partial<ConfigurationsFormValues> = {};

    if (!response || !Array.isArray(response.configurations)) {
        return mapped;
    }

    const stringKeys: (keyof ConfigurationsFormValues)[] = [
        "theme_color1",
        "theme_color2",
        "store_name",
        "contact_email",
        "contact_phone",
        "store_address",
        "business_days",
        "business_hours",
        "facebook_link",
        "instagram_link",
        "youtube_link",
        "tiktok_link",
        "cost_method",
    ];

    const numberKeys: (keyof ConfigurationsFormValues)[] = [
        "delivery_charge",
        "delivery_duration",
        "min_stock_alert",
    ];

    response.configurations.forEach((config: Configuration) => {
        const key = config.key as keyof ConfigurationsFormValues;

        if (numberKeys.includes(key)) {
            const numValue = Number(config.value);
            if (!isNaN(numValue)) {
                mapped[key] = numValue as any;
            }
        } else if (stringKeys.includes(key)) {
            mapped[key] = config.value as any;
        }
    });

    return mapped;
}

export function useConfigurationsLogic() {
    const { t: messages } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const [isConfigFormOpen, setIsConfigFormOpen] = useState(false);
    const [searchInput, setSearchInput] = useState("");

    const { data: rawConfigData, isLoading, isError, refetch } = useConfigurations({});

    const initialConfigData = rawConfigData?.configurations
        ? mapConfigurationsToFormValues(rawConfigData)
        : undefined;

    const handleSubmitConfigForm = async (formDataValues: ConfigurationsFormValues) => {
        try {
            const formData = new FormData();

            const flatKeys: Array<keyof ConfigurationsFormValues> = [
                'theme_color1', 'theme_color2', 'delivery_charge', 'delivery_duration',
                'min_stock_alert', 'store_name', 'contact_email',
                'contact_phone', 'store_address', 'business_days',
                'business_hours', 'facebook_link', 'instagram_link',
                'youtube_link', 'tiktok_link', 'cost_method'
            ];

            flatKeys.forEach(key => {
                const value = formDataValues[key];
                if (value !== undefined && value !== null) {
                    formData.append(key, String(value));
                }
            });

            formData.append('_method', 'PUT');

            const response = await updateConfiguration(formData);

            if (response.result) {
                setIsConfigFormOpen(false);
                refetch();
                dispatch(fetchSettings());
            }
        } catch (error) {
            toast.error(messages("Unexpected Error"));
            console.error('Error submitting configuration:', error);
        }
    };
    const handleRefresh = () => refetch();

    return {
        messages,
        initialConfigData,
        isLoading,
        isError,
        handleRefresh,
        setSearchInput,
        searchInput,
        setIsConfigFormOpen,
        isConfigFormOpen,
        handleSubmitConfigForm,
        costMethods: rawConfigData?.cost_methods?.available,
    };
}