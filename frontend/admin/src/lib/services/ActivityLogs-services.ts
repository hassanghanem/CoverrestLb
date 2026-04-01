/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetActivityLogsResponse } from "@/types/response.interfaces";
import API_ENDPOINTS, { } from "../api-endpoints";
import axiosInstance from "../axiosInstance";



export const getActivityLogs= async (params: Record<string, any>): Promise<GetActivityLogsResponse> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.ACTIVITY_LOGS.LIST, {
            params,
        });
        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message || "Failed to fetch data",
            logs: [],
            pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 },
        };
    }
};
