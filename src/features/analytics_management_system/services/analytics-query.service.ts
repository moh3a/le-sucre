import "server-only";
import type { z } from "zod";
import { redis } from "@/lib/redis";
import { sales_analytics_engine } from "../engines/sales-analytics.engine";
import { product_analytics_engine } from "../engines/product-analytics.engine";
import { customer_analytics_engine } from "../engines/customer-analytics.engine";
import { funnel_analytics_engine } from "../engines/funnel-analytics.engine";
import { analytics_cache_service } from "./analytics-cache.service";
import { ANALYTICS_CACHE, ANALYTICS_CACHE_TTL } from "../constants/cache-keys";
import type { date_range_dto, product_analytics_query_dto } from "../models/analytics.dto";
import { reporting_queries } from "../queries/reporting.queries";

export class AnalyticsQueryService {
  async overview(input: z.infer<typeof date_range_dto>) {
    const key = ANALYTICS_CACHE.overview(input.from, input.to);
    const cached = await analytics_cache_service.get(key);
    if (cached) return cached;

    const [totals, series, funnel, repeat] = await Promise.all([
      sales_analytics_engine.totals(input.from, input.to),
      sales_analytics_engine.revenue_series(input.from, input.to),
      funnel_analytics_engine.steps(input.from, input.to),
      customer_analytics_engine.repeat_purchase_rate(90),
    ]);

    const payload = { totals, series, funnel, repeat };
    await analytics_cache_service.set(key, payload, ANALYTICS_CACHE_TTL.dashboard);
    return payload;
  }

  async products(input: z.infer<typeof product_analytics_query_dto>) {
    const key = ANALYTICS_CACHE.products(input.from, input.to);
    const cached = await analytics_cache_service.get(key);
    if (cached) return cached;

    const [best_sellers, most_viewed, categories, brands] = await Promise.all([
      product_analytics_engine.best_sellers(input.from, input.to, input.limit),
      product_analytics_engine.most_viewed(input.from, input.to, input.limit),
      reporting_queries.top_categories(input.from, input.to, input.limit),
      reporting_queries.top_brands(input.from, input.to, input.limit),
    ]);

    const payload = { best_sellers, most_viewed, categories, brands };
    await analytics_cache_service.set(key, payload, ANALYTICS_CACHE_TTL.dashboard);
    return payload;
  }

  async realtime() {
    const counters = await redis.hgetall("analytics:realtime:events");
    return { counters, ts: new Date().toISOString() };
  }
}

export const analytics_query_service = new AnalyticsQueryService();
