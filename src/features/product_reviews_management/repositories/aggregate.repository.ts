import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { product_review_aggregates } from "../schema";

export class AggregateRepository {
  get_by_product(product_id: string) {
    return db
      .select()
      .from(product_review_aggregates)
      .where(eq(product_review_aggregates.product_id, product_id))
      .limit(1)
      .then((r) => r[0] ?? null);
  }
}

export const aggregate_repository = new AggregateRepository();
