export const AUDIT_ACTION = {
  REVIEW_CREATED: "review.create",
  REVIEW_REPORTED: "review.report",
  REVIEW_MODERATED: "review.moderate",
  REVIEW_HELPFUL_VOTED: "review.helpful.vote",
  REVIEW_HELPFUL_VOTE_REMOVED: "review.helpful.remove_vote",
} as const;

export type ReviewAuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];
