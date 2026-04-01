import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";

export const generateCaptcha = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.CAPTCHA.GENERATE, {});
        return response.data;
    } catch (error: any) {
        showApiErrorToasts(error?.response?.data || {});
        return {
            result: false,
            message: error?.response?.data?.message,
        };
    }
};