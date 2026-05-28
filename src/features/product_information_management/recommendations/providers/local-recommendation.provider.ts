// providers/local-recommendation.provider.ts
import "server-only";
import type { RecommendationProvider } from "./recommendation-provider.interface";
import { recommendation_repository } from "../repositories/recommendation.repository";
import {
  build_content_candidates,
  load_source_product,
  resolve_related_category_ids,
} from "../engines/content-similarity.engine";
import { get_fbt_candidates, get_personalized_from_orders } from "../engines/collaborative.engine";
import { list_trending_product_ids } from "../engines/trending.engine";
import { RECOMMENDATION_TYPE } from "../constants/recommendation-types";
import { hydrate_recommendation_cards } from "../helpers/hydrate-recommendation-cards.helper";

// NOTE: hydrate via recommendation_service private method — expose package-level hydrate helper instead:
async function hydrate(
  locale: string,
  scored: Array<{ product_id: string; score: number; recommendation_type: string }>,
) {
  return hydrate_recommendation_cards(locale, scored); // refactor to exported hydrate_recommendation_cards()
}

export const local_recommendation_provider: RecommendationProvider = {
  name: "local",

  async get_similar(product_id, ctx) {
    const pre = await recommendation_repository.get_precomputed(
      product_id,
      RECOMMENDATION_TYPE.similar,
      ctx.limit ?? 12,
    );
    if (pre.length) {
      return hydrate(
        ctx.locale!,
        pre.map((r) => ({
          product_id: r.target_product_id,
          score: Number(r.score),
          recommendation_type: RECOMMENDATION_TYPE.similar,
        })),
      );
    }
    const source = await load_source_product(product_id, ctx.locale!);
    if (!source) return [];
    const category_ids = await resolve_related_category_ids(source.category_path);
    const candidates = await build_content_candidates(source, category_ids, 80);
    return hydrate(
      ctx.locale!,
      candidates.slice(0, ctx.limit ?? 12).map((c) => ({
        ...c,
        recommendation_type: RECOMMENDATION_TYPE.similar,
      })),
    );
  },

  async get_related(product_id, ctx) {
    const pre = await recommendation_repository.get_precomputed(
      product_id,
      RECOMMENDATION_TYPE.related,
      ctx.limit ?? 12,
    );
    if (pre.length) {
      return hydrate(
        ctx.locale!,
        pre.map((r) => ({
          product_id: r.target_product_id,
          score: Number(r.score),
          recommendation_type: RECOMMENDATION_TYPE.related,
        })),
      );
    }
    // related = broader category tree + lower keyword threshold (reuse similar with wider pool)
    const similar = await this.get_similar(product_id, { ...ctx, limit: (ctx.limit ?? 12) * 2 });
    return similar
      .slice(0, ctx.limit ?? 12)
      .map((i) => ({ ...i, recommendation_type: RECOMMENDATION_TYPE.related }));
  },

  async get_frequently_bought_together(product_id, ctx) {
    const pre = await recommendation_repository.get_precomputed(
      product_id,
      RECOMMENDATION_TYPE.fbt,
      ctx.limit ?? 8,
    );
    if (pre.length) {
      return hydrate(
        ctx.locale!,
        pre.map((r) => ({
          product_id: r.target_product_id,
          score: Number(r.score),
          recommendation_type: RECOMMENDATION_TYPE.fbt,
        })),
      );
    }
    const candidates = await get_fbt_candidates(product_id, ctx.limit ?? 8);
    return hydrate(
      ctx.locale!,
      candidates.map((c) => ({
        product_id: c.product_id,
        score: c.score,
        recommendation_type: RECOMMENDATION_TYPE.fbt,
      })),
    );
  },

  async get_trending(ctx) {
    const ids = await list_trending_product_ids(ctx.period ?? "week", ctx.limit ?? 16);
    return hydrate(
      ctx.locale!,
      ids.map((r) => ({
        product_id: r.product_id,
        score: r.score,
        recommendation_type: RECOMMENDATION_TYPE.trending,
      })),
    );
  },

  async get_for_you(ctx) {
    const purchased = await get_personalized_from_orders(ctx.user_id!, ctx.limit ?? 12);
    // blend with Redis also-viewed categories later
    return hydrate(
      ctx.locale!,
      purchased.map((c) => ({
        product_id: c.product_id,
        score: c.score,
        recommendation_type: RECOMMENDATION_TYPE.personalized,
      })),
    );
  },
};
