import { GetPageResponse, GetPagesResponse } from "@/types/response.interfaces";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";
export const getPages = async (
    params: Record<string, any>
): Promise<GetPagesResponse> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.PAGES.LIST, { params });
        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message || "Failed to fetch pages",
            pages: [],
            pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 },
        };
    }
};


export const getPageById = async (id: number): Promise<GetPageResponse> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.PAGES.DETAILS(id));
        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message || "Failed to fetch page details",
        };
    }
};

export const updatePage = async (pageId: number, pageData: FormData) => {
    try {
        pageData.append("_method", "PUT");
        const response = await axiosInstance.post(API_ENDPOINTS.PAGES.UPDATE(pageId), pageData);
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
            message: error?.response?.data?.message || "Failed to update page",
        };
    }
};

