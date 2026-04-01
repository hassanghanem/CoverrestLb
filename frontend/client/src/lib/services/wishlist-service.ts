import { GetWishlistResponse } from "@/types/response.interfaces";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";

// Get current cart
export const getWishlist = async (params: Record<string, any>): Promise<GetWishlistResponse> => {
    try {
        const { data } = await axiosInstance.get(API_ENDPOINTS.WISHLIST.GET,{params});
        return data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message ,
            wishlist: [],
            pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 },

        };
    }
};


export const addOrRemoveWishlistItem = async (product_id: number) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.WISHLIST.ADD_OR_REMOVE, {
            product_id,
        });
        if (response.data.result) {
            toast.success(response.data.message);
        } else {
            showApiErrorToasts(response.data);
        }

        return response.data;
    } catch (error: any) {
        showApiErrorToasts(error?.response?.data);
        return {
            result: false,
            message: error?.response?.data?.message,
        };
    }
};