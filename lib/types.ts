// Core data models. Kept deliberately storage-agnostic (plain TS types) so this
// layer can be swapped for a headless CMS / WooCommerce / a database later
// without changing component or route code.

export type IntendedUse = "CULINARY" | "SPECIALTY" | "NON_CULINARY";

export interface ProductVariant {
  id: string; // stable sku-like id, e.g. "groundnut-oil-1l"
  size: string; // display label, e.g. "1 L"
  sizeMl: number; // normalized size in ml, used for weight/shipping calc
  mrp: number; // MRP in INR
  sellingPrice: number; // actual selling price in INR
  weightGrams: number; // packed weight incl. bottle, for shipping calc
  inStock: boolean;
  lengthCm: number; // actual packed outer parcel length in cm, for shipping/volumetric-weight calc
  widthCm: number; // actual packed outer parcel width in cm, for shipping/volumetric-weight calc
  heightCm: number; // actual packed outer parcel height in cm, for shipping/volumetric-weight calc
}

export interface Product {
  id: string;
  slug: string; // used for /oils/[slug]
  name: string;
  shortDescription: string;
  intendedUse: IntendedUse;
  category: string;
  heroImage: string | null; // path under /public, null = placeholder pending real asset
  gallery: string[];
  variants: ProductVariant[];
  featured: boolean;
  active: boolean;
}

export type VideoCategory =
  | "MANUFACTURING"
  | "WOOD_COLD_PRESSING"
  | "INGREDIENTS"
  | "PRODUCT_DEMO"
  | "OIL_EDUCATION"
  | "BEHIND_THE_SCENES"
  | "STORE"
  | "FOUNDER_TEAM"
  | "CUSTOMER_EXPERIENCE"
  | "PRODUCT_USAGE"
  | "BRAND_STORY"
  | "OFFERS_CAMPAIGNS";

export type VideoAspectRatio = "9:16" | "16:9" | "1:1";

export interface VideoItem {
  video_id: string;
  title: string;
  description: string;
  category: VideoCategory;
  thumbnail: string;
  video_url: string;
  aspect_ratio: VideoAspectRatio;
  duration_seconds: number;
  published_date: string; // ISO date
  featured: boolean;
  active: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: "PRODUCT" | "ORDERING" | "SHIPPING" | "PAYMENT" | "GENERAL";
}

export interface ReviewItem {
  id: string;
  productId: string | null; // null = general brand review
  authorName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  date: string; // ISO date
  verifiedPurchase: boolean;
}

export interface CartLine {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface ShippingQuoteRequest {
  pincode: string;
  cartWeightGrams: number;
  cartValue: number;
}

export interface ShippingQuoteResponse {
  serviceable: boolean;
  shipping_amount: number;
  estimated_delivery: string | null;
  carrier: string | null;
  service: string | null;
  weight_used_grams: number;
  zone: string | null;
  reason?: string;
}

export type OrderStatus =
  | "pending"
  | "payment_initiated"
  | "payment_failed"
  | "paid"
  | "processing"
  | "shipment_created"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "partially_refunded";

export interface OrderAttribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  fbp?: string;
  fbc?: string;
}

export interface OrderCustomer {
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  productName: string;
  variantSize: string;
  quantity: number;
  mrp: number;
  sellingPrice: number;
  lineTotal: number;
}

export interface Order {
  order_id: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  shipping_amount: number;
  payment_fee: number;
  taxes: number;
  discounts: number;
  grand_total: number;
  payment_status: OrderStatus;
  shipping_status: OrderStatus;
  tracking_number: string | null;
  carrier: string | null;
  created_at: string;
  updated_at: string;
  utm_data: OrderAttribution;
}
