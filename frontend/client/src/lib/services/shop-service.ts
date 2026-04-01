import { GetShopResponse } from "@/types/response.interfaces";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";


type Filters = {
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  per_page?: number;
  categories?: number[];
  homeSections?: number[];

  sizes?: number[];
  colors?: number[];
  
  brands?: number[];
  priceRange?: [number, number];
  page?: number;
};

export const fetchShop = async (filters: Filters): Promise<GetShopResponse> => {
  try {
    const params: Record<string, any> = {};

    if (filters.search) {
      params.search = filters.search;
    }
    if (filters.sort) {
      params.sort = filters.sort;
    }
    if (filters.order) {
      params.order = filters.order;
    }
    if (filters.per_page && filters.per_page >= 1 && filters.per_page <= 100) {
      params.per_page = filters.per_page;
    }
    if (filters.categories && filters.categories.length > 0) {
      params.categories = filters.categories;
    }
    if (filters.homeSections && filters.homeSections.length > 0) {
      params.homeSections = filters.homeSections;
    }
    if (filters.sizes && filters.sizes.length > 0) {
      params.sizes = filters.sizes;
    }
    if (filters.colors && filters.colors.length > 0) {
      params.colors = filters.colors;
    }
    if (filters.brands && filters.brands.length > 0) {
      params.brands = filters.brands;
    }
    if (filters.priceRange && filters.priceRange.length === 2) {
      params.price_min = filters.priceRange[0];
      params.price_max = filters.priceRange[1];
    }
    if (filters.page && filters.page > 0) {
      params.page = filters.page;
    }

 
    const response = await axiosInstance.get(API_ENDPOINTS.SHOP.LIST, { params });

    return response.data;
  } catch (error: any) {
    return {
      result: false,
      message: error?.response?.data?.message,
      products: [],
      pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 },
  
    };
  }
};
