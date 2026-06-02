# Le Sucré

## TODO

- assign operator to order
- transfer order between operators
- order notes
- customer call history
- failed delivery handling
- return requests
- replacement requests
- stock adjustments
- approval workflows
- campaign approval
- review moderation workflows
- each feature should have async/await function in its repositories, engines and services
- each feature should have redis cache keys
- admin should only fetch from trpc
- all schema IDs should be varchar 255
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
- Prompt 14 — Invoice & Financial Document System
- Prompt 16 — Campaign Management System
- Event Bus
- Domain Events System
