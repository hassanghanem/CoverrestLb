/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetUsersResponse } from "@/types/response.interfaces";
import API_ENDPOINTS, { } from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";



export const getUsers = async (params: Record<string, any>): Promise<GetUsersResponse> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.USERS.LIST, {
            params,
        });
        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message || "Failed to fetch users",
            users: [],
            pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 },
        };
    }
};


export const getUserById = async (id: number) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.USERS.DETAILS(id));
        return response.data;
    } catch (error) {
        return { result: false, message: error };
    }
};


export const createUser = async (userData: any) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.USERS.CREATE, userData);
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

export const updateUser = async (userId: number, userData: any) => {
    try {
        const response = await axiosInstance.put(API_ENDPOINTS.USERS.UPDATE(userId), userData);
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

export const deleteUser = async (userId: number) => {
    try {
        const response = await axiosInstance.delete(API_ENDPOINTS.USERS.DELETE(userId));
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