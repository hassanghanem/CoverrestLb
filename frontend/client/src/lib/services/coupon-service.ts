import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import { GetCouponsResponse } from "@/types/response.interfaces";


export const getCoupons = async (params: Record<string, any>): Promise<GetCouponsResponse> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.COUPONS.LIST, {
            params,
        });
        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message || "Failed to fetch coupon",
            coupons: [],
            pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 },
        };
    }
};

export const applyCoupon = async (couponCode: string) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.COUPON.APPLY, {
            coupon_code: couponCode,
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

export const removeCoupon = async () => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.COUPON.REMOVE);
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