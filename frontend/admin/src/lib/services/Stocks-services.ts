/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetStocksResponse } from "@/types/response.interfaces";

import axiosInstance from "../axiosInstance";
import API_ENDPOINTS from "../api-endpoints";

export const getStocks = async (params: Record<string, any>): Promise<GetStocksResponse> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.STOCKS.LIST, { params });
        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message || "Failed to fetch stocks",
            stocks: [],
            pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 },
        };
    }
};
