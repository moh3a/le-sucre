import "server-only";

import { z } from "zod";

import type { catalog_suggestions_dto, catalog_trending_dto } from "../models/search.dto";
import { suggestions_engine } from "../engines/suggestions.engine";

export class SuggestionsService {
  async suggestions(input: z.infer<typeof catalog_suggestions_dto>) {
    if (!input.q?.trim()) {
      return { items: [], trending: await this.trending({ locale: input.locale, limit: 10 }) };
    }

    const items = await suggestions_engine.search_suggestions(input.locale, input.q, input.limit);

    return { items, trending: null };
  }

  async trending(input: z.infer<typeof catalog_trending_dto>) {
    return suggestions_engine.trending_searches(input.locale, input.limit);
  }

  async track_search(query: string, locale: string) {
    if (!query?.trim()) return;
    await suggestions_engine.track_search(query, locale);
  }
}

export const suggestions_service = new SuggestionsService();
