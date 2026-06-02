export interface IReviewProductSummary {
  product_id: string;
  average_rating: number;
  review_count: number;
  breakdown: {
    stars: number;
    count: number;
  }[];
}
