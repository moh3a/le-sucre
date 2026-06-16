# Le Sucré

## TODO

- continue Prompt 16 — Campaign Management System
- customer call history
- replacement requests
- stock adjustments
- approval workflows
- campaign approval
- review moderation workflows
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
