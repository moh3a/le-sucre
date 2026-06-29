import {
  boolean,
  decimal,
  index,
  int,
  json,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { generate_id } from "@/lib/utils";
import { orders } from "@/features/order_management_system/orders/schema";
import { products } from "@/features/product_information_management/products/schema";
import { warehouses } from "@/features/inventory_management_system/warehouses/schema";
import { users } from "@/features/authentication_and_authorization/auth/schema";

// ─── Generic Approval Workflow ──────────────────────────────────────────────

export const approval_workflows = mysqlTable(
  "approval_workflows",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    name: varchar("name", { length: 255 }).notNull(),
    entity_type: varchar("entity_type", { length: 64 }).notNull(),
    steps: json("steps").$type<Array<{ order: number; role: string; label: string }>>().notNull(),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("approval_workflows_entity_type_uidx").on(t.entity_type),
  ],
);

export const approval_requests = mysqlTable(
  "approval_requests",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    workflow_id: varchar("workflow_id", { length: 255 }).notNull().references(() => approval_workflows.id, { onDelete: "cascade" }),
    entity_type: varchar("entity_type", { length: 64 }).notNull(),
    entity_id: varchar("entity_id", { length: 255 }).notNull(),
    requested_by_user_id: varchar("requested_by_user_id", { length: 255 }).notNull(),
    current_step: int("current_step").notNull().default(0),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    notes: text("notes"),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("approval_requests_entity_idx").on(t.entity_type, t.entity_id),
    index("approval_requests_status_idx").on(t.status, t.current_step),
    index("approval_requests_workflow_idx").on(t.workflow_id),
  ],
);

export const approval_actions = mysqlTable(
  "approval_actions",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    request_id: varchar("request_id", { length: 255 }).notNull().references(() => approval_requests.id, { onDelete: "cascade" }),
    step: int("step").notNull(),
    user_id: varchar("user_id", { length: 255 }).notNull(),
    action: varchar("action", { length: 32 }).notNull(),
    comment: text("comment"),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("approval_actions_request_idx").on(t.request_id, t.step),
  ],
);

// ─── Order Auto-Routing Rules ───────────────────────────────────────────────

export const order_routing_rules = mysqlTable(
  "order_routing_rules",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    name: varchar("name", { length: 255 }).notNull(),
    priority: int("priority").notNull().default(100),
    conditions: json("conditions").$type<Array<{ field: string; operator: string; value: string }>>().notNull(),
    assign_to_user_id: varchar("assign_to_user_id", { length: 255 }),
    assign_to_role: varchar("assign_to_role", { length: 64 }),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("order_routing_rules_priority_idx").on(t.is_active, t.priority),
  ],
);

// ─── SLA Definitions ────────────────────────────────────────────────────────

export const sla_definitions = mysqlTable(
  "sla_definitions",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    entity_type: varchar("entity_type", { length: 64 }).notNull(),
    priority: varchar("priority", { length: 16 }).notNull(),
    response_hours: int("response_hours").notNull(),
    resolution_hours: int("resolution_hours").notNull(),
    escalation_minutes: int("escalation_minutes").notNull().default(30),
    escalate_to_role: varchar("escalate_to_role", { length: 64 }),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("sla_definitions_entity_priority_uidx").on(t.entity_type, t.priority),
  ],
);

export const sla_tracking = mysqlTable(
  "sla_tracking",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    sla_definition_id: varchar("sla_definition_id", { length: 255 }).notNull().references(() => sla_definitions.id, { onDelete: "cascade" }),
    entity_type: varchar("entity_type", { length: 64 }).notNull(),
    entity_id: varchar("entity_id", { length: 255 }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("active"),
    started_at: timestamp("started_at", { mode: "string" }).notNull(),
    response_due_at: timestamp("response_due_at", { mode: "string" }),
    resolution_due_at: timestamp("resolution_due_at", { mode: "string" }),
    responded_at: timestamp("responded_at", { mode: "string" }),
    resolved_at: timestamp("resolved_at", { mode: "string" }),
    escalation_count: int("escalation_count").notNull().default(0),
    last_escalated_at: timestamp("last_escalated_at", { mode: "string" }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("sla_tracking_entity_status_idx").on(t.entity_type, t.entity_id, t.status),
    index("sla_tracking_due_idx").on(t.status, t.response_due_at),
  ],
);

// ─── Suppliers / Procurement ────────────────────────────────────────────────

export const suppliers = mysqlTable(
  "suppliers",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 32 }).notNull(),
    contact_name: varchar("contact_name", { length: 255 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 32 }),
    address: text("address"),
    payment_terms: varchar("payment_terms", { length: 64 }).default("net_30"),
    currency: varchar("currency", { length: 3 }).notNull().default("DZD"),
    status: varchar("status", { length: 32 }).notNull().default("active"),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    created_by_user_id: varchar("created_by_user_id", { length: 255 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("suppliers_code_uidx").on(t.code),
    index("suppliers_status_idx").on(t.status),
  ],
);

export const supplier_products = mysqlTable(
  "supplier_products",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    supplier_id: varchar("supplier_id", { length: 255 }).notNull().references(() => suppliers.id, { onDelete: "cascade" }),
    product_id: varchar("product_id", { length: 255 }).notNull().references(() => products.id, { onDelete: "cascade" }),
    supplier_sku: varchar("supplier_sku", { length: 64 }),
    unit_cost: decimal("unit_cost", { precision: 12, scale: 2 }).notNull(),
    lead_time_days: int("lead_time_days").notNull().default(7),
    min_order_qty: int("min_order_qty").notNull().default(1),
    is_preferred: boolean("is_preferred").notNull().default(false),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("supplier_products_supplier_product_uidx").on(t.supplier_id, t.product_id),
    index("supplier_products_product_idx").on(t.product_id),
  ],
);

export const purchase_orders = mysqlTable(
  "purchase_orders",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    po_number: varchar("po_number", { length: 64 }).notNull(),
    supplier_id: varchar("supplier_id", { length: 255 }).notNull().references(() => suppliers.id, { onDelete: "cascade" }),
    warehouse_id: varchar("warehouse_id", { length: 255 }).references(() => warehouses.id, { onDelete: "set null" }),
    status: varchar("status", { length: 32 }).notNull().default("draft"),
    subtotal: decimal("subtotal", { precision: 14, scale: 2 }).notNull().default("0"),
    tax: decimal("tax", { precision: 14, scale: 2 }).notNull().default("0"),
    total: decimal("total", { precision: 14, scale: 2 }).notNull().default("0"),
    currency: varchar("currency", { length: 3 }).notNull().default("DZD"),
    notes: text("notes"),
    expected_delivery_at: timestamp("expected_delivery_at", { mode: "string" }),
    delivered_at: timestamp("delivered_at", { mode: "string" }),
    created_by_user_id: varchar("created_by_user_id", { length: 255 }).notNull(),
    approved_by_user_id: varchar("approved_by_user_id", { length: 255 }),
    approved_at: timestamp("approved_at", { mode: "string" }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("purchase_orders_po_number_uidx").on(t.po_number),
    index("purchase_orders_supplier_idx").on(t.supplier_id),
    index("purchase_orders_status_idx").on(t.status),
  ],
);

export const purchase_order_items = mysqlTable(
  "purchase_order_items",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    po_id: varchar("po_id", { length: 255 }).notNull().references(() => purchase_orders.id, { onDelete: "cascade" }),
    product_id: varchar("product_id", { length: 255 }).notNull().references(() => products.id, { onDelete: "cascade" }),
    quantity: int("quantity").notNull(),
    received_quantity: int("received_quantity").notNull().default(0),
    unit_cost: decimal("unit_cost", { precision: 12, scale: 2 }).notNull(),
    total_cost: decimal("total_cost", { precision: 14, scale: 2 }).notNull(),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("purchase_order_items_po_idx").on(t.po_id),
  ],
);

// ─── Inter-Warehouse Inventory Transfers ────────────────────────────────────

export const inventory_transfers = mysqlTable(
  "inventory_transfers",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    transfer_number: varchar("transfer_number", { length: 64 }).notNull(),
    source_warehouse_id: varchar("source_warehouse_id", { length: 255 }).notNull().references(() => warehouses.id, { onDelete: "restrict" }),
    destination_warehouse_id: varchar("destination_warehouse_id", { length: 255 }).notNull().references(() => warehouses.id, { onDelete: "restrict" }),
    status: varchar("status", { length: 32 }).notNull().default("draft"),
    reason: varchar("reason", { length: 64 }).notNull(),
    notes: text("notes"),
    shipped_at: timestamp("shipped_at", { mode: "string" }),
    received_at: timestamp("received_at", { mode: "string" }),
    created_by_user_id: varchar("created_by_user_id", { length: 255 }).notNull(),
    approved_by_user_id: varchar("approved_by_user_id", { length: 255 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("inventory_transfers_number_uidx").on(t.transfer_number),
    index("inventory_transfers_source_idx").on(t.source_warehouse_id, t.status),
    index("inventory_transfers_dest_idx").on(t.destination_warehouse_id, t.status),
  ],
);

export const inventory_transfer_items = mysqlTable(
  "inventory_transfer_items",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    transfer_id: varchar("transfer_id", { length: 255 }).notNull().references(() => inventory_transfers.id, { onDelete: "cascade" }),
    product_id: varchar("product_id", { length: 255 }).notNull().references(() => products.id, { onDelete: "cascade" }),
    quantity: int("quantity").notNull(),
    received_quantity: int("received_quantity").notNull().default(0),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("inventory_transfer_items_transfer_idx").on(t.transfer_id),
  ],
);

// ─── Payment Reconciliation ─────────────────────────────────────────────────

export const payment_reconciliation = mysqlTable(
  "payment_reconciliation",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 255 }).notNull().references(() => orders.id, { onDelete: "cascade" }),
    transaction_reference: varchar("transaction_reference", { length: 255 }),
    bank_reference: varchar("bank_reference", { length: 255 }),
    amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
    fee: decimal("fee", { precision: 14, scale: 2 }).notNull().default("0"),
    net_amount: decimal("net_amount", { precision: 14, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("DZD"),
    payment_method: varchar("payment_method", { length: 64 }),
    status: varchar("status", { length: 32 }).notNull().default("unmatched"),
    matched_at: timestamp("matched_at", { mode: "string" }),
    matched_by_user_id: varchar("matched_by_user_id", { length: 255 }),
    notes: text("notes"),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("reconciliation_order_idx").on(t.order_id),
    index("reconciliation_status_idx").on(t.status),
    index("reconciliation_reference_idx").on(t.transaction_reference, t.bank_reference),
  ],
);

// ─── Fraud Review ───────────────────────────────────────────────────────────

export const fraud_reviews = mysqlTable(
  "fraud_reviews",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 255 }).notNull().references(() => orders.id, { onDelete: "cascade" }),
    risk_score: int("risk_score").notNull().default(0),
    flags: json("flags").$type<Array<{ rule: string; reason: string; severity: "low" | "medium" | "high" }>>().notNull().default([]),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    reviewed_by_user_id: varchar("reviewed_by_user_id", { length: 255 }),
    decision: varchar("decision", { length: 32 }),
    decision_reason: text("decision_reason"),
    reviewed_at: timestamp("reviewed_at", { mode: "string" }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("fraud_reviews_order_uidx").on(t.order_id),
    index("fraud_reviews_status_score_idx").on(t.status, t.risk_score),
  ],
);

// ─── Agent KPI / Performance Metrics ────────────────────────────────────────

export const agent_kpi_daily = mysqlTable(
  "agent_kpi_daily",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    user_id: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    day_key: varchar("day_key", { length: 10 }).notNull(),
    role: varchar("role", { length: 64 }).notNull(),
    orders_processed: int("orders_processed").notNull().default(0),
    orders_assigned: int("orders_assigned").notNull().default(0),
    cases_resolved: int("cases_resolved").notNull().default(0),
    tasks_completed: int("tasks_completed").notNull().default(0),
    calls_made: int("calls_made").notNull().default(0),
    avg_response_time_minutes: decimal("avg_response_time_minutes", { precision: 10, scale: 2 }),
    customer_rating_avg: decimal("customer_rating_avg", { precision: 4, scale: 2 }),
    sla_breaches: int("sla_breaches").notNull().default(0),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("agent_kpi_daily_user_day_uidx").on(t.user_id, t.day_key),
    index("agent_kpi_daily_role_day_idx").on(t.role, t.day_key),
  ],
);

// ─── RMA (Return Merchandise Authorization) ─────────────────────────────────

export const rma_records = mysqlTable(
  "rma_records",
  {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => generate_id()),
    rma_number: varchar("rma_number", { length: 64 }).notNull(),
    return_request_id: varchar("return_request_id", { length: 255 }),
    order_id: varchar("order_id", { length: 255 }).notNull().references(() => orders.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 32 }).notNull().default("issued"),
    return_label_url: varchar("return_label_url", { length: 2048 }),
    carrier: varchar("carrier", { length: 64 }),
    tracking_number: varchar("tracking_number", { length: 128 }),
    received_at: timestamp("received_at", { mode: "string" }),
    inspected_by_user_id: varchar("inspected_by_user_id", { length: 255 }),
    inspection_notes: text("inspection_notes"),
    disposition: varchar("disposition", { length: 32 }),
    created_by_user_id: varchar("created_by_user_id", { length: 255 }).notNull(),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("rma_records_number_uidx").on(t.rma_number),
    index("rma_records_order_idx").on(t.order_id),
    index("rma_records_status_idx").on(t.status),
  ],
);

// ─── Relations ──────────────────────────────────────────────────────────────

export const approvalWorkflowsRelations = relations(approval_workflows, ({ many }) => ({
  requests: many(approval_requests),
}));

export const approvalRequestsRelations = relations(approval_requests, ({ one, many }) => ({
  workflow: one(approval_workflows, {
    fields: [approval_requests.workflow_id],
    references: [approval_workflows.id],
  }),
  actions: many(approval_actions),
}));

export const approvalActionsRelations = relations(approval_actions, ({ one }) => ({
  request: one(approval_requests, {
    fields: [approval_actions.request_id],
    references: [approval_requests.id],
  }),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  products: many(supplier_products),
  purchase_orders: many(purchase_orders),
}));

export const supplierProductsRelations = relations(supplier_products, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplier_products.supplier_id],
    references: [suppliers.id],
  }),
  product: one(products, {
    fields: [supplier_products.product_id],
    references: [products.id],
  }),
}));

export const purchaseOrdersRelations = relations(purchase_orders, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [purchase_orders.supplier_id],
    references: [suppliers.id],
  }),
  items: many(purchase_order_items),
}));

export const purchaseOrderItemsRelations = relations(purchase_order_items, ({ one }) => ({
  purchase_order: one(purchase_orders, {
    fields: [purchase_order_items.po_id],
    references: [purchase_orders.id],
  }),
  product: one(products, {
    fields: [purchase_order_items.product_id],
    references: [products.id],
  }),
}));

export const inventoryTransfersRelations = relations(inventory_transfers, ({ one, many }) => ({
  source_warehouse: one(warehouses, {
    fields: [inventory_transfers.source_warehouse_id],
    references: [warehouses.id],
  }),
  destination_warehouse: one(warehouses, {
    fields: [inventory_transfers.destination_warehouse_id],
    references: [warehouses.id],
  }),
  items: many(inventory_transfer_items),
}));

export const inventoryTransferItemsRelations = relations(inventory_transfer_items, ({ one }) => ({
  transfer: one(inventory_transfers, {
    fields: [inventory_transfer_items.transfer_id],
    references: [inventory_transfers.id],
  }),
  product: one(products, {
    fields: [inventory_transfer_items.product_id],
    references: [products.id],
  }),
}));

export const rmaRecordsRelations = relations(rma_records, ({ one }) => ({
  order: one(orders, {
    fields: [rma_records.order_id],
    references: [orders.id],
  }),
}));
