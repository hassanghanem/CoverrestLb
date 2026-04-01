import { GetHomeSectionsResponse } from "@/types/response.interfaces";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";

export const getHome = async (): Promise<GetHomeSectionsResponse> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.HOME.LIST);
        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message,
            home_sections: []
        };
    }
};
