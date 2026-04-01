import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";

export const submitContact = async (data: FormData) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.CONTACTS.CREATE, data);
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
