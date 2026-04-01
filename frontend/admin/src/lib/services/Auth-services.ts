import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import API_ENDPOINTS, { } from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import { toast } from "sonner";

export const login = async (email: string, password: string, recaptchaToken: string) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, {
            email,
            password,
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

export const verifyOtp = async (email: string, password: string, otp: string, recaptchaToken: string) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY_OTP, {
            email,
            password,
            otp,
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

export const forgetPassword = async (email: string, recaptchaToken: string) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
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

export const resetPassword = async (
    token: string,
    email: string,
    password: string,
    password_confirmation: string,
    recaptchaToken: string
) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
            email,
            password,
            password_confirmation,
            token,
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