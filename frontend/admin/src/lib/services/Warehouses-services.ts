/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetWarehousesResponse } from "@/types/response.interfaces";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";

export const getWarehouses = async (params: Record<string, any>): Promise<GetWarehousesResponse> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.WAREHOUSES.LIST, {
            params,
        });
        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message || "Failed to fetch warehouses",
            warehouses: [],
            pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 },
        };
    }
};

export const getWarehouseById = async (id: number) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.WAREHOUSES.DETAILS(id));
        return response.data;
    } catch (error) {
        return { result: false, message: error };
    }
};

export const createWarehouse = async (warehouseData: FormData) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.WAREHOUSES.CREATE, warehouseData);
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

export const updateWarehouse = async (warehouseId: number, warehouseData: FormData) => {
    try {
        warehouseData.append('_method', 'PUT');
        const response = await axiosInstance.post(API_ENDPOINTS.WAREHOUSES.UPDATE(warehouseId), warehouseData);
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

export const deleteWarehouse = async (warehouseId: number) => {
    try {
        const response = await axiosInstance.delete(API_ENDPOINTS.WAREHOUSES.DELETE(warehouseId));
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