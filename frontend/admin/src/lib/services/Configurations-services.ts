/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetConfigurationsResponse } from "@/types/response.interfaces";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";

export const getConfigurations = async (params: Record<string, any>): Promise<GetConfigurationsResponse> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.CONFIGURATIONS.LIST, {
            params,
        });
        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message || "Failed to fetch configurations",
            configurations: [],
            
        };
    }
};



export const updateConfiguration = async ( configurationData: FormData) => {
    try {
        configurationData.append('_method', 'PUT');
        const response = await axiosInstance.post(API_ENDPOINTS.CONFIGURATIONS.UPDATE, configurationData);
        if (response.data.result) {
            toast.success(response.data.message);
        } else {
            showApiErrorToasts(response.data);
        }

        return response.data;
    } catch (error: any) {
        showApiErrorToasts(error?.response?.data || {});
        return {
            result: false,
            message: error?.response?.data?.message,
        };
    }
};
