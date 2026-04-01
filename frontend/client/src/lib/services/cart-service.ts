import { GetCartResponse } from "@/types/response.interfaces";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";

// Get current cart
export const getCart = async (): Promise<GetCartResponse> => {
    try {
        const { data } = await axiosInstance.get(API_ENDPOINTS.CART.GET);
        return data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message,
            cart: undefined,
            related_products: [],
        };
    }
};


export const addOrUpdateCartItem = async (variant_id: number, quantity: number) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.CART.ADD_OR_UPDATE, {
            variant_id,
            quantity,
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
            message: error?.response?.data?.message || "Unknown error",
        };
    }
};
export const removeCartItem = async (variant_id: number) => {
    try {
        const response = await axiosInstance.delete(API_ENDPOINTS.CART.REMOVE, {
            data: { variant_id },
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