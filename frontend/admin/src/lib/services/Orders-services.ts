/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "sonner";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import { GetOrdersResponse, } from "@/types/response.interfaces";
import { showApiErrorToasts } from "@/utils/toastErrorHandler";

export const getOrders = async (params: Record<string, any>): Promise<GetOrdersResponse> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.ORDERS.LIST, { params });
        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message || "Failed to fetch orders",
            orders: [],
            pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 },
        };
    }
};

export const getOrderById = async (id: number) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.ORDERS.DETAILS(id));
        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message || "Failed to fetch order",
        };
    }
};

export const createOrder = async (data: any) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.ORDERS.CREATE, data);

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
export const updateOrder = async (
    id: number,
    data: {
        // Order-level fields
        status?: number; // 0–10
        payment_method?: string; // payment method code
        payment_status?: number; // 0–3
        address_id?: number;
        coupon_code?: string | null;
        notes?: string;
        delivery_amount?: number;

        // Order details (line items)
        order_details?: Array<{
            // Existing line: identified by id
            id?: number;
            // New line: identified by variant_id
            variant_id?: number;
            quantity: number;
            price?: number;
            discount?: number;
            warehouse_id?: number;
            cost_price?: number;
        }>;
    }
): Promise<any> => {
    try {
        const response = await axiosInstance.put(API_ENDPOINTS.ORDERS.UPDATE(id), data);
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

export const fetchOrderReceiptHtml = async (id: number): Promise<string | null> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.ORDERS.RECEIPT(id), {
            responseType: "text",
        });
        return response.data as string;
    } catch (error: any) {
        showApiErrorToasts(error?.response?.data || {});
        return null;
    }
};