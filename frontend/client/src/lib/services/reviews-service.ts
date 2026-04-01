/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetReviewsResponse } from "@/types/response.interfaces";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";
import { showApiErrorToasts } from "@/utils/toastErrorHandler";
import { toast } from "sonner";

/**
 * Fetch list of reviews with pagination
 */
export const getReviews = async (params: Record<string, any>): Promise<GetReviewsResponse> => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.REVIEWS.LIST, { params });
    return response.data;
  } catch (error: any) {
    return {
      result: false,
      message: error?.response?.data?.message ,
      reviews: [],
      pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 },
    };
  }
};


/**
 * Create a new review
 */
export const createReview = async (data: FormData) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.REVIEWS.CREATE, data);
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

export const deleteReview = async (id: number) => {
  try {
    const response = await axiosInstance.delete(API_ENDPOINTS.REVIEWS.DELETE(id));
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
