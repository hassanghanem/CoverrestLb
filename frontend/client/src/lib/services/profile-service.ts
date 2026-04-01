import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";
import API_ENDPOINTS, { } from "../api-endpoints";
import axiosInstance from "../axiosInstance";



export const getCurrentUser = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.PROFILE.GET_CUREENT_USER);
        return response.data;
    } catch (error) {
        return { result: false, message: error };
    }
};

export const signOutRequest = async () => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT, {});
        if (response.data.result) {
            toast.success(response.data.message);
        } else {
            showApiErrorToasts(response.data);
        }

        return response.data;
    } catch (error: any) {
        showApiErrorToasts(error?.response?.data );
        return {
            result: false,
            message: error?.response?.data?.message,
        };
    }
};

export const updateProfile = async (
  data: {
    name: string;
    gender?: string;
    birthdate?: string;
    phone?: string;
    order_updates?: boolean;
    newsletter?: boolean;
  }
) => {
  const { name, gender, birthdate, phone, order_updates, newsletter } = data;

  try {
    const payload = {
      name,
      gender: gender || undefined,
      birthdate: birthdate || undefined,
      phone: phone || undefined,
      order_updates: order_updates !== undefined ? order_updates : undefined,
      newsletter: newsletter !== undefined ? newsletter : undefined,
    };

    const response = await axiosInstance.post(API_ENDPOINTS.PROFILE.UPDATE, payload);

    if (response.data.result) {
      toast.success(response.data.message);
    } else {
      showApiErrorToasts(response.data);
    }

    return response.data;
  } catch (error: any) {
    showApiErrorToasts(error?.response?.data);
    return {
      result: false,
      message: error?.response?.data?.message 
    };
  }
};
export const deleteAccount = async () => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.PROFILE.DELETE);

        if (response.data.result) {
            toast.success(response.data.message);
        } else {
            showApiErrorToasts(response.data);
        }

        return response.data;
    } catch (error: any) {
        showApiErrorToasts(error?.response?.data);
        return {
            result: false,
            message: error?.response?.data?.message,
        };
    }
};
