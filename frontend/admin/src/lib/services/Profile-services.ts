import API_ENDPOINTS, { } from "../api-endpoints";
import axiosInstance from "../axiosInstance";



export const getCurrentUser = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.PROFILE.GET_CURRENT_USER);
        return response.data || { result: false, message: "noDataReceived" };
    } catch (error) {
        return { result: false, message: error };
    }
};

export const signOutRequest = async () => {
    try {
        const { data } = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT, {});
        return data || { result: false, message: "noDataReceived" };
    } catch (error) {
        return { result: false, message: "signOutError" };
    }
};

export const changePassword = async (current_password: string, new_password: string, new_password_confirmation: string) => {
    if (!current_password || !new_password || !new_password_confirmation) {
        return { message: "passwordsAndTokenRequired", result: false };
    }

    try {
        const { data } = await axiosInstance.post(API_ENDPOINTS.PROFILE.CHANGE_PASSWORD, { current_password, new_password, new_password_confirmation });
        return data || { result: false, message: "noDataReceived" };
    } catch (error) {
        return { result: false, message: "resetPasswordError" };
    }
};
