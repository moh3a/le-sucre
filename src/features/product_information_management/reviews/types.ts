export interface IReviewProductSummary {
  product_id: string;
  average_rating: number;
  review_count: number;
  breakdown: {
    stars: number;
    count: number;
  }[];
}

export interface IListProductReviews {
  items: {
    id: string;
    product_id: string;
    user_id: string;
    rating: number;
    title: string | null;
    body: string;
    is_verified_purchase: boolean;
    helpful_count: number;
    created_at: string;
    author_name: string;
  }[];
  meta: {
    page: number;
    limit: number;
    total_records: number;
    total_pages: number;
    has_more: boolean;
  };
}
