/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetCurrenciesResponse } from "@/types/response.interfaces";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";

export const getCurrencies = async (params: Record<string, any>): Promise<GetCurrenciesResponse> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.CURRENCIES.LIST, { params });
        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message || "Failed to fetch currencies",
            currencies: [],
            pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 },
        };
    }
};

export const getCurrencyById = async (id: number) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.CURRENCIES.DETAILS(id));
        return response.data;
    } catch (error) {
        return { result: false, message: error };
    }
};

export const createCurrency = async (currencyData: FormData) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.CURRENCIES.CREATE, currencyData);
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

export const updateCurrency = async (currencyId: number, currencyData: FormData) => {
    try {
        currencyData.append("_method", "PUT"); // Laravel expects PUT override
        const response = await axiosInstance.post(API_ENDPOINTS.CURRENCIES.UPDATE(currencyId), currencyData);
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

export const deleteCurrency = async (currencyId: number) => {
    try {
        const response = await axiosInstance.delete(API_ENDPOINTS.CURRENCIES.DELETE(currencyId));
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
