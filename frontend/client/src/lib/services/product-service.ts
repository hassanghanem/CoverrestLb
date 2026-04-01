import { GetProductResponse } from "@/types/response.interfaces";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";
export const getProductBySlug = async (slug: string): Promise<GetProductResponse> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.PRODUCT.DETAILS(slug));
        return response.data;
    } catch (error: any) {
        return {
            result: false,
            message: error?.response?.data?.message,
            related_products: [],
        };
    }
};
