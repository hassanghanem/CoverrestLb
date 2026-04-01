import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";

export const sendMagicLink = async (data: {
  email: string;
  name?: string;
  agreeTerms?: boolean;
  agreeMarketing?: boolean;
  recaptchaToken: string;
}) => {
  const { email, name, agreeTerms, agreeMarketing, recaptchaToken } = data;

  if (!email || !recaptchaToken) {
    return { result: false, message: "Email and recaptcha token are required." };
  }

  try {
    const payload = {
      email,
      name: name || undefined,
      agreeTerms: agreeTerms || undefined,
      agreeMarketing: agreeMarketing || false,
      recaptcha_token: recaptchaToken,
    };

    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.SEND_MAGIC_LINK, payload);

    if (response.data.result) {
      toast.success(response.data.message);
    } else {
      showApiErrorToasts(response.data);
    }

    return response.data;
  } catch (error: any) {
    showApiErrorToasts(error?.response?.data || {});
    return { result: false, message: error?.response?.data?.message || "Something went wrong" };
  }
};

export const verifyMagicLink = async (token: string) => {
  if (!token) return { result: false, message: "Token is required." };

  try {
    const response = await axiosInstance.get(API_ENDPOINTS.AUTH.VERIFY_MAGIC_LINK(token));
    
    if (response.data.result) {
      toast.success(response.data.message);
    } else {
      showApiErrorToasts(response.data);
    }

    return response.data;

  } catch (error: any) {
    showApiErrorToasts(error?.response?.data || {});
    return { result: false, message: error?.response?.data?.message || "Something went wrong" };
  }
};

export const loginWithGoogle = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.AUTH.GOOGLE_REDIRECT);
    
    if (response.data.result && response.data.url) {
      return response.data; 
    } else {
      showApiErrorToasts(response.data);
      return { result: false, message: response.data.message || "Unable to initiate Google login." };
    }
  } catch (error: any) {
    showApiErrorToasts(error?.response?.data || {});
    return { result: false, message: "Unable to initiate Google login." };
  }
};

export const handleGoogleCallback = async (token: string) => {
  if (!token) return { result: false, message: "Token is missing from Google callback." };

  try {
    
    toast.success("Google login successful");
    return { result: true, token };
  } catch (error: any) {
    showApiErrorToasts(error?.response?.data || {});
    return { result: false, message: "Google login failed." };
  }
};