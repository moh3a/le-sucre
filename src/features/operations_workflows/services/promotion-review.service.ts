import "server-only";
import { db } from "@/lib/db";
import { eq, and, desc, count } from "drizzle-orm";
import { generate_id } from "@/lib/utils";
import { promotions } from "@/features/order_management_system/promotions/schema";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { notification_service } from "./notification.service";
import { promotion_reviews } from "../schema";
import { NOTIFICATION_TYPES } from "../constants/notifications";

export class PromotionReviewService {
  async request_review(input: {
    promotion_id: string;
    review_type: string;
    requested_by_user_id: string;
  }) {
    const [created] = await db
      .insert(promotion_reviews)
      .values({
        id: generate_id(),
        promotion_id: input.promotion_id,
        review_type: input.review_type,
        status: "pending",
        requested_by_user_id: input.requested_by_user_id,
      })
      .$returningId();

    void audit_service.log({
      actor_user_id: input.requested_by_user_id,
      action: "promotion.review.request",
      resource_type: "promotion_id",
      resource_id: input.promotion_id,
    });

    return db
      .select()
      .from(promotion_reviews)
      .where(eq(promotion_reviews.id, created.id))
      .then((r) => r[0] ?? null);
  }

  async review(input: {
    id: string;
    status: "approved" | "rejected";
    review_note?: string;
    reviewer_user_id: string;
  }) {
    const review = await db
      .select()
      .from(promotion_reviews)
      .where(eq(promotion_reviews.id, input.id))
      .limit(1)
      .then((r) => r[0] ?? null);
    if (!review) throw new Error("Review request not found");
    if (review.status !== "pending") throw new Error("Already reviewed");

    await db
      .update(promotion_reviews)
      .set({
        status: input.status,
        reviewer_user_id: input.reviewer_user_id,
        review_note: input.review_note ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .where(eq(promotion_reviews.id, input.id));

    if (input.status === "approved") {
      await db
        .update(promotions)
        .set({ status: "active" })
        .where(eq(promotions.id, review.promotion_id));

      void notification_service.notify({
        user_id: review.requested_by_user_id,
        type: NOTIFICATION_TYPES.PROMOTION_APPROVED,
        reference_type: "promotion_id",
        reference_id: review.promotion_id,
      });
    }

    void audit_service.log({
      actor_user_id: input.reviewer_user_id,
      action: "promotion.review.complete",
      resource_type: "promotion_review_id",
      resource_id: input.id,
      metadata: { status: input.status },
    });
  }

  async list_pending(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(promotion_reviews)
        .where(eq(promotion_reviews.status, "pending"))
        .orderBy(desc(promotion_reviews.created_at))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(promotion_reviews).where(eq(promotion_reviews.status, "pending")),
    ]);
    return { items, meta: { page, limit, total_records: Number(total ?? 0), total_pages: Math.ceil(Number(total ?? 0) / limit) } };
  }

  async get_by_promotion(promotion_id: string) {
    return db
      .select()
      .from(promotion_reviews)
      .where(eq(promotion_reviews.promotion_id, promotion_id))
      .orderBy(desc(promotion_reviews.created_at));
  }

  async count_pending() {
    const [{ count: total }] = await db
      .select({ count: count() })
      .from(promotion_reviews)
      .where(eq(promotion_reviews.status, "pending"));
    return Number(total ?? 0);
  }

  async list_reviews(page = 1, limit = 20, status?: string) {
    const offset = (page - 1) * limit;
    const where = status ? eq(promotion_reviews.status, status) : undefined;
    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(promotion_reviews)
        .where(where)
        .orderBy(desc(promotion_reviews.created_at))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(promotion_reviews).where(where),
    ]);
    return { items, meta: { page, limit, total_records: Number(total ?? 0), total_pages: Math.ceil(Number(total ?? 0) / limit) } };
  }

  async get_review_stats() {
    const [[{ pending }], [{ approved }], [{ rejected }]] = await Promise.all([
      db.select({ pending: count() }).from(promotion_reviews).where(eq(promotion_reviews.status, "pending")),
      db.select({ approved: count() }).from(promotion_reviews).where(eq(promotion_reviews.status, "approved")),
      db.select({ rejected: count() }).from(promotion_reviews).where(eq(promotion_reviews.status, "rejected")),
    ]);
    return { pending: Number(pending ?? 0), approved: Number(approved ?? 0), rejected: Number(rejected ?? 0) };
  }
}

export const promotion_review_service = new PromotionReviewService();
