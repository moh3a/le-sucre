// services/indexing.service.ts
import "server-only";
import { generate_id } from "@/lib/utils";
import { db } from "@/lib/db";
import { recommendation_index_jobs } from "../schema";
import { recommendation_repository } from "../repositories/recommendation.repository";
import {
  build_content_candidates,
  load_source_product,
  resolve_related_category_ids,
} from "../engines/content-similarity.engine";
import { get_fbt_candidates } from "../engines/collaborative.engine";
import { invalidate_recommendations_for_product } from "../helpers/invalidate-recommendations.helper";
import { RECOMMENDATION_TYPE } from "../constants/recommendation-types";
import { format } from "date-fns";
import { tryFn } from "@/lib/error_handling";

export class IndexingService {
  async enqueue(job_type: string, payload: Record<string, unknown>, run_after?: string) {
    const [err] = await tryFn(
      db.insert(recommendation_index_jobs).values({
        id: generate_id(),
        job_type,
        payload,
        status: "pending",
        run_after: run_after ?? format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      }),
    );
    if (err) throw err;
  }

  async reindex_product(product_id: string, locale = "fr") {
    const source = await load_source_product(product_id, locale);
    if (!source) return;
    const computed_at = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    const category_ids = await resolve_related_category_ids(source.category_path);

    const similar = await build_content_candidates(source, category_ids, 100);
    await recommendation_repository.replace_edges(
      product_id,
      RECOMMENDATION_TYPE.similar,
      similar.slice(0, 50),
      computed_at,
    );

    const related = similar.slice(0, 80).map((c) => ({
      ...c,
      score: c.score * 0.85,
    }));
    await recommendation_repository.replace_edges(
      product_id,
      RECOMMENDATION_TYPE.related,
      related.slice(0, 50),
      computed_at,
    );

    const fbt = await get_fbt_candidates(product_id, 30);
    await recommendation_repository.replace_edges(
      product_id,
      RECOMMENDATION_TYPE.fbt,
      fbt.slice(0, 20),
      computed_at,
    );

    await invalidate_recommendations_for_product(product_id);
  }
}
export const indexing_service = new IndexingService();
