export interface IAnalyticsOverview {
  totals: { revenue: string; orders: number; abandoned_carts: number; avg_conversion: number };
  series: {
    day_key: string;
    revenue: string;
    orders_count: number;
    conversion_rate: string | null;
  }[];
  funnel: {
    step: string;
    sessions: number;
    rate: number;
  }[];
  repeat: {
    customers: number;
    repeat_customers: number;
    repeat_rate: number;
  };
}

export interface IProductsAnalytics {
  best_sellers: {
    product_id: string;
    name: string;
    units_sold: number;
    revenue: string;
    views: number;
  }[];
  most_viewed: {
    product_id: string;
    views: number;
    purchases: number;
    conversion_rate: number;
  }[];
  categories: {
    category_id: string;
    revenue: string;
    views: number;
  }[];
  brands: {
    brand_id: string;
    revenue: string;
    views: number;
  }[];
}

export interface IProductDetailsAnalytics {
  product_id: string;
  daily_series: {
    day_key: string;
    views: number;
    add_to_cart: number;
    purchases: number;
    units_sold: number;
    revenue: string;
    recommendation_clicks: number;
    conversion_rate: string | null;
  }[];
  totals: {
    views: number;
    add_to_cart: number;
    purchases: number;
    units_sold: number;
    revenue: string;
    recommendation_clicks: number;
    avg_conversion: number;
  };
}

export interface ISearchAnalytics {
  top_searches: {
    query: string;
    count: number;
  }[];
}
