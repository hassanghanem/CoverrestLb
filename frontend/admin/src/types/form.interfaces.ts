import { Banner, ProductImage, ProductSectionItem, Tag, VariantImage } from "./api.interfaces";

export type CategoryFormValues = {
  name: Record<string, string>;
  arrangement?: string;
  image: File | string | null;
};
export type HomeSectionFormValues = {
  type: string;
  title: Record<string, string>;
  banners?: Banner[] | null;
  product_section_items?: ProductSectionItem[] | null;
  arrangement: string;
  created_at?: string | null;
  updated_at?: string | null;
  is_active: boolean;
};

export type ProductFormValues = {
  name: Record<string, string>;
  short_description: Record<string, string>;
  description: Record<string, string>;
  barcode: string;
  category_id: number;
  brand_id: number;
  availability_status: "available" | "coming_soon" | "discontinued" | "pre_order" | "out_of_stock";
  price: number;
  discount: number;
  min_order_quantity: number;
  max_order_quantity: number;
  warranty?: string | null;
  coupon_eligible?: boolean | null;
  images: (File | ProductImage | null)[];
  tags: Tag[];
  variants?: {
    id: number;
    color_id: number | null;
    size_id: number | null;
    price: number | null;
    discount: number | null;
    images: (File | VariantImage | null)[];
  }[];
  specifications: { description: Record<string, string> }[];
};

export type TeamMemberFormValues = {
  name: Record<string, string>;
  occupation: Record<string, string>;
  arrangement?: string;
  image: File | string | null;
  is_active?: boolean;
};

export type ColorFormValues = {
  name: Record<string, string>;
  code: string;
};
export type SizeFormValues = {
  name: Record<string, string>;
};
export type CurrencyFormValues = {
  name: Record<string, string>;
  code: string;
  symbol?: string;
  exchange_rate: number;
};
export type PageFormValues = {
  title: Record<string, string>;
  content: Record<string, string>;
};
