export const WISHLIST_CACHE_KEYS = {
  wishlist: {
    by_id: (id: string) => `wishlist:id:${id}`,
    by_customer: (customerId: string) => `wishlist:customer:${customerId}`,
    default: (customerId: string) => `wishlist:default:${customerId}`,
    ttl: 60 * 10,
  },
  wishlist_items: {
    by_wishlist: (wishlistId: string) => `wishlist:items:${wishlistId}`,
    ttl: 60 * 5,
  },
  collection: {
    by_id: (id: string) => `collection:id:${id}`,
    by_customer: (customerId: string) => `collection:customer:${customerId}`,
    public: () => `collection:public`,
    ttl: 60 * 10,
  },
  favorites: {
    by_customer: (customerId: string) => `favorites:customer:${customerId}`,
    product_count: (productId: string) => `favorites:count:product:${productId}`,
    brand_count: (brandId: string) => `favorites:count:brand:${brandId}`,
    category_count: (categoryId: string) => `favorites:count:category:${categoryId}`,
    ttl: 60 * 5,
  },
  save_for_later: {
    by_customer: (customerId: string) => `saveforlater:customer:${customerId}`,
    ttl: 60 * 5,
  },
  share: {
    by_token: (token: string) => `wishlist:share:${token}`,
    ttl: 60 * 30,
  },
  analytics: {
    summary: () => `wishlist:analytics:summary`,
    most_wished: () => `wishlist:analytics:most_wished`,
    growth: (period: string) => `wishlist:analytics:growth:${period}`,
    conversion: (period: string) => `wishlist:analytics:conversion:${period}`,
    ttl: 60 * 15,
  },
} as const;
