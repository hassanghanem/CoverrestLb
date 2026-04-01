/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetClientsResponse } from "@/types/response.interfaces";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";

export const getClients = async (params: Record<string, any>): Promise<GetClientsResponse> => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.CLIENTS.LIST, {
      params,
    });
    return response.data;
  } catch (error: any) {
    return {
      result: false,
      message: error?.response?.data?.message || "Failed to fetch clients",
      clients: [],
      pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 },
    };
  }
};

export const getClientById = async (id: number) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.CLIENTS.DETAILS(id));
    return response.data;
  } catch (error: any) {
    return { result: false, message: error?.response?.data?.message || "Failed to fetch client" };
  }
};

export const createClient = async (data: FormData) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.CLIENTS.CREATE, data);
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
export const updateClient = async (id: number, data: FormData) => {
  try {
    data.append('_method', 'PUT');
    const response = await axiosInstance.post(API_ENDPOINTS.CLIENTS.UPDATE(id), data);
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

export const deleteClient = async (id: number) => {
  try {
    const response = await axiosInstance.delete(API_ENDPOINTS.CLIENTS.DELETE(id));
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