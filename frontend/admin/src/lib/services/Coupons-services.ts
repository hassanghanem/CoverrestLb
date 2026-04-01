/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetCouponsResponse } from "@/types/response.interfaces";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";

export const getCoupons = async (params: Record<string, any>): Promise<GetCouponsResponse> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.COUPONS.LIST, { params });
        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message || "Failed to fetch coupons",
            coupons: [],
            pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 },
        };
    }
};

export const getCouponById = async (id: number) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.COUPONS.DETAILS(id));
        return response.data;
    } catch (error: any) {
        return { result: false, message: error?.response?.data?.message || "Failed to fetch coupon" };
    }
};

export const createCoupon = async (data: FormData) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.COUPONS.CREATE, data);
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

export const updateCoupon = async (id: number, data: FormData) => {
    try {
        data.append("_method", "PUT");
        const response = await axiosInstance.post(API_ENDPOINTS.COUPONS.UPDATE(id), data);
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

export const deleteCoupon = async (id: number): Promise<{ result: boolean; message: string }> => {
    try {
        const response = await axiosInstance.delete(API_ENDPOINTS.COUPONS.DELETE(id));
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