/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetDashboardResponse } from "@/types/response.interfaces";
import API_ENDPOINTS from "../api-endpoints";
import axiosInstance from "../axiosInstance";

export const getDashboard = async (
  params: Record<string, any> = {}
): Promise<GetDashboardResponse> => {
  try {
    const response = await axiosInstance.get<GetDashboardResponse>(
      API_ENDPOINTS.DASHBOARD.GET,
      { params }
    );
    return response.data;
  } catch (error: any) {
    return {
      result: false,
      message: error?.response?.data?.message || "Failed to fetch dashboard data",
      kpis: {
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        avgOrderValue: 0,
        totalClients: 0,
        activeClients: 0,
        conversionRate: 0,
        growthRate: 0,
        repeatCustomers: 0,
        newCustomersThisMonth: 0,
        returnsRate: 0,
        totalRefundsAmount: 0,
        abandonedCarts: 0,
        inventoryValue: 0,
        lowStockCount: 0,
        avgRefundPerReturn: 0,
        avgFulfillmentDays: null,
        totalReturnOrders: 0,
        totalSessions: 0,
      },
      charts: {
        revenueByDay: [],
        ordersByDay: [],
        ordersByStatus: [],
        refundsByDay: [],
        topProducts: [],
        salesByCategory: [],
        topCustomers: [],
        couponUsage: [],
        lowStock: [],
        sessionsByDevice: [],
        newVsReturning: { new: 0, returning: 0 },
      },
    };
  }
};