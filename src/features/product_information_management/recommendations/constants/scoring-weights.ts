export const SCORING_WEIGHTS = {
  same_category: 40,
  related_category: 25,
  same_brand: 20,
  price_proximity: 15,
  keyword_overlap: 30,
  tag_overlap: 15,
  shared_property_values: 25,
  co_purchase: 50,
  also_viewed: 20,
  trending_boost: 10,
} as const;
