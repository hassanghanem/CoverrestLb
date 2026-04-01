/* eslint-disable @typescript-eslint/no-explicit-any */
import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import { GetOrdersResponse } from "@/types/response.interfaces";

export const getPreOrders = async (
  params: Record<string, any>
): Promise<GetOrdersResponse> => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.PRE_ORDERS.LIST, {
      params,
    });
    return response.data;
  } catch (error: any) {
    return {
      result: false,
      message: error?.response?.data?.message || "Failed to fetch pre-orders",
      orders: [],
      pagination: {
        total: 0,
        per_page: 10,
        current_page: 1,
        last_page: 1,
      },
    };
  }
};

export const getPreOrderById = async (id: number) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.PRE_ORDERS.DETAILS(id));
    return response.data;
  } catch (error: any) {
    return {
      result: false,
      message: error?.response?.data?.message || "Failed to fetch pre-order",
    };
  }
};

export const createPreOrder = async (data: any) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.PRE_ORDERS.CREATE, data);
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

export const updatePreOrder = async (
  id: number,
  data: {
    // Preorder-level fields
    convert_to_order?: number; // 0 or 1
    payment_method?: string;
    payment_status?: number; // 0–3
    address_id?: number;
    coupon_code?: string | null;
    notes?: string;
    delivery_amount?: number;

    // Preorder details (line items)
    order_details?: Array<{
      // Existing line: identified by id
      id?: number;
      // New line: identified by variant_id
      variant_id?: number;
      quantity?: number;
      price?: number;
      discount?: number;
    }>;
  }
) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.PRE_ORDERS.UPDATE(id), data);
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