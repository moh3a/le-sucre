import "server-only";
import type { z } from "zod";
import { createHash } from "node:crypto";
import { generate_id } from "@/lib/utils";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/error_handling";
import { products } from "@/features/product_information_management/products/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import type { create_review_dto, list_product_reviews_dto } from "../models/review.dto";
import { review_repository } from "../repositories/review.repository";
import { aggregate_repository } from "../repositories/aggregate.repository";
import { review_cache_service } from "./review-cache.service";
import { REVIEW_CACHE } from "../constants/cache-keys";
import { REVIEW_STATUS } from "../constants/review-status";
import {
  assert_review_content_safe,
  assert_review_rate_limit,
  hash_text,
} from "../engines/spam-guard.engine";
import { createHash as createHashStable } from "node:crypto";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";

function stable_list_hash(input: unknown) {
  return createHashStable("sha256").update(JSON.stringify(input)).digest("hex").slice(0, 16);
}

export class ReviewService {
  async get_product_summary(product_id: string) {
    const cache_key = REVIEW_CACHE.summary(product_id);
    const cached = await review_cache_service.get(cache_key);
    if (cached) return cached;

    let summary = await aggregate_repository.get_by_product(product_id);
    if (!summary) {
      summary = {
        product_id,
        average_rating: "0",
        review_count: 0,
        rating_1: 0,
        rating_2: 0,
        rating_3: 0,
        rating_4: 0,
        rating_5: 0,
        updated_at: new Date().toISOString(),
      };
    }

    const breakdown = [1, 2, 3, 4, 5].map((star) => ({
      stars: star,
      count: Number(summary[`rating_${star}` as keyof typeof summary] ?? 0),
    }));

    const payload = {
      product_id,
      average_rating: Number(summary.average_rating),
      review_count: summary.review_count,
      breakdown,
    };

    await review_cache_service.set(cache_key, payload, 600);
    return payload;
  }

  async list_product_reviews(input: z.infer<typeof list_product_reviews_dto>) {
    const hash = stable_list_hash(input);
    const cache_key = REVIEW_CACHE.list(input.product_id, hash);
    const cached = await review_cache_service.get(cache_key);
    if (cached) return cached;

    const result = await review_repository.list_public(input);
    await review_cache_service.set(cache_key, result, 180);
    return result;
  }

  async create_review(
    user_id: string,
    input: z.infer<typeof create_review_dto>,
    ip?: string | null,
  ) {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, input.product_id))
      .limit(1);
    if (!product) throw new NotFoundError("Produit introuvable");

    if (await review_repository.has_user_reviewed_product(user_id, input.product_id)) {
      throw new ConflictError("Vous avez déjà laissé un avis pour ce produit");
    }

    const ip_hash = ip ? createHash("sha256").update(ip).digest("hex") : null;
    await assert_review_rate_limit(user_id, ip_hash);
    assert_review_content_safe(input.body, input.title);

    const purchase = await review_repository.has_verified_purchase(
      user_id,
      input.product_id,
      input.order_id,
    );

    const is_verified = Boolean(purchase);
    if (input.order_id && !is_verified) {
      throw new ForbiddenError("Achat vérifié requis pour lier cette commande");
    }

    const content_hash = hash_text(`${input.title ?? ""}:${input.body}`);

    const id = generate_id();
    await review_repository.create({
      id,
      product_id: input.product_id,
      user_id,
      order_id: purchase?.order_id ?? input.order_id ?? null,
      order_item_id: purchase?.order_item_id ?? input.order_item_id ?? null,
      rating: input.rating,
      title: input.title ?? null,
      body: input.body,
      status: REVIEW_STATUS.pending,
      is_verified_purchase: is_verified,
      locale: input.locale,
      content_hash,
      ip_hash,
    });

    void audit_service.log({
      action: "review.create",
      resource_type: "review_id",
      resource_id: id,
    });
    return { ok: true, status: REVIEW_STATUS.pending, is_verified_purchase: is_verified };
  }

  list_my_reviews(user_id: string, page = 1, limit = 20) {
    return review_repository.list_by_user(user_id, page, limit);
  }
}

export const review_service = new ReviewService();
