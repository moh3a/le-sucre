# Le Sucré

## TODO

- implement UI component guard that checks for trpc useQuery or useMutation, handle isLoading/isFetching/isPending, and handle UNAUTHORIZED error by showing a shadcn alert with message `const { data } = authClient.useSession()` has type
 
```json
{
  "user": {
    "name": "Administrateur",
    "email": "admin@le-sucre.local",
    "emailVerified": false,
    "image": null,
    "createdAt": "2026-05-26T17:14:35.000Z",
    "updatedAt": "2026-05-26T17:14:35.000Z",
    "role": null,
    "banned": null,
    "banReason": null,
    "banExpires": null,
    "id": "4eJ2lUcIxIn9q3ZwoqkeEmsxRlyd7Rr8"
  },
  "session": {
    "expiresAt": "2026-06-28T17:39:49.000Z",
    "token": "6pHuLPfhu3drONSsMwhiqMvEe9X5mR3a",
    "createdAt": "2026-06-20T16:24:33.000Z",
    "updatedAt": "2026-06-21T17:39:49.000Z",
    "ipAddress": "0000:0000:0000:0000:0000:0000:0000:0000",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
    "userId": "4eJ2lUcIxIn9q3ZwoqkeEmsxRlyd7Rr8",
    "impersonatedBy": null,
    "id": "xen9wfJaLlOHn0aZVsy4xzRhLyq0TFyF"
  },
  "userRole": "admin"
}
```

- fix analytics
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
