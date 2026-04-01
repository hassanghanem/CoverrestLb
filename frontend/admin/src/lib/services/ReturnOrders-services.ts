/* eslint-disable @typescript-eslint/no-explicit-any */
import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import {
    GetReturnOrdersResponse,
    ReturnOrderResponse,
} from "@/types/response.interfaces";

export const getReturnOrders = async (
    params: Record<string, any>
): Promise<GetReturnOrdersResponse> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.RETURN_ORDERS.LIST, { params });
        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message || "Failed to fetch return orders",
            return_orders: [],
            pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 },
        };
    }
};

export const getReturnOrderById = async (id: number): Promise<ReturnOrderResponse> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.RETURN_ORDERS.DETAILS(id));
        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message || "Failed to fetch return order",
        };
    }
};

export const createReturnOrder = async (data: any): Promise<ReturnOrderResponse> => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.RETURN_ORDERS.CREATE, data);
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
export const updateReturnOrderStatus = async (
    id: number,
    data: { status?: number }
): Promise<ReturnOrderResponse> => {
    try {
        const response = await axiosInstance.put(API_ENDPOINTS.RETURN_ORDERS.UPDATE(id), data);
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