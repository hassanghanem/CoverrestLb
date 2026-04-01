import { ActivityLog, Address, AvailabilityStatus, Brand, Category, Client, Color, Configuration, Contact, Coupon, Currency, HomeSection, Notification, Order, OrderStatus, Page, Pagination, PaymentMethodOption, Permission, Product, ProductVariant, ReturnOrder, ReturnOrderStatus, Review, Role, Size, Stock, StockAdjustment, Tag, Team, TeamMember, User, Warehouse } from "./api.interfaces";

export interface LoginResponse {
  result: boolean;
  message: string;
  otp: number | null;
}

export interface AuthResponse {
  result: boolean;
  message: string;
  user?: {
    email: string;
    name: string;
    token: string;
  } | null;
}

export interface ApiResponse {
  result: boolean;
  message: string;
}

export interface GetUsersResponse {
  result: boolean;
  message: string;
  users: User[];
  pagination: Pagination;
}

export interface GetCategoriesResponse {
  result: boolean;
  message: string;
  categories: Category[];
  pagination: Pagination;
}

export interface GetActivityLogsResponse {
  result: boolean;
  message: string;
  logs: ActivityLog[];
  pagination: Pagination;
}

export interface GetAllSettingsResponse {
  result: boolean;
  message: string;
  roles: Role[];
  permissions: Permission[];
  teams: Team[];
  categories: Category[];
  brands: Brand[];
  colors: Color[];
  sizes: Size[];
  configurations: Configuration[];
  tags: Tag[];
  warehouses: Warehouse[];
  order_statuses: OrderStatus[];
  payment_statuses: string[];
  payment_methods: PaymentMethodOption[];
  order_status_transitions: Record<number, number[]>;
  payment_status_transitions: Record<number, number[]>;
  availability_statuses: AvailabilityStatus[];

  return_order_statuses: ReturnOrderStatus[];
  return_order_status_transitions: Record<number, number[]>;
  order_sources: string[]
}


export interface GetBrandsResponse {
  result: boolean;
  message: string;
  brands: Brand[];
  pagination: Pagination;
}
export interface GetColorsResponse {
  result: boolean;
  message: string;
  colors: Color[];
  pagination: Pagination;
}
export interface GetSizesResponse {
  result: boolean;
  message: string;
  sizes: Size[];
  pagination: Pagination;
}

export interface GetConfigurationsResponse {
  result: boolean;
  message: string;
  configurations: Configuration[];
  cost_methods?: {
    available: Record<string, string>;
    current: string;
  };
}


export interface GetTagsResponse {
  result: boolean;
  message: string;
  tags: Tag[];
  pagination: Pagination;
}

export interface GetWarehousesResponse {
  result: boolean;
  message: string;
  warehouses: Warehouse[];
  pagination: Pagination;
}


export interface GetProductsResponse {
  result: boolean;
  message: string;
  products: Product[];
  pagination: Pagination;
}
export interface GetProductResponse {
  result: boolean;
  message: string;
  product?: Product;

}


export interface GetStockAdjustmentsResponse {
  result: boolean;
  message: string;
  adjustments: StockAdjustment[];
  pagination: Pagination;
}

export interface GetStocksResponse {
  result: boolean;
  message: string;
  stocks: Stock[];
  pagination: Pagination;
}

export interface GetProductVariantsResponse {

  result: boolean;
  message: string;
  productVariants: ProductVariant[];
  total: number;
  page: number;
  limit: number;
}

export interface GetAllProductsResponse {

  result: boolean;
  message: string;
  products: Product[];
  total: number;
  page: number;
  limit: number;
}
export interface GetAllClientsResponse {
  result: boolean;
  message: string;
  clients: Client[];
  total: number;
  page: number;
  limit: number;
}
export interface GetAllAddressesResponse {
  result: boolean;
  message: string;
  addresses: Address[];
  total: number;
  page: number;
  limit: number;
}
export interface GetClientsResponse {
  result: boolean;
  message: string;
  clients: Client[];
  pagination: Pagination;
}

export interface GetAddressesResponse {
  result: boolean;
  message: string;
  addresses: Address[];
  pagination: Pagination;
}

export interface GetCouponsResponse {
  result: boolean;
  message: string;
  coupons: Coupon[];
  pagination: Pagination;
}

export interface GetOrdersResponse {
  result: boolean;
  message: string;
  orders: Order[];
  pagination: Pagination;
}

export interface GetOrderResponse {
  result: boolean;
  message: string | undefined;
  order?: Order;
}
export interface NotificationsResponse {
  result: boolean;
  message?: string;
  notifications: Notification[];
  unread_order_count: number;
  unread_preorder_count: number;
  pending_return_count: number;
  unread_contact_count: number;
  unread_review_count: number;
  total_unread_count: number;
}

export interface GetAllOrdersCanBeReturnedResponse {
  result: boolean;
  message: string;
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface GetReturnOrdersResponse {
  result: boolean;
  message: string;
  return_orders: ReturnOrder[];
  pagination: Pagination;
}

export interface ReturnOrderResponse {
  result: boolean;
  message: string | undefined;
  return_order?: ReturnOrder;
}

export interface GetContactsResponse {
  result: boolean;
  message: string;
  contacts: Contact[];
  pagination: Pagination;
}


export interface GetTeamMembersResponse {
  result: boolean;
  message: string;
  team_members: TeamMember[];
  pagination: Pagination;
}

export interface GetHomeSectionsResponse {
  result: boolean;
  message: string;
  home_sections: HomeSection[];
  pagination: Pagination;
}
export interface GetDashboardResponse {
  result: boolean;
  message: string;
  kpis: {
    totalRevenue: number;
    monthlyRevenue: number;
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    avgOrderValue: number;
    totalClients: number;
    activeClients: number;
    conversionRate: number;
    growthRate: number;
    repeatCustomers: number;
    newCustomersThisMonth: number;
    returnsRate: number;
    totalRefundsAmount: number;
    abandonedCarts: number;
    inventoryValue: number;
    lowStockCount: number;
    avgRefundPerReturn: number;
    avgFulfillmentDays: number | null;
    totalReturnOrders: number;
    totalSessions: number;
  };
  charts: {
    revenueByDay: { date: string; total: number }[];
    ordersByDay: { date: string; orders_count: number; avg_order_value: number }[];
    ordersByStatus: { status: { name: string }; count: number }[];
    refundsByDay: { date: string; refunds_count: number; refund_amount: number }[];
    topProducts: { id: number; name: string; net_quantity: number; gross_revenue: number }[];
    salesByCategory: { category_id: number; product_category: string; total: number }[];
    topCustomers: { id: number; name: string; total_spent: number; orders_count: number }[];
    couponUsage: { id: number; code: string; uses: number; revenue: number }[];
    lowStock: {
      variant_id: number;
      sku: string | null;
      product_name: string;
      available_qty: number;
      price: number;
      inventory_value: number
    }[];
    sessionsByDevice: { device: string; count: number }[];
    newVsReturning: { new: number; returning: number };
  };
}

export interface GetReviewsResponse {
  result: boolean;
  message: string;
  reviews: Review[];
  pagination: Pagination;
}

export interface GetCurrenciesResponse {
  result: boolean;
  message: string;
  currencies: Currency[];
  pagination: Pagination;
}



export interface GetPagesResponse {
  result: boolean;
  message: string;
  pages: Page[];
  pagination: Pagination;
}

export interface GetPageResponse {
  result: boolean;
  message: string;
  page?: Page;
}
export interface BaseResponse {
  result: boolean;
  message: string;
}

export interface SalesReportItem {
  order_number: string | number;
  client_name: string;
  total_items: number;
  total_amount: number;
  status: string;
  created_at: string;
  delivered_at?: string;
}

export interface SalesReportResponse extends BaseResponse {
  data: SalesReportItem[];
}

export interface ProductReportItem {
  id: string | number;
  name: string;
  category: string;
  total_sold: number;
  net_revenue: number;
}

export interface ProductReportResponse extends BaseResponse {
  data: ProductReportItem[];
}

export interface CategoryReportItem {
  id: string | number;
  name: string;
  total_sold: number;
  net_revenue: number;
}

export interface CategoryReportResponse extends BaseResponse {
  data: CategoryReportItem[];
}

export interface ClientReportItem {
  id: string | number;
  name: string;
  email: string;
  total_orders: number;
  total_spent: number;
  avg_order_value: number;
}

export interface ClientReportResponse extends BaseResponse {
  data: ClientReportItem[];
}

export interface PaymentReportItem {
  payment_method: string;
  net_revenue: number;
}

export interface PaymentReportResponse extends BaseResponse {
  data: PaymentReportItem[];
}

export interface RefundsReportItem {
  product_name: string;
  client_name: string;
  total_refund: number;
  total_refund_orders: number;
}

export interface RefundsReportResponse extends BaseResponse {
  data: RefundsReportItem[];
}

export interface DeliveryPerformanceItem {
  id: string | number;
  order_number: string;
  created_at: string;
  shipped_at?: string;
  delivered_at?: string;
  delivery_hours?: number;
  processing_hours?: number;
}

export interface DeliveryPerformanceResponse extends BaseResponse {
  data: DeliveryPerformanceItem[];
}

// types/response.interfaces.ts
export interface ValidationResult {
  result: boolean;
  data?: {
    excel_validation?: {
      total_rows: number;
      valid_rows: number;
      invalid_rows: number;
      errors: Array<{
        row: number;
        barcode: string;
        errors: string[];
        sheet?: string;
      }>;
      warnings: Array<{
        row: number;
        barcode: string;
        warnings: string[];
        sheet?: string;
      }>;
    };
    zip_validation?: {
      total_barcodes_found: number;
      barcodes_with_images: Array<any>;
      total_images_found: number;
      zip_structure_errors: string[];
    };
    compatibility_analysis?: {
      excel_barcodes_count: number;
      zip_barcodes_count: number;
      matching_barcodes: string[];
      missing_in_zip: string[];
      extra_in_zip: string[];
      coverage_percentage: number;
    };
    overall_status?: string;
  };
  message?: string;
}

export interface ImportResult {
  result: boolean;
  data?: {
    successful: number;
    failed: number;
    total_processed: number;
    errors: Array<{
      row: number;
      barcode: string;
      errors: string[];
      sheet?: string;
    }>;
  };
  message?: string;
}

// Legacy interface for backward compatibility
export interface LegacyValidationResult {
  result: boolean;
  data?: {
    total_rows: number;
    valid_rows: number;
    invalid_rows: number;
    errors: Array<{
      row: number;
      barcode: string;
      errors: string[];
    }>;
    warnings: Array<{
      row: number;
      barcode: string;
      warnings: string[];
    }>;
  };
  message?: string;
}