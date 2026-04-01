import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";


// Add or update an item in the cart
export const createOrder = async (payment_method: string,
    notes: string,
    address_id: number,) => {

    try {
        const response= await axiosInstance.post(API_ENDPOINTS.CHECKOUT.PLACE_ORDER, {
            payment_method,
            notes,
            address_id,

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