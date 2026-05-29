# TODOS

- Schedule nightly rollup (cron or PM2):
```ts
// enqueue once at midnight
await db.insert(analytics_jobs).values({
  id: generate_id(),
  job_type: "rollup_daily",
  payload: { day_key: yesterday },
  run_after: new Date().toISOString(),
});
```

- Integration hooks (minimal patches):
Location ->	                                       Event
Product PDP load ->                                `product_view`
cart.service.add_item ->                           `add_to_cart`
checkout.service.preview ->                        `checkout_started`
order.service.place_from_cart (after paid) ->      `track_purchase`
Catalog search API ->                              `search`
Recommendation carousel click ->                   `recommendation_click`
Cart inactive > 1h job ->                          `cart_abandoned`

- Retention + scale notes
Layer ->	             Strategy
Ingestion ->           Redis counters + buffered LPUSH (50k cap)
Raw events ->          90-day purge job
Aggregates ->          Daily rollups → cheap dashboard queries
Real-time ->           Redis HINCRBY + PFADD UV
Future BI ->           AnalyticsProvider.forward_realtime() → Kafka
Massive data ->        Partition by day_key; index (event_type, day_key)
