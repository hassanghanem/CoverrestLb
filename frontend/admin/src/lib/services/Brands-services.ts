/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetBrandsResponse } from "@/types/response.interfaces";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";

export const getBrands = async (params: Record<string, any>): Promise<GetBrandsResponse> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.BRANDS.LIST, {
            params,
        });
        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message || "Failed to fetch brands",
            brands: [],
            pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 },
        };
    }
};

export const getBrandById = async (id: number) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.BRANDS.DETAILS(id));
        return response.data;
    } catch (error) {
        return { result: false, message: error };
    }
};

export const createBrand = async (brandData: FormData) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.BRANDS.CREATE, brandData);
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
export const updateBrand = async (brandId: number, brandData: FormData) => {
    try {
        brandData.append('_method', 'PUT');
        const response = await axiosInstance.post(API_ENDPOINTS.BRANDS.UPDATE(brandId), brandData);
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
export const deleteBrand = async (brandId: number) => {
    try {
        const response = await axiosInstance.delete(API_ENDPOINTS.BRANDS.DELETE(brandId));
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