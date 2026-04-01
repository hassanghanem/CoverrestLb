export interface Session {
  id: string;
  device: string;
  last_activity: number;
  last_activity_human: string;
  ip_address: string;
  location: string;
  browser: string;
  platform: string;
  is_current_device: boolean;
  is_mobile: boolean;
  is_tablet: boolean;
  is_desktop: boolean;
  is_robot: boolean;
  latitude: number;
  longitude: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  image: string;
  token: string;
  role: string;
  is_active: boolean;
  permissions: string[];
  sessions: Session[];
  teams: Team[];
}

export interface Team {
  id: number;
  name: string;
}

export interface Pagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface Category {
  id: number;
  name: Record<string, string>;
  arrangement: string;
  image: string;
  is_active: boolean;

}

export interface ActivityLog {
  id: number;
  log_name: string;
  description: string;
  subject_type: string | null;
  subject_id: number | null;
  causer_type: string | null;
  causer_id: number | null;
  causer_name: string | null;
  properties: Record<string, any>;
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface Permission {
  id: number;
  name: string;
}

export interface Brand {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}
export interface Color {
  id: number;
  name: Record<string, string>;
  code: string;
  created_at: string | null;
  updated_at: string | null;
}
export interface Size {
  id: number;
  name: Record<string, string>;
  created_at: string | null;
  updated_at: string | null;
}

export interface AvailabilityStatus {
  id: string;
  name: string;
}

export interface Configuration {
  key: string;
  value: string;
}

export interface Tag {
  id: number;
  name: string;
  created_at: string | null;
  updated_at: string | null;
}
export interface Warehouse {
  id: number;
  name: string;
  location: string;
  created_at: string | null;
  updated_at: string | null;
}



export interface Variant {
  id: number;
  product_id: number;
  color: Color;
  size: Size;
  sku: string;
  available_stock: number;
  price?: number | null;
  discount?: number | null;
  images?: VariantImage[];
  available_quantity?: number;
  is_active?: boolean;
  product_info?: string;
  color_id?: number;
  warehouses?: Array<{
    warehouse_id: number;
    warehouse_name: string;
    quantity: number;
  }>;
}

export interface ProductImage {
  id: number;
  arrangement: string;
  image: string;
  is_active: boolean;
}

export interface VariantImage {
  id: number;
  arrangement: string;
  image: string;
  is_active: boolean;
}




export interface Product {
  id: number;
  name: Record<string, string>;
  short_description: Record<string, string>;
  description: Record<string, string>;
  barcode: string;
  slug: string;
  availability_status: string;
  category: Category;
  brand: Brand;
  price: number;
  discount: number;
  min_order_quantity: number;
  max_order_quantity: number;
  warranty?: string | null;
  coupon_eligible?: boolean | number | null;
  image: string;
  images: ProductImage[];
  variants: Variant[];
  tags: Tag[];
  specifications: { description: Record<string, string> }[];
  total_stock_quantity?: number;
  arrangement?: number | string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface StockAdjustment {
  id: number;
  sku: string;
  warehouse: Warehouse;
  type: string;
  quantity: number;
  cost_per_item: number | null;
  reason: string | null;
  reference_type: string | null;
  reference_id: number | null;
  adjusted_by: User | null;
  created_at: string;
}
export interface Stock {
  id: number;
  sku: string;
  warehouse: Warehouse;
  quantity: number;
}

export interface ProductVariant {
  id: number;
  product: Product;
  color: Color;
  size: Size | null;
  sku: string;
  price: string;
  discount: number;
  available_quantity: number;
  is_active?: boolean;
  product_info?: string;
  color_id?: number;
  warehouses?: Array<{
    warehouse_id: number;
    warehouse_name: string;
    quantity: number;
  }>;
}

export interface PaginatedData<T> {
  items: T[];
  hasNextPage: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  isError: boolean;
}


export interface Client {
  id: number;
  name: string;
  gender?: string;
  birthdate?: string | null;
  phone?: string | null;
  phone_verified_at?: string | null;
  email: string;
  email_verified_at?: string | null;
  social_provider?: string | null;
  social_id?: string | null;
  is_active: boolean;
  last_login?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Address {
  id: number;
  client_id: number;
  city: string;
  address: string;
  recipient_name: string;
  phone_number: string;
  notes?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  is_active: boolean;
  is_default: boolean;
}

export interface Coupon {
  id: number;
  code: string;
  type: "fixed" | "percentage";
  value: number;
  usage_limit?: number;
  usage_count: number;
  min_order_amount?: number;
  status: string,
  status_attributes: {
    key: string,
    name: string;
    color: string;
    class: string;
  };
  coupon_type_attributes: string,
  coupon_type: number;
  client_id?: number;
  valid_from?: string;
  valid_to?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderDetail {
  id: number;
  product_id: number;
  variant_id: number;
  quantity: number;
  price: string | number;
  total: number;
  discount: number;
  cost: string;
  available_stock: number;
  product: Product;
  variant: Variant;
  warehouse: Warehouse;
}

export interface Order {
  id: number;
  order_number: string;
  client: Client;
  is_cart: boolean;
  address: Address;
  coupon?: Coupon;
  coupon_value?: number | null;
  coupon_type?: string | null;
  address_info: any;
  notes?: string | null;
  payment_method: string;
  payment_status: number;
  delivery_amount: number;
  status: number;
  status_info: OrderStatus;
  is_view: boolean;
  subtotal: number;
  grand_total: string;
  order_details: OrderDetail[];
  confirmed_at: string;
  packed_at: string;
  shipped_at: string;
  delivered_at: string;
  cancelled_at: string;
  returned_at: string;
  created_at: string;
  updated_at: string;
}


export interface Notification {
  type: 'order' | 'preorder' | 'return_order' | 'contact' | 'review';
  order_id?: number;
  contact_id?: number;
  review_id?: number;
  message: string;
  created_at: string;
}

export interface ReturnOrderDetail {
  id: number;
  variant_id: number;
  quantity: number;
  price: number;
  refund_amount: number;
  total: number;
  product: Product;
  variant: Variant;
  warehouse: Warehouse;
}

export interface ReturnOrder {
  id: number;
  order_id: number;
  return_order_number: string;
  status: number;
  status_info: ReturnOrderStatus;
  reason: string | null;
  refund_amount: number;
  details: ReturnOrderDetail[];
  order: Order
  completed_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  created_at: string | null;
  updated_at: string | null;

}


export interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_view: boolean;
  created_at: string | null;
}

export interface TeamMember {
  id: number;
  name: Record<string, string>;
  occupation: Record<string, string>;
  arrangement: string;
  image: string;
  is_active: boolean;

}

export interface HomeSection {
  id: number;
  type: string;
  title: Record<string, string>;
  banners: Banner[];
  product_section_items: ProductSectionItem[];
  arrangement: number;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface Banner {
  id: number;
  home_section_id: number;
  title: Record<string, string>;
  subtitle: Record<string, string>;
  image: string;
  image_mobile: string;
  link: string;
  arrangement: number;
  is_active: boolean;
}


export interface ProductSectionItem {
  id: number;
  home_section_id: number;
  arrangement: number;
  product_id: number;
  product: Product;
  is_active: boolean;
}
export interface Review {
  id: number;
  client_id: number;
  product_id: number;
  rating: number;
  comment: string;
  is_active: boolean;
  is_view: boolean;
  created_at: string;
  updated_at: string;
  client: Client;
  product: Product;
}

export interface Currency {
  id: number;
  code: string;
  name: Record<string, string>;
  symbol?: string;
  exchange_rate: number;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}


export interface Page {
  id: number;
  slug: string;
  title: Record<string, string>;
  content: Record<string, string>;
  created_at: string;
  updated_at: string;
}


export interface OrderStatus {
  name: string;
  description: string;
  color: string;
  class: string;
}

export interface ReturnOrderStatus {
  name: string;
  description: string;
  color: string;
  class: string;
}
export interface PaymentMethodOption {
  value: string;
  label: string;
}

// Promotional Emails interfaces
export interface NewsletterStats {
  total_subscribers: number;
  active_subscribers: number;
  inactive_subscribers: number;
  recent_subscribers: number;
  engagement_rate: number;
}

export interface Subscriber {
  id: number;
  email: string;
  subscribed_at: string;
}

export interface PromotionData {
  discount_percentage?: number;
  promo_code?: string;
  valid_until?: string;
  minimum_order?: number;
  shop_url?: string;
}

export interface FeaturedProduct {
  name: string;
  price?: number;
  image?: string;
  url?: string;
}