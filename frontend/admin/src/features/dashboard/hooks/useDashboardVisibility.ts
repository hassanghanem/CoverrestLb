// hooks/useDashboardVisibility.ts
import { useState, useEffect } from 'react';

export type KpiVisibility = {
  totalRevenue: boolean;
  monthlyRevenue: boolean;
  avgOrderValue: boolean;
  totalOrders: boolean;
  abandonedCarts: boolean;
  activeClients: boolean;
  totalClients: boolean;
  repeatCustomers: boolean;
  newCustomersThisMonth: boolean;
  returnsRate: boolean;
  totalRefundsAmount: boolean;
  totalReturnOrders: boolean;
  inventoryValue: boolean;
  lowStockCount: boolean;
  avgFulfillmentDays: boolean;
  totalSessions: boolean;
  conversionRate: boolean;
  growthRate: boolean;
};

export type ChartVisibility = {
  revenueByDay: boolean;
  ordersByDay: boolean;
  ordersByStatus: boolean;
  refundsByDay: boolean;
  topProducts: boolean;
  salesByCategory: boolean;
  topCustomers: boolean;
  couponUsage: boolean;
  sessionsByDevice: boolean;
  newVsReturning: boolean;
};

// Most important KPIs and charts (business critical)
const DEFAULT_VISIBLE_KPIS: (keyof KpiVisibility)[] = [
  'totalRevenue',
  'monthlyRevenue',
  'totalOrders',
  'growthRate',
  'conversionRate',
  'activeClients',
];

const DEFAULT_VISIBLE_CHARTS: (keyof ChartVisibility)[] = [
  'revenueByDay',
  'ordersByDay',
  'topProducts',
  'salesByCategory',
  'newVsReturning',
];

// Create initial state objects
const createDefaultKpis = (): KpiVisibility => {
  const kpis = {} as KpiVisibility;
  const kpiKeys: (keyof KpiVisibility)[] = [
    'totalRevenue', 'monthlyRevenue', 'avgOrderValue', 'totalOrders', 'abandonedCarts',
    'activeClients', 'totalClients', 'repeatCustomers', 'newCustomersThisMonth',
    'returnsRate', 'totalRefundsAmount', 'totalReturnOrders', 'inventoryValue',
    'lowStockCount', 'avgFulfillmentDays', 'totalSessions', 'conversionRate', 'growthRate'
  ];
  
  kpiKeys.forEach(key => {
    kpis[key] = DEFAULT_VISIBLE_KPIS.includes(key);
  });
  
  return kpis;
};

const createDefaultCharts = (): ChartVisibility => {
  const charts = {} as ChartVisibility;
  const chartKeys: (keyof ChartVisibility)[] = [
    'revenueByDay', 'ordersByDay', 'ordersByStatus', 'refundsByDay',
    'topProducts', 'salesByCategory', 'topCustomers', 'couponUsage',
    'sessionsByDevice', 'newVsReturning'
  ];
  
  chartKeys.forEach(key => {
    charts[key] = DEFAULT_VISIBLE_CHARTS.includes(key);
  });
  
  return charts;
};

export const useDashboardVisibility = () => {
  const [visibleKpis, setVisibleKpis] = useState<KpiVisibility>(() => {
    // Try to load from localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard-kpi-visibility');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Merge with defaults to ensure all keys exist
          return { ...createDefaultKpis(), ...parsed };
        } catch (e) {
          console.error('Failed to parse saved KPI visibility:', e);
        }
      }
    }
    return createDefaultKpis();
  });

  const [visibleCharts, setVisibleCharts] = useState<ChartVisibility>(() => {
    // Try to load from localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard-chart-visibility');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Merge with defaults to ensure all keys exist
          return { ...createDefaultCharts(), ...parsed };
        } catch (e) {
          console.error('Failed to parse saved chart visibility:', e);
        }
      }
    }
    return createDefaultCharts();
  });

  // Save to localStorage whenever visibility changes
  useEffect(() => {
    localStorage.setItem('dashboard-kpi-visibility', JSON.stringify(visibleKpis));
  }, [visibleKpis]);

  useEffect(() => {
    localStorage.setItem('dashboard-chart-visibility', JSON.stringify(visibleCharts));
  }, [visibleCharts]);

  const toggleKpi = (kpi: keyof KpiVisibility) => {
    setVisibleKpis(prev => ({ ...prev, [kpi]: !prev[kpi] }));
  };

  const toggleChart = (chart: keyof ChartVisibility) => {
    setVisibleCharts(prev => ({ ...prev, [chart]: !prev[chart] }));
  };

  const resetToDefaults = () => {
    setVisibleKpis(createDefaultKpis());
    setVisibleCharts(createDefaultCharts());
  };

  const showAll = () => {
    setVisibleKpis(prev => {
      const allTrue = { ...prev };
      Object.keys(allTrue).forEach(key => {
        allTrue[key as keyof KpiVisibility] = true;
      });
      return allTrue;
    });
    
    setVisibleCharts(prev => {
      const allTrue = { ...prev };
      Object.keys(allTrue).forEach(key => {
        allTrue[key as keyof ChartVisibility] = true;
      });
      return allTrue;
    });
  };

  const hideAll = () => {
    setVisibleKpis(prev => {
      const allFalse = { ...prev };
      Object.keys(allFalse).forEach(key => {
        allFalse[key as keyof KpiVisibility] = false;
      });
      return allFalse;
    });
    
    setVisibleCharts(prev => {
      const allFalse = { ...prev };
      Object.keys(allFalse).forEach(key => {
        allFalse[key as keyof ChartVisibility] = false;
      });
      return allFalse;
    });
  };

  return {
    visibleKpis,
    visibleCharts,
    setVisibleKpis,
    setVisibleCharts,
    toggleKpi,
    toggleChart,
    resetToDefaults,
    showAll,
    hideAll,
  };
};