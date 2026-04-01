import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";

export const getCsrfCookies = async () => {
    try {
        const response = await axiosInstance.get(
            API_ENDPOINTS.AUTH.CSRF,

        );

        return response.data;
    } catch (error) {
        return { result: false, message: error };
    }
};

// Get all active sessions
export const getSessions = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.SESSIONS.LIST);
        return response.data;
    } catch (error) {
        return { result: false, message: error };
    }
};

// Logout from other sessions
export const logoutOtherSessions = async (password: string) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.SESSIONS.LOGOUT_OTHERS, { password });
        // revalidatePath("/dashboard/profile");
        return response.data;
    } catch (error) {
        return { result: false, message: error };
    }
};

// Destroy a specific session
export const destroySession = async (password: string, sessionId: string) => {

    try {
        const response = await axiosInstance.post(API_ENDPOINTS.SESSIONS.DESTROY, { sessionId, password });
        // revalidatePath("/dashboard/profile");
        return response.data;
    } catch (error) {
    
        return { result: false, message: error };
    }
};
