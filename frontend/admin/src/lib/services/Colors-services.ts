/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetColorsResponse } from "@/types/response.interfaces";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";

export const getColors = async (params: Record<string, any>): Promise<GetColorsResponse> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.COLORS.LIST, {
            params,
        });
        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message || "Failed to fetch colors",
            colors: [],
            pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 },
        };
    }
};

export const getColorById = async (id: number) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.COLORS.DETAILS(id));
        return response.data;
    } catch (error) {
        return { result: false, message: error };
    }
};

export const createColor = async (colorData: FormData) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.COLORS.CREATE, colorData);
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
export const updateColor = async (colorId: number, colorData: FormData) => {
    try {
        colorData.append('_method', 'PUT');
        const response = await axiosInstance.post(API_ENDPOINTS.COLORS.UPDATE(colorId), colorData);
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

export const deleteColor = async (colorId: number) => {
    try {
        const response = await axiosInstance.delete(API_ENDPOINTS.COLORS.DELETE(colorId));
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