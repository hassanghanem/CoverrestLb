/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetAddressesResponse } from "@/types/response.interfaces";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";

export const getAddresses = async (params: Record<string, any>): Promise<GetAddressesResponse> => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.ADDRESSES.LIST, {
      params,
    });
    return response.data;
  } catch (error: any) {
    return {
      result: false,
      message: error?.response?.data?.message || "Failed to fetch addresses",
      addresses: [],
      pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 },
    };
  }
};

export const getAddressById = async (id: number) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.ADDRESSES.DETAILS(id));
    return response.data;
  } catch (error: any) {
    return { result: false, message: error?.response?.data?.message || "Failed to fetch address" };
  }
};

export const createAddress = async (data: FormData) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.ADDRESSES.CREATE, data);
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

export const updateAddress = async (id: number, data: FormData) => {
  try {
    data.append('_method', 'PUT');
    const response = await axiosInstance.post(API_ENDPOINTS.ADDRESSES.UPDATE(id), data);
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

export const deleteAddress = async (id: number) => {
  try {
    const response = await axiosInstance.delete(API_ENDPOINTS.ADDRESSES.DELETE(id));
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