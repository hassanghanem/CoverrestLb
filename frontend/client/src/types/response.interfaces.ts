import {
  Address, Brand, CartItem, Category, Color, Currency, Configuration,
  Coupon, FilterHomeSection, HomeSection,
  Order, Pagination,
  Product, ReturnOrder,
  Review,
  Sort,
  Tag,
  Wishlist,
  Page,
  Size,
  TeamMember,
} from "./api.interfaces";

export interface GetAllSettingsResponse {
  result: boolean;
  message: string;
  categories: Category[];
  brands: Brand[];
  currencies: Currency[];
  colors: Color[];
  sizes: Size[];
  configurations: Configuration[];
  tags: Tag[];
  sorts: Sort[];
  homeSections: FilterHomeSection[];
  price_range: PriceRange;
  pages: Page[];
}

export interface GetProductResponse {
  result: boolean;
  message: string;
  product?: Product;
  related_products: Product[]
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


export interface GetHomeSectionsResponse {
  result: boolean;
  message: string;
  home_sections: HomeSection[];
}


export interface PriceRange {
  min: number;
  max: number;
}

export interface GetShopResponse {
  result: boolean;
  message: string;
  products: Product[];
  pagination: Pagination;
}



export interface GetWishlistResponse {
  result: boolean;
  message: string;
  wishlist: Wishlist[];
  pagination: Pagination;
}

export interface GetCartResponse {
  result: boolean;
  message: string;
  cart?: {
    order_number: number;
    total_items: number;
    subtotal: number;
    delivery_amount: number;
    is_preorder: boolean;

    grand_total: number;
    coupon?: Coupon;
    discount_amount?: number | null;
    coupon_type?: string | null;
    items: CartItem[];
  };
  related_products: Product[];
}

export interface GetAddressResponse {
  result: boolean;
  message: string;
  address?: Address;

}

export interface GetReviewsResponse {
  result: boolean;
  message: string;
  reviews: Review[];
  pagination: Pagination;
}
export interface GetTeamMembersResponse {
  result: boolean;
  message: string;
  team_members: TeamMember[];
}