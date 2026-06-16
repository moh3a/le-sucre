# Le Sucré

## TODO

- error -follow inventory service- error codes should unique to each feature
- continue Prompt 16 — Campaign Management System
- customer call history
- failed delivery handling
- return requests
- replacement requests
- stock adjustments
- approval workflows
- campaign approval
- review moderation workflows
- admin should only fetch from trpc
- Storefront: use https://www.abui.io/components/label-selector for variant selection
- Implement event, example:

```ts
void event_ingestion_service.track({
  event_type: "add_to_cart",
  product_id: sku.product_id,
  sku_id: sku.id,
  quantity: input.quantity,
});
```

## Features to implement

- Prompt 13 — Payments, Partial Payments, Split Payments & Refunds
- Event Bus
- Domain Events System
