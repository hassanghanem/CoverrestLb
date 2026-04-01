/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetHomeSectionsResponse } from "@/types/response.interfaces";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";

export const getHomeSections = async (params: Record<string, any>): Promise<GetHomeSectionsResponse> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.HOME_SECTIONS.LIST, {
            params,
        });
        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message || "Failed to fetch home sections",
            home_sections: [],
            pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 },

        };
    }
};

export const getHomeSectionById = async (id: number) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.HOME_SECTIONS.DETAILS(id));
        return response.data;
    } catch (error) {
        return { result: false, message: error };
    }
};

export const createHomeSection = async (data: FormData) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.HOME_SECTIONS.CREATE, data);
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

export const updateHomeSection = async (id: number, data: FormData) => {
    try {
        data.append('_method', 'PUT');
        const response = await axiosInstance.post(API_ENDPOINTS.HOME_SECTIONS.UPDATE(id), data);
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

export const deleteHomeSection = async (id: number) => {
    try {
        const response = await axiosInstance.delete(API_ENDPOINTS.HOME_SECTIONS.DELETE(id));
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

export const deleteBanner = async (imageId: number) => {
    try {
        const response = await axiosInstance.delete(API_ENDPOINTS.HOME_BANNERS.DELETE(imageId));
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