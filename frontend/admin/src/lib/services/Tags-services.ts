/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetTagsResponse } from "@/types/response.interfaces";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";

export const getTags = async (params: Record<string, any>): Promise<GetTagsResponse> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.TAGS.LIST, {
            params,
        });
        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message || "Failed to fetch tags",
            tags: [],
            pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 },
        };
    }
};

export const getTagById = async (id: number) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.TAGS.DETAILS(id));
        return response.data;
    } catch (error) {
        return { result: false, message: error };
    }
};

export const createTag = async (tagData: FormData) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.TAGS.CREATE, tagData);
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
export const updateTag = async (tagId: number, tagData: FormData) => {
    try {
        tagData.append('_method', 'PUT');
        const response = await axiosInstance.post(API_ENDPOINTS.TAGS.UPDATE(tagId), tagData);
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
export const deleteTag = async (tagId: number) => {
    try {
        const response = await axiosInstance.delete(API_ENDPOINTS.TAGS.DELETE(tagId));
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