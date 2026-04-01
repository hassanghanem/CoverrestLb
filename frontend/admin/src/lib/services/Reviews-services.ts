import { GetReviewsResponse } from "@/types/response.interfaces";
import API_ENDPOINTS, { } from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";


export const getReviews = async (params: Record<string, any>): Promise<GetReviewsResponse> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.REVIEWS.LIST, {
            params,
        });
        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message || "Failed to fetch reviews",
            reviews: [],
            pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 },
        };
    }
};


export const updateReview = async (id: number, data: FormData) => {

    try {
        data.append('_method', 'PUT');
        const response = await axiosInstance.post(API_ENDPOINTS.REVIEWS.UPDATE(id), data, {

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
