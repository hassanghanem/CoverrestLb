import { useDashboard } from "./useDashboard";

export const useDashboardLogic = () => {
  const { data, isLoading, isError, error,refetch } = useDashboard({});

  const kpis = data?.kpis ?? {
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
  };

  const charts = data?.charts ?? {
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
  };

  const growthRate = typeof kpis.growthRate === "number" ? kpis.growthRate : 0;

  return {
    kpis,
    charts,
    isLoading,
    isError,
    error,
    growthRate,
    refetch,
  };
};