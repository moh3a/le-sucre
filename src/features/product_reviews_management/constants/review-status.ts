export const REVIEW_STATUS = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
  hidden: "hidden",
} as const;

export const REVIEW_SORT = {
  newest: "newest",
  oldest: "oldest",
  highest_rating: "highest_rating",
  lowest_rating: "lowest_rating",
  most_helpful: "most_helpful",
} as const;

export const REPORT_STATUS = {
  open: "open",
  resolved: "resolved",
  dismissed: "dismissed",
} as const;
