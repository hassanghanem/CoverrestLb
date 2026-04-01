/* eslint-disable @typescript-eslint/no-explicit-any */
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
      message: error?.response?.data?.message,
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
            message: error?.response?.data?.message,
        };
    }
};