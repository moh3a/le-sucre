export const RECOMMENDATION_TYPE = {
  similar: "similar",
  related: "related",
  fbt: "fbt",
  personalized: "personalized",
  trending: "trending",
} as const;

export const RECOMMENDATION_SLOT = {
  similar_products: "similar_products",
  related_products: "related_products",
  frequently_bought_together: "frequently_bought_together",
  trending: "trending",
  recently_viewed: "recently_viewed",
  recommended_for_you: "recommended_for_you",
} as const;
