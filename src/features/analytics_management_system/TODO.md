# Implementation Notes
// format(new Date(), "yyyy-MM-dd HH:mm:ss")
## Nightly Rollup
Schedule nightly rollup (cron or PM2):
```ts
// enqueue once at midnight
await db.insert(analytics_jobs).values({
  id: generate_id(),
  job_type: "rollup_daily",
  payload: { day_key: yesterday },
  run_after: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
});
```
- Implemented in promotion-job-runner.service.ts

## Integration Hooks
Implemented in src/features/analytics_management_system/hooks/analytics-hooks.ts:
- Product PDP load -> `track_product_view`
- cart.service.add_item -> `track_add_to_cart`
- checkout.service.preview -> `track_checkout_started`
- order.service.place_from_cart (after paid) -> `track_purchase`
- Catalog search API -> `track_search`
- Recommendation carousel click -> `track_recommendation_click`
- Cart inactive > 1h job -> `track_cart_abandoned`

## Retention + Scale Notes
Layer ->	             Strategy
Ingestion ->           Redis counters + buffered LPUSH (50k cap)
Raw events ->          90-day purge job
Aggregates ->          Daily rollups → cheap dashboard queries
Real-time ->           Redis HINCRBY + PFADD UV
Future BI ->           AnalyticsProvider.forward_realtime() → Kafka
Massive data ->        Partition by day_key; index (event_type, day_key)
