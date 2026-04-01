// Magic Link Auth
export interface SendMagicLinkRequest {
  email: string;
  agreeTerms?: boolean;
  agreeMarketing?: boolean;
}

export interface Pagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface Configuration {
  key: string;
  value: string;
}

export interface Category {
  id: number;
  name: Record<string, string>;
  image: string;
  count?: number
}

export interface Brand {
  id: number;
  name: string;
  count?: number
}
export interface FilterHomeSection {
  id: number;
  title: Record<string, string>;
  count?: number

}

export interface Color {
  id: number;
  name: Record<string, string>;
  code: string;
}

export interface Size {
  id: number;
  name: Record<string, string>;
}

export interface Currency {
  id: number;
  code: string;
  name: Record<string, string>;
  symbol: string;
  exchange_rate: number;
  is_default: boolean;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Variant {
  id: number;
  product_id: number;
  color: Color;
  size: Size;
  price: number;
  discount: number;
  sku: string;
  available_quantity: number;
  images: VariantImage[];

}

export interface ProductImage {
  id: number;
  image: string;
}
export interface VariantImage {
  id: number;
  image: string;
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
  coupon_eligible?: boolean;
  min_order_quantity: number;
  max_order_quantity: number;
  image: string;
  images: ProductImage[];
  variants: Variant[];
  tags: Tag[];
  specifications: { description: Record<string, string> }[];
  reviews: Review[];
  average_rating: number;
  reviews_count: number;
  warranty?: Record<string, string> | string | null;
}
export interface Review {
  id: number;
  product_id: number;
  client_name: string;
  rating: number;
  comment: string;
  created_at: string | null;
  is_mine: boolean;
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
  name: string;
  gender?: string;
  birthdate?: string | null;
  phone?: string | null;
  email: string;
  social_provider?: string | null;
  social_id?: string | null;
  last_login?: string | null;
  newsletter: boolean,
  order_updates: boolean,
  created_at: string;
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
  code: string;
  type: "fixed" | "percentage";
  value: number;
  status: string,
  status_attributes: {
    key: string,
    name: string;
    color: string;
    class: string;
  };
  coupon_type_attributes: string,
  coupon_type: number;
  valid_from?: string;
  valid_to?: string;
}

export interface OrderDetail {
  id: number;
  product_id: number;
  variant_id: number;
  quantity: number;
  price: number;
  total: number;
  discount: number;
  product: Product;
  variant: Variant;
}

export interface Order {
  id: number;
  order_number: string;
  client: Client;
  is_cart: boolean;
  address: Address;
  coupon?: Coupon;
  discount_amount?: number | null;
  coupon_type?: string | null;
  address_info: any;
  notes?: string | null;
  payment_method: string;
  payment_status: number;
  delivery_amount: number;
  status: number;
  status_info: {
    name: string;
    description: string;
    color: string;
    class: string;
  };
  is_preorder: boolean;
  subtotal: number;
  grand_total: number;
  order_details: OrderDetail[];
  created_at: string;
  updated_at: string;



  expected_shipping_date?: string | null;
  estimated_ready_date?: string | null;

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
}

export interface ReturnOrder {
  id: number;
  order_id: number;
  return_order_number: string;
  requested_at: string | null;
  status: number;
  status_info: {
    name: string;
    description: string;
    color: string;
    class: string;
  };
  reason: string | null;
  refund_amount: number;
  details: ReturnOrderDetail[];
  order: Order
}


export interface HomeSection {
  id: number;
  type: string;
  title: Record<string, string>;
  banners: Banner[];
  product_section_items: ProductSectionItem[];
  categories: Category[];
}

export interface Banner {
  id: number;
  home_section_id: number;
  title: Record<string, string>;
  subtitle: Record<string, string>;
  image: string;
  image_mobile: string;
  link: string;
}


export interface ProductSectionItem {
  id: number;
  home_section_id: number;
  product_id: number;
  product: Product;
}

export interface Sort {
  key: string;
  label: Record<string, string>;

}

export interface CartItem {
  id: number;
  product_id: number;
  variant_id: number;
  quantity: number;
  price: string;
  discount: number;
  total: number;
  variant: Variant;
  product: Product;
}

export interface Wishlist {
  id: number;
  added_at: string;
  product: Product
}

export interface Page {
  id: number;
  slug: string;
  title: Record<string, string>;
  content: Record<string, string>;
}
export interface TeamMember {
  id: number;
  name: Record<string, string>;
  occupation: Record<string, string>;
  image: string;
}
