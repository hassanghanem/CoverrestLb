import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";

export const newsletterSubscribe = async (email: string, recaptchaToken: string) => {
    if (!email || !recaptchaToken) {
        return {
            message: "email Required",
            result: false,
        };
    }

    try {
        const response = await axiosInstance.post(API_ENDPOINTS.NEWSLETTER.SUBSCRIBE, {
            email,
            recaptcha_token: recaptchaToken,
        });

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
