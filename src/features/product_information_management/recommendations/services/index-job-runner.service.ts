import "server-only";
import { and, eq, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { recommendation_index_jobs } from "../schema";
import { indexing_service } from "./indexing.service";
import { rebuild_co_purchase_window } from "../engines/collaborative.engine";
import { trending_index_service } from "./trending-index.service"; // persist redis zset -> product_trending_scores

export class IndexJobRunnerService {
  async run_due(limit = 20) {
    const jobs = await db
      .select()
      .from(recommendation_index_jobs)
      .where(
        and(
          eq(recommendation_index_jobs.status, "pending"),
          lte(recommendation_index_jobs.run_after, sql`NOW()`),
        ),
      )
      .limit(limit);

    for (const job of jobs) {
      try {
        if (job.job_type === "reindex_product") {
          await indexing_service.reindex_product(String(job.payload?.product_id));
        } else if (job.job_type === "rebuild_copurchase") {
          await rebuild_co_purchase_window(90);
        } else if (job.job_type === "rebuild_trending") {
          await trending_index_service.persist_from_redis();
        }
        await db
          .update(recommendation_index_jobs)
          .set({ status: "done", updated_at: new Date().toISOString() })
          .where(eq(recommendation_index_jobs.id, job.id));
      } catch (e) {
        await db
          .update(recommendation_index_jobs)
          .set({
            status: "failed",
            attempts: job.attempts + 1,
            last_error: e instanceof Error ? e.message : "unknown",
            updated_at: new Date().toISOString(),
          })
          .where(eq(recommendation_index_jobs.id, job.id));
      }
    }
  }
}
export const index_job_runner_service = new IndexJobRunnerService();
