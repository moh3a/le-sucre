# Le Sucré

## TODO

- fix analytics
- create a media libray to manage all media from property thumbnail images, to product media, brand images...
- remove all hard coded text
- continue Prompt 16 — Campaign Management System
- continue Prompt 19 - Operational Workflows Audit & Business Process Completion
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

- Event Bus
- Domain Events System
