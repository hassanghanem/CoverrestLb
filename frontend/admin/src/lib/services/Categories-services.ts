/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetCategoriesResponse } from "@/types/response.interfaces";
import API_ENDPOINTS, { } from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";


export const getCategories = async (params: Record<string, any>): Promise<GetCategoriesResponse> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.CATEGORIES.LIST, {
            params,
        });
        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message || "Failed to fetch categories",
            categories: [],
            pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 },
        };
    }
};


export const getCategoryById = async (id: number) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.CATEGORIES.DETAILS(id));
        return response.data;
    } catch (error) {
        return { result: false, message: error };
    }
};


export const createCategory = async (data: FormData) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.CATEGORIES.CREATE, data, {

        });
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

export const updateCategory = async (id: number, data: FormData) => {

    try {
        data.append('_method', 'PUT');
        const response = await axiosInstance.post(API_ENDPOINTS.CATEGORIES.UPDATE(id), data, {

        });
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

export const deleteCategory = async (id: number) => {
    try {
        const response = await axiosInstance.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
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