/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetTeamMembersResponse } from "@/types/response.interfaces";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";

export const getTeamMembers = async (params: Record<string, any>): Promise<GetTeamMembersResponse> => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.TEAM_MEMBERS.LIST, {
      params,
    });
    return response.data;
  } catch (error: any) {
    return {
      result: false,
      message: error?.response?.data?.message || "Failed to fetch team members",
      team_members: [],
      pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 },
    };
  }
};

export const getTeamMemberById = async (id: number) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.TEAM_MEMBERS.DETAILS(id));
    return response.data;
  } catch (error) {
    return { result: false, message: error };
  }
};

export const createTeamMember = async (data: FormData) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.TEAM_MEMBERS.CREATE, data);
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
export const updateTeamMember = async (id: number, data: FormData) => {
  try {
    data.append("_method", "PUT");
    const response = await axiosInstance.post(API_ENDPOINTS.TEAM_MEMBERS.UPDATE(id), data);
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

export const deleteTeamMember = async (id: number) => {
  try {
    const response = await axiosInstance.delete(API_ENDPOINTS.TEAM_MEMBERS.DELETE(id));
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
