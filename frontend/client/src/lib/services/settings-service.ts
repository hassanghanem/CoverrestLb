import { GetAllSettingsResponse } from "@/types/response.interfaces";
import API_ENDPOINTS, { } from "../api-endpoints";
import axiosInstance from "../axiosInstance";

export const getAllSettings = async (): Promise<GetAllSettingsResponse> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.SETTINGS.LIST, {

        });

        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message,
            categories: [],
            brands: [],
            currencies: [],
            colors: [],
            sizes: [],
            configurations: [],
            tags: [],
            sorts: [],
            homeSections: [],
            price_range: {
                max: 0,
                min: 1000
            },
            pages: [],
        };
    }
};
