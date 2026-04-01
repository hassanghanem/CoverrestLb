/* eslint-disable @typescript-eslint/no-explicit-any */
import { SalesReportResponse, ProductReportResponse, CategoryReportResponse, ClientReportResponse, PaymentReportResponse, RefundsReportResponse, DeliveryPerformanceResponse } from "@/types/response.interfaces";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";

// Response interfaces for each report


// Sales Report
export const getSalesReport = async (params?: Record<string, any>): Promise<SalesReportResponse> => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.REPORTS.SALES, {
      params,
    });
    return response.data;
  } catch (error: any) {
    return {
      result: false,
      message: error?.response?.data?.message || "Failed to fetch sales report",
      data: [],
    };
  }
};

// Product Report
export const getProductReport = async (params?: Record<string, any>): Promise<ProductReportResponse> => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.REPORTS.PRODUCTS, {
      params,
    });
    return response.data;
  } catch (error: any) {
    return {
      result: false,
      message: error?.response?.data?.message || "Failed to fetch product report",
      data: [],
    };
  }
};

// Category Report
export const getCategoryReport = async (params?: Record<string, any>): Promise<CategoryReportResponse> => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.REPORTS.CATEGORIES, {
      params,
    });
    return response.data;
  } catch (error: any) {
    return {
      result: false,
      message: error?.response?.data?.message || "Failed to fetch category report",
      data: [],
    };
  }
};

// Client Report
export const getClientReport = async (params?: Record<string, any>): Promise<ClientReportResponse> => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.REPORTS.CLIENTS, {
      params,
    });
    return response.data;
  } catch (error: any) {
    return {
      result: false,
      message: error?.response?.data?.message || "Failed to fetch client report",
      data: [],
    };
  }
};

// Payment Report
export const getPaymentReport = async (params?: Record<string, any>): Promise<PaymentReportResponse> => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.REPORTS.PAYMENTS, {
      params,
    });
    return response.data;
  } catch (error: any) {
    return {
      result: false,
      message: error?.response?.data?.message || "Failed to fetch payment report",
      data: [],
    };
  }
};

// Refunds Report
export const getRefundsReport = async (params?: Record<string, any>): Promise<RefundsReportResponse> => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.REPORTS.REFUNDS, {
      params,
    });
    return response.data;
  } catch (error: any) {
    return {
      result: false,
      message: error?.response?.data?.message || "Failed to fetch refunds report",
      data: [],
    };
  }
};

// Delivery Performance Report
export const getDeliveryPerformanceReport = async (params?: Record<string, any>): Promise<DeliveryPerformanceResponse> => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.REPORTS.DELIVERY_PERFORMANCE, {
      params,
    });
    return response.data;
  } catch (error: any) {
    return {
      result: false,
      message: error?.response?.data?.message || "Failed to fetch delivery performance report",
      data: [],
    };
  }
};
