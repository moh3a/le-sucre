/**
 * Centralized Redis key factory.
 * All keys follow: namespace:entity:id[:subkey]
 * TTLs are in seconds.
 */
export const redisKeys = {
  // ─── Session ────────────────────────────────────────
  session: {
    byId: (sessionId: string) => `session:${sessionId}`,
    ttl: 60 * 60 * 24 * 30, // 30 days
  },

  // ─── User ───────────────────────────────────────────
  user: {
    byId: (userId: string) => `user:id:${userId}`,
    byEmail: (email: string) => `user:email:${email}`,
    ttl: 60 * 5, // 5 minutes
  },

  // ─── Product ────────────────────────────────────────
  product: {
    byId: (productId: string) => `product:id:${productId}`,
    bySlug: (slug: string) => `product:slug:${slug}`,
    list: (params: string) => `product:list:${params}`,
    featured: () => `product:featured`,
    ttl: 60 * 10, // 10 minutes
    listTtl: 60 * 5, // 5 minutes
  },

  // ─── Category ───────────────────────────────────────
  category: {
    all: () => `category:all`,
    byId: (categoryId: string) => `category:id:${categoryId}`,
    bySlug: (slug: string) => `category:slug:${slug}`,
    tree: () => `category:tree`,
    ttl: 60 * 60, // 1 hour
  },

  // ─── Recommendations ────────────────────────────────
  recommendations: {
    similar: (productId: string, locale: string) => `rec:similar:${productId}:${locale}`,
    related: (productId: string, locale: string) => `rec:related:${productId}:${locale}`,
    fbt: (productId: string, locale: string) => `rec:fbt:${productId}:${locale}`,
    trending: (period: string, locale: string) => `rec:trending:${period}:${locale}`,
    forYou: (userId: string, locale: string) => `rec:foryou:${userId}:${locale}`,
    recent: (key: string) => `rec:recent:${key}`,
    ttl: 600,
    trendingTtl: 300,
    recentTtl: 60 * 60 * 24 * 14,
  },

  // ─── Cart ───────────────────────────────────────────
  cart: {
    byUserId: (userId: string) => `cart:user:${userId}`,
    bySessionId: (sessionId: string) => `cart:session:${sessionId}`,
    ttl: 60 * 60 * 24 * 7, // 7 days
  },

  // ─── Rate limit ─────────────────────────────────────
  rateLimit: {
    ip: (ip: string, action: string) => `ratelimit:${action}:ip:${ip}`,
    user: (userId: string, action: string) => `ratelimit:${action}:user:${userId}`,
    ttl: 60, // 1 minute window
  },

  // ─── OTP / Email verification ────────────────────────
  otp: {
    byEmail: (email: string, type: string) => `otp:${type}:${email}`,
    ttl: 60 * 15, // 15 minutes
  },

  // ─── Search ─────────────────────────────────────────
  search: {
    results: (query: string) => `search:${Buffer.from(query).toString("base64")}`,
    ttl: 60 * 2, // 2 minutes
  },

  // ─── Analytics ──────────────────────────────────────
  analytics: {
    productViews: (productId: string) => `analytics:views:product:${productId}`,
    dailyRevenue: (date: string) => `analytics:revenue:${date}`,
  },

  analyticsEvents: {
    counter: (event: string, day: string) => `analytics:cnt:${event}:${day}`,
    product: (productId: string, day: string) => `analytics:prod:${productId}:${day}`,
    funnel: (step: string, day: string) => `analytics:funnel:${step}:${day}`,
    realtime: () => `analytics:realtime:events`,
    buffer: () => `analytics:buffer:events`,
    ttl: 60 * 60 * 48,
  },

  // ─── Campaign ────────────────────────────────────────────
  campaign: {
    byId: (id: string) => `campaign:id:${id}`,
    active_sections: (page: string, locale: string, country: string) =>
      `campaign:sections:${page}:${locale}:${country}`,
    list: (params: string) => `campaign:list:${params}`,
    ttl: 60 * 5, // 5 minutes
    sectionsTtl: 60 * 2, // 2 minutes
  },
} as const;
