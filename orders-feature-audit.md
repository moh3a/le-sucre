# Orders Feature — Code Audit Report

Scope: `src/features/order_management_system/orders/` (+ `checkout/`, `carts/` integration, `operations/`, API routes, pages). No files were modified.

**Verdict: Mixed.** The core order lifecycle is solid and fully wired (all tRPC procs, pages, i18n, worker jobs, reservations). There are however 3 high-severity correctness issues (fabricated/incorrect timestamps, a fake multi-select delete flow, and a non-transactional order creation), a dead REST API layer, several filters/statuses that reference values that cannot exist, and a batch of i18n violations.

---

## 1. Wiring summary (healthy)

- All 18 `order_router` procs and all 16 `order_operations_router` procs have at least one client caller. `src/lib/trpc/server.ts:72,82` registers both routers.
- Pages wired: `/console/orders` → `OrdersPageClientTabbed`; `/console/orders/[order_id]` → `OrderDetailTabs`; storefront `/account/orders` + `/account/orders/[order_id]` → `CustomerOrdersPageClient` / `CustomerOrderDetailPageClient`; `/track/[order_number]` → `TrackOrderPageClient` (`trpc.orders.trackOrder`).
- i18n: 0 missing `t()` keys across fr/en/ar for all namespaces used in the feature tree.
- DB: unique indexes on `orders.order_number` and `orders.idempotency_key` (`orders/schema.ts:104-105`); `shipment_provider`/`shipment_reference` columns exist (`schema.ts:79-80`) so `customer-order-detail-page-client` reads are valid.
- Pagination meta is consistently `meta.total_pages` across repos and consumers — no `totalPages`/`total_pages` mismatch.
- Inventory reservations are correctly created at cart-add and committed at order placement (`reservation.service.ts:128-187`); TTL expiry runs in the worker (`src/worker.ts:125-129`), preorders expiry + fulfillment also wired (`src/worker.ts:111-117,136`).

---

## 2. Unwired / Dead code

### 2.1 Entire REST orders API layer — dead
`src/app/api/admin/orders/route.ts`, `[order_id]/route.ts`, `[order_id]/status/route.ts`, `[order_id]/tracking/route.ts` and `src/app/api/storefront/orders/route.ts`, `[order_id]/route.ts`.

- Grep `storefront/orders|admin/orders` across `src/**/*.{ts,tsx}` → **0 matches**. Nothing calls these endpoints.
- They duplicate the tRPC surface (`adminList`/`adminGet`/`adminTransition`/`myOrders`/`myOrderById`).
- Worse: `[order_id]/tracking/route.ts` is the only route not using `admin_route` — it has **no auth and no permission check**. Dead, but if ever hit it leaks shipping/tracking data.

### 2.2 REST checkout layer — dead
`src/app/api/storefront/checkout/place/route.ts` + `preview/route.ts`. The storefront checkout page uses `trpc.checkout.preview/place` (`checkout-page-client.tsx:70,100`); no code references `/api/storefront/checkout`. Duplicate of the tRPC checkout router.

### 2.3 `OrdersPageClient` — dead export
`orders/components/orders-page-client.tsx:18`. Exported but never imported; the tabbed `OrdersPageClientTabbed` is what `/console/orders` renders. Also hardcodes French strings (irrelevant since dead).

### 2.4 `get_allowed_transitions` — dead export
`orders/order-lifecycle.engine.ts:12`. No importer. (Note: `assert_order_transition` is used.)

### 2.5 12 unused `ORDER_ERROR` codes
`orders/constants/error-codes.ts` — only `NOT_FOUND`, `CART_NOT_FOUND`, `INSUFFICIENT_STOCK`, `ALREADY_CANCELLED`, `GUEST_ACCESS_DENIED`, `CREATE_FAILED`, `CUSTOMER_NOT_FOUND` are used (all in `order.service.ts`).
Unused: `INVALID_STATUS_TRANSITION`, `ALREADY_COMPLETED`, `CANNOT_CANCEL`, `PAYMENT_ALREADY_PAID`, `PAYMENT_FAILED`, `NOTES_UPDATE_FAILED`, `ASSIGNMENT_FAILED`, `OPERATOR_ALREADY_ASSIGNED`, `DELIVERY_PERSON_ALREADY_ASSIGNED`, `STATS_FAILED`, `CHART_FAILED`, `DELETE_FAILED`.

Notably `INVALID_STATUS_TRANSITION` is defined but `assert_order_transition` throws a raw `ConflictError` with a French-only message instead (`order-lifecycle.engine.ts:8`) — losing the multilingual error contract and the semantic code.

---

## 3. Wrong (functional bugs)

### 3.1 HIGH — Fake multi-select delete; cascade destroys financial records
`delete-order-dialog.tsx` collects a `Set` of related-data checkboxes, but `handle_confirm` (`:127-149`) never sends `selected` anywhere. `order.service.admin_delete` → `order.repository.delete_order` (`order.repository.ts:341-343`) deletes only the `orders` row, and every related table cascades:

- `invoices.order_id` → `onDelete: "cascade"` (`billing/db/schema.ts:24`)
- `shipments.order_id` → `onDelete: "cascade"` (`shipping/schema.ts:23-25`)
- `payment_transactions`/`payment_partials`/`payment_refunds`/`payment_payouts` → cascade (`payment/db/schema.ts:27,84,123,174`)

So the UI implies selective deletion but the whole financial/fulfillment trail is silently hard-deleted. There is also **no status guard** — a delivered, paid order can be deleted.
Additionally the "undo" (`execute_with_undo`, `:143-146`) only refetches — it cannot restore a deleted order. The undo toast is misleading.

### 3.2 HIGH — ISO-8601 timestamps written to MySQL DATETIME columns
`order-operations.service.ts` uses `new Date().toISOString()` (`:95` resolved_at, `:133` released_at, `:177` reviewed_at, `:181` cancelled_at), producing `2026-08-06T12:34:56.789Z`. Every other writer uses `format(new Date(), "yyyy-MM-dd HH:mm:ss")` (`order.service.ts:191,455`). MySQL DATETIME rejects the trailing `Z` → "Incorrect datetime value" on resolve-escalation, release-hold, and cancellation-review.

### 3.3 HIGH — Order creation is not transactional; partial failure leaks stock
`place_from_cart` performs ~20 DB writes with no wrapping transaction. Flash-sale units are incremented **before** the order insert (`order.service.ts:163-167`), then reservations are committed, preorder allocations confirmed (`:313-326`). The catch (`:386-388`) only rethrows — flash `sold_quantity`, committed reservations, and even a partially-created order row are not rolled back/compensated. A retry then returns the incomplete order via the idempotency check (`:123-124`).

### 3.4 MED — Admin stats count statuses that don't exist
`order-admin.repository.ts:53-56`:
```
active_orders: (map.paid ?? 0) + (map.processing ?? 0),
completed_orders: map.fulfilled ?? 0,
```
`map` is grouped by `orders.status`. `paid` and `fulfilled` are **not** values of `ORDER_STATUS` (`order-status.ts:1-10`) — so `active_orders` only ever counts `processing`, and `completed_orders` is always 0. (Should key off `delivered`, and decide a sensible "active" definition.)

### 3.5 MED — Order table filters reference non-existent enum values
`order-table.tsx:259-275`:
- status filter `{ value: "paid" }` and `{ value: "fulfilled" }` — no such `orders.status`
- payment filter `{ value: "unpaid" }` — not in `PAYMENT_STATUS`

All three filters always return 0 rows with no explanation.

### 3.6 MED — Hold flow fabricates status history and never changes order status
- `place_on_hold` writes a status event `to_status: "on_hold"` (`order-operations.service.ts:113`) — `on_hold` is not in `ORDER_STATUS`; `orders.status` itself is never updated, so the order can still be transitioned while "on hold".
- `release_hold` writes `from_status: "on_hold", to_status: "processing"` (`:136`) — hardcodes `processing` regardless of the pre-hold status.
- `review_cancellation` approved path writes `from_status: "pending_cancellation"` (`:183`) — also not a real status.

### 3.7 MED — Cancellation approval bypasses the lifecycle engine
`review_cancellation` (`order-operations.service.ts:180-186`) sets status to `cancelled` directly. A `delivered` or `failed_delivery` order can be cancelled without `assert_order_transition`. `refund_processed`/`refund_amount` are stored but no refund is actually executed.

### 3.8 MED — Empty cart throws the wrong error
`order.service.ts:130`: `if (!items.length) throw_error(ORDER_ERROR.INSUFFICIENT_STOCK)` — an empty cart is not an out-of-stock condition; there is no "empty cart" error and `CART_ERROR` isn't used here.

### 3.9 MED — `failed_delivery` → `fulfillment_status: "returned"`
`order.service.ts:456-458` sets `fulfillment_status: "returned"` for both `refunded` and `failed_delivery`. A failed delivery is not a return.

### 3.10 MED — `admin_update_items` ignores inventory entirely
`order.service.ts:661-760` deletes and re-inserts order items with no availability check and no reservation handling. Removed/reduced lines keep their committed reservations (stock already decremented), new lines never get reservations. Stock drift guaranteed on item edits.

### 3.11 MED — Comments tab permanently stuck loading when empty
`order-comments-tab.tsx:65`: `QueryGuard query={{ isLoading: !comments?.length }}`. Once loaded with `[]`, `isLoading` is true forever — the whole tab (including the "add comment" composer) never renders for orders with no comments.

### 3.12 MED — Admin Create Order: notes silently dropped
`create-order.tsx:231` sends `notes`, and `admin_create_order_dto` declares `notes` (`order.dto.ts:18`), but `order_service.admin_create` (`order.service.ts:559-585`) never passes it to `place_from_cart`, which doesn't accept it. The Notes field is silently discarded.

### 3.13 MED — Delivery subsystem bypasses lifecycle + event logging
`shipping/operations/services/delivery.service.ts:60,101,120` call `order_repository.update_order_status` directly — no `assert_order_transition`, no `insert_status_event`, no audit. Order status is mutated from a second subsystem that ignores the orders feature's own rules.

---

## 4. i18n violations (hardcoded user-facing strings)

- `order-stats.tsx:16-56` — English labels ("Monthly revenue", "Active orders", …) on a French-admin dashboard.
- `customer-orders-page-client.tsx` — "Toutes", "Aucune commande trouvée", "Commencer mes achats", "Précédent", "Suivant", "Commande", "Livraison vers".
- `customer-order-detail-page-client.tsx` — "Aucun article", "Non renseignée", "Réf:", "Réduction", "TVA", "3-5 jours ouvrés".
- `orders-page-client.tsx:21-22` — "Commandes", "Suivi des commandes clients" (dead component anyway).

---

## 5. Minor / polish

- **Meta shape inconsistency:** `admin_list_by_product` returns `total_pages`/`total_records` only, and `Math.ceil(0/limit)` → 0 when empty (`order.repository.ts:46-49`), whereas `list_for_customer`/`admin_list` use `|| 1` and include `page/limit/has_more` (`:200-210,241-258`).
- **Product orders panel pagination is inert:** `product-orders-panel.tsx:76-91` always queries `page: 1, limit: 10` while `useDataTable` manipulates URL params — table paging controls don't load more data.
- **Raw status shown:** `product-orders-panel.tsx:52` renders the raw `status` string instead of `ORDER_LABELS`.
- **Terminal-status options:** `general-tab.tsx:65-68` — for `cancelled`/`refunded` (empty transition list) the Select falls back to showing *all* statuses, guaranteeing a server-side "Transition interdite".
- **Charts:** `order-charts.tsx` fixed pixel widths (400/800) — not responsive; also returns `null` during loading so `QueryGuard` loading state never shows (`:14`).
- **Dead UI buttons:** `customer-order-detail-page-client.tsx:354-360` — "Reorder / Request return / Download invoice" have no handlers.
- **Ordering inconsistency:** `find_by_user_id` orders by `placed_at ?? created_at` (`order.repository.ts:159`) while lists use `created_at`.
- **`place_order_dto.shipping_method`** is resolved in `checkout.service.place` but re-declared on the `place_from_cart` input type and never used there (`order.service.ts:116`).
- **Adjustment sign stripped on store:** `order.service.ts:293` removes the leading `-` from adjustment amounts, losing the sign for discounts.

---

## Priority recommendation

1. Fix 3.2 (timestamp format) and 3.1 (delete flow) first — both can destroy/corrupt data.
2. Wrap `place_from_cart` in a transaction with compensating releases (3.3).
3. Fix 3.4/3.5 (stats + filter values) — user-visible broken dashboards.
4. Then the dead REST layer (2.1/2.2): remove it or wire it; at minimum add auth to `tracking/route.ts`.
