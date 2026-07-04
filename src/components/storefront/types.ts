export interface StorefrontProduct {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  currency: string;
  min_price: string;
  max_price: string | null;
  is_featured: boolean;
  in_stock: boolean;
  brand_name: string | null;
}

export interface CartItem {
  id: string;
  product: StorefrontProduct;
  quantity: number;
  variant_label?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  children: CategoryItem[];
}

export interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  product_count: number;
}

export interface CouponItem {
  code: string;
  description: string;
  discount_label: string;
}

export interface TieredOfferItem {
  threshold: string;
  label: string;
  description: string;
}

export interface ReviewItem {
  id: string;
  author_name: string;
  rating: number;
  content: string;
  date: string;
}

export interface SpecItem {
  label: string;
  value: string;
}

export interface AddressData {
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
}

export type ProductCardVariant = "catalog" | "wishlist" | "cart-item" | "compare" | "saved" | "flash-sale" | "mini";
