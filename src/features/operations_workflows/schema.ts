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
import { users } from "@/features/authentication_and_authorization/auth/schema";
import { return_requests } from "@/features/order_management_system/return_replacement/schema";

// ═══════════════════════════════════════════
// ORDER OPERATIONS
// ═══════════════════════════════════════════

export const order_assignments = mysqlTable(
  "order_assignments",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 255 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    assignment_type: varchar("assignment_type", { length: 32 }).notNull(),
    // operator | delivery_person
    from_user_id: varchar("from_user_id", { length: 255 }),
    to_user_id: varchar("to_user_id", { length: 255 }).notNull(),
    assigned_by_user_id: varchar("assigned_by_user_id", { length: 255 }).notNull(),
    note: varchar("note", { length: 512 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("order_assignments_order_idx").on(t.order_id, t.created_at),
    index("order_assignments_to_user_idx").on(t.to_user_id, t.assignment_type),
  ],
);

export const order_escalations = mysqlTable(
  "order_escalations",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 255 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    escalated_by_user_id: varchar("escalated_by_user_id", { length: 255 }).notNull(),
    assigned_to_user_id: varchar("assigned_to_user_id", { length: 255 }),
    reason: varchar("reason", { length: 64 }).notNull(),
    // payment_dispute | customer_complaint | delivery_issue | technical | other
    description: text("description"),
    priority: varchar("priority", { length: 16 }).notNull().default("normal"),
    // low | normal | high | urgent
    status: varchar("status", { length: 32 }).notNull().default("open"),
    // open | in_review | resolved | dismissed
    resolution: text("resolution"),
    resolved_by_user_id: varchar("resolved_by_user_id", { length: 255 }),
    resolved_at: timestamp("resolved_at", { mode: "string" }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("order_escalations_order_idx").on(t.order_id),
    index("order_escalations_status_priority_idx").on(t.status, t.priority),
  ],
);

export const order_holds = mysqlTable(
  "order_holds",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 255 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    reason: varchar("reason", { length: 64 }).notNull(),
    // payment_verification | fraud_check | customer_request | stock_issue | address_verification | other
    description: text("description"),
    held_by_user_id: varchar("held_by_user_id", { length: 255 }).notNull(),
    released_by_user_id: varchar("released_by_user_id", { length: 255 }),
    released_at: timestamp("released_at", { mode: "string" }),
    released_reason: varchar("released_reason", { length: 512 }),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("order_holds_order_active_idx").on(t.order_id, t.is_active),
    index("order_holds_held_by_idx").on(t.held_by_user_id),
  ],
);

export const order_cancellation_requests = mysqlTable(
  "order_cancellation_requests",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 255 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    requested_by_user_id: varchar("requested_by_user_id", { length: 255 }).notNull(),
    reason: varchar("reason", { length: 64 }).notNull(),
    // customer_request | payment_issue | out_of_stock | fraud | duplicate | other
    description: text("description"),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    // pending | approved | rejected
    reviewed_by_user_id: varchar("reviewed_by_user_id", { length: 255 }),
    review_note: varchar("review_note", { length: 512 }),
    reviewed_at: timestamp("reviewed_at", { mode: "string" }),
    refund_processed: boolean("refund_processed").notNull().default(false),
    refund_amount: decimal("refund_amount", { precision: 12, scale: 2 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("order_cancellation_requests_order_idx").on(t.order_id),
    index("order_cancellation_requests_status_idx").on(t.status),
  ],
);

export const order_comments = mysqlTable(
  "order_comments",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 255 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    author_user_id: varchar("author_user_id", { length: 255 }).notNull(),
    comment_type: varchar("comment_type", { length: 32 }).notNull().default("internal"),
    // internal | note | customer_facing
    content: text("content").notNull(),
    is_private: boolean("is_private").notNull().default(true),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("order_comments_order_idx").on(t.order_id, t.created_at),
    index("order_comments_author_idx").on(t.author_user_id),
  ],
);

// ═══════════════════════════════════════════
// CUSTOMER RELATIONSHIP MANAGEMENT
// ═══════════════════════════════════════════

export const customer_contacts = mysqlTable(
  "customer_contacts",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    user_id: varchar("user_id", { length: 255 }).references(() => users.id, {
      onDelete: "set null",
    }),
    order_id: varchar("order_id", { length: 255 }).references(() => orders.id, {
      onDelete: "set null",
    }),
    contact_type: varchar("contact_type", { length: 32 }).notNull(),
    // phone_call | whatsapp | sms | email
    direction: varchar("direction", { length: 16 }).notNull(),
    // inbound | outbound
    subject: varchar("subject", { length: 255 }),
    summary: text("summary"),
    duration_seconds: int("duration_seconds"),
    handled_by_user_id: varchar("handled_by_user_id", { length: 255 }),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("customer_contacts_user_idx").on(t.user_id, t.created_at),
    index("customer_contacts_order_idx").on(t.order_id),
    index("customer_contacts_handled_by_idx").on(t.handled_by_user_id),
  ],
);

export const customer_notes = mysqlTable(
  "customer_notes",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    user_id: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    note_type: varchar("note_type", { length: 32 }).notNull().default("private"),
    // private | operator | follow_up
    content: text("content").notNull(),
    created_by_user_id: varchar("created_by_user_id", { length: 255 }).notNull(),
    is_pinned: boolean("is_pinned").notNull().default(false),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("customer_notes_user_idx").on(t.user_id, t.created_at),
    index("customer_notes_created_by_idx").on(t.created_by_user_id),
  ],
);

export const customer_follow_ups = mysqlTable(
  "customer_follow_ups",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    user_id: varchar("user_id", { length: 255 }).references(() => users.id, {
      onDelete: "set null",
    }),
    order_id: varchar("order_id", { length: 255 }).references(() => orders.id, {
      onDelete: "set null",
    }),
    follow_up_type: varchar("follow_up_type", { length: 32 }).notNull(),
    // callback | follow_up | reminder
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    assigned_to_user_id: varchar("assigned_to_user_id", { length: 255 }),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    // pending | completed | cancelled | rescheduled
    priority: varchar("priority", { length: 16 }).notNull().default("normal"),
    // low | normal | high | urgent
    scheduled_at: timestamp("scheduled_at", { mode: "string" }).notNull(),
    completed_at: timestamp("completed_at", { mode: "string" }),
    completed_by_user_id: varchar("completed_by_user_id", { length: 255 }),
    result_notes: text("result_notes"),
    created_by_user_id: varchar("created_by_user_id", { length: 255 }).notNull(),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("customer_follow_ups_user_idx").on(t.user_id),
    index("customer_follow_ups_assigned_idx").on(t.assigned_to_user_id, t.status),
    index("customer_follow_ups_schedule_idx").on(t.scheduled_at, t.status),
  ],
);

export const customer_support_cases = mysqlTable(
  "customer_support_cases",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    user_id: varchar("user_id", { length: 255 }).references(() => users.id, {
      onDelete: "set null",
    }),
    order_id: varchar("order_id", { length: 255 }).references(() => orders.id, {
      onDelete: "set null",
    }),
    subject: varchar("subject", { length: 255 }).notNull(),
    description: text("description").notNull(),
    category: varchar("category", { length: 64 }).notNull().default("general"),
    // general | order_issue | payment | delivery | return | product | technical | complaint
    priority: varchar("priority", { length: 16 }).notNull().default("normal"),
    status: varchar("status", { length: 32 }).notNull().default("open"),
    // open | assigned | in_progress | resolved | closed | reopened
    assigned_to_user_id: varchar("assigned_to_user_id", { length: 255 }),
    resolution: text("resolution"),
    resolved_by_user_id: varchar("resolved_by_user_id", { length: 255 }),
    resolved_at: timestamp("resolved_at", { mode: "string" }),
    reopened_count: int("reopened_count").notNull().default(0),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    created_by_user_id: varchar("created_by_user_id", { length: 255 }).notNull(),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("customer_support_cases_user_idx").on(t.user_id, t.created_at),
    index("customer_support_cases_assigned_idx").on(t.assigned_to_user_id, t.status),
    index("customer_support_cases_status_priority_idx").on(t.status, t.priority),
  ],
);

export const customer_support_messages = mysqlTable(
  "customer_support_messages",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    case_id: varchar("case_id", { length: 255 })
      .notNull()
      .references(() => customer_support_cases.id, { onDelete: "cascade" }),
    author_user_id: varchar("author_user_id", { length: 255 }).notNull(),
    message: text("message").notNull(),
    is_internal: boolean("is_internal").notNull().default(false),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [index("customer_support_messages_case_idx").on(t.case_id, t.created_at)],
);

// ═══════════════════════════════════════════
// DELIVERY OPERATIONS
// ═══════════════════════════════════════════

export const delivery_attempts = mysqlTable(
  "delivery_attempts",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    shipment_id: varchar("shipment_id", { length: 255 }).notNull(),
    order_id: varchar("order_id", { length: 255 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    attempt_number: int("attempt_number").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    // successful | failed | customer_unavailable | wrong_address | refused | cancelled
    description: varchar("description", { length: 512 }),
    delivery_person_id: varchar("delivery_person_id", { length: 255 }),
    attempted_at: timestamp("attempted_at", { mode: "string" }).notNull(),
    next_attempt_at: timestamp("next_attempt_at", { mode: "string" }),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("delivery_attempts_shipment_idx").on(t.shipment_id, t.attempt_number),
    index("delivery_attempts_order_idx").on(t.order_id),
  ],
);

// ═══════════════════════════════════════════
// WARRANTY
// ═══════════════════════════════════════════

export const warranty_requests = mysqlTable(
  "warranty_requests",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 255 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    order_item_id: varchar("order_item_id", { length: 255 }),
    product_id: varchar("product_id", { length: 255 }).notNull(),
    sku_id: varchar("sku_id", { length: 255 }).notNull(),
    user_id: varchar("user_id", { length: 255 }).references(() => users.id, {
      onDelete: "set null",
    }),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    // pending | under_review | approved | rejected | in_repair | repaired | replaced | completed | cancelled
    issue_type: varchar("issue_type", { length: 64 }).notNull(),
    // manufacturing_defect | damage_during_shipping | malfunction | cosmetic | other
    description: text("description").notNull(),
    technician_user_id: varchar("technician_user_id", { length: 255 }),
    technician_notes: text("technician_notes"),
    resolution_type: varchar("resolution_type", { length: 32 }),
    // repair | replace | refund | none
    resolution_notes: text("resolution_notes"),
    resolution_date: timestamp("resolution_date", { mode: "string" }),
    reviewed_by_user_id: varchar("reviewed_by_user_id", { length: 255 }),
    reviewed_at: timestamp("reviewed_at", { mode: "string" }),
    completed_at: timestamp("completed_at", { mode: "string" }),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("warranty_requests_order_idx").on(t.order_id),
    index("warranty_requests_user_idx").on(t.user_id),
    index("warranty_requests_technician_idx").on(t.technician_user_id),
    index("warranty_requests_status_idx").on(t.status),
  ],
);

// ═══════════════════════════════════════════
// INVENTORY OPERATIONS
// ═══════════════════════════════════════════

export const inventory_adjustment_requests = mysqlTable(
  "inventory_adjustment_requests",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    sku_id: varchar("sku_id", { length: 255 }).notNull(),
    warehouse_id: varchar("warehouse_id", { length: 255 }).notNull().default("default"),
    adjustment_type: varchar("adjustment_type", { length: 32 }).notNull(),
    // increase | decrease | damage | loss | correction
    quantity_delta: int("quantity_delta").notNull(),
    current_on_hand: int("current_on_hand").notNull(),
    expected_on_hand: int("expected_on_hand").notNull(),
    reason: text("reason").notNull(),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    // pending | approved | rejected | cancelled
    requested_by_user_id: varchar("requested_by_user_id", { length: 255 }).notNull(),
    reviewed_by_user_id: varchar("reviewed_by_user_id", { length: 255 }),
    review_note: varchar("review_note", { length: 512 }),
    reviewed_at: timestamp("reviewed_at", { mode: "string" }),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("inventory_adjustment_requests_sku_idx").on(t.sku_id),
    index("inventory_adjustment_requests_status_idx").on(t.status),
    index("inventory_adjustment_requests_requested_by_idx").on(t.requested_by_user_id),
  ],
);

// ═══════════════════════════════════════════
// PRODUCT MANAGEMENT WORKFLOWS
// ═══════════════════════════════════════════

export const product_change_log = mysqlTable(
  "product_change_log",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    product_id: varchar("product_id", { length: 255 }).notNull(),
    change_type: varchar("change_type", { length: 32 }).notNull(),
    // pricing | stock | category | content | status | media | seo
    field_name: varchar("field_name", { length: 64 }).notNull(),
    old_value: text("old_value"),
    new_value: text("new_value"),
    changed_by_user_id: varchar("changed_by_user_id", { length: 255 }),
    notes: varchar("notes", { length: 512 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("product_change_log_product_idx").on(t.product_id, t.created_at),
    index("product_change_log_type_idx").on(t.change_type),
  ],
);

export const product_publishing_schedule = mysqlTable(
  "product_publishing_schedule",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    product_id: varchar("product_id", { length: 255 }).notNull(),
    action: varchar("action", { length: 32 }).notNull(),
    // publish | unpublish
    scheduled_at: timestamp("scheduled_at", { mode: "string" }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    // pending | executed | cancelled | failed
    executed_at: timestamp("executed_at", { mode: "string" }),
    cancelled_by_user_id: varchar("cancelled_by_user_id", { length: 255 }),
    cancel_reason: varchar("cancel_reason", { length: 512 }),
    created_by_user_id: varchar("created_by_user_id", { length: 255 }).notNull(),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("product_publishing_schedule_product_idx").on(t.product_id),
    index("product_publishing_schedule_status_idx").on(t.status, t.scheduled_at),
  ],
);

// ═══════════════════════════════════════════
// PROMOTION WORKFLOWS
// ═══════════════════════════════════════════

export const promotion_reviews = mysqlTable(
  "promotion_reviews",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    promotion_id: varchar("promotion_id", { length: 255 }).notNull(),
    review_type: varchar("review_type", { length: 32 }).notNull(),
    // approval | modification | activation
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    // pending | approved | rejected
    reviewer_user_id: varchar("reviewer_user_id", { length: 255 }),
    review_note: varchar("review_note", { length: 512 }),
    reviewed_at: timestamp("reviewed_at", { mode: "string" }),
    requested_by_user_id: varchar("requested_by_user_id", { length: 255 }).notNull(),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("promotion_reviews_promotion_idx").on(t.promotion_id),
    index("promotion_reviews_status_idx").on(t.status),
  ],
);

// ═══════════════════════════════════════════
// PAYMENT OPERATIONS
// ═══════════════════════════════════════════

export const payment_verifications = mysqlTable(
  "payment_verifications",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 255 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    verification_type: varchar("verification_type", { length: 32 }).notNull().default("manual"),
    // manual | bank_transfer | receipt | other
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    // pending | verified | rejected
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("DZD"),
    reference_number: varchar("reference_number", { length: 128 }),
    proof_url: varchar("proof_url", { length: 2048 }),
    notes: text("notes"),
    verified_by_user_id: varchar("verified_by_user_id", { length: 255 }),
    verified_at: timestamp("verified_at", { mode: "string" }),
    rejection_reason: varchar("rejection_reason", { length: 512 }),
    created_by_user_id: varchar("created_by_user_id", { length: 255 }).notNull(),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("payment_verifications_order_idx").on(t.order_id),
    index("payment_verifications_status_idx").on(t.status),
  ],
);

export const refund_requests = mysqlTable(
  "refund_requests",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 255 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    return_request_id: varchar("return_request_id", { length: 255 }).references(
      () => return_requests.id,
      { onDelete: "set null" },
    ),
    cancellation_request_id: varchar("cancellation_request_id", { length: 255 }),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    // pending | approved | processing | completed | failed | rejected
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("DZD"),
    refund_method: varchar("refund_method", { length: 32 }),
    // original_payment | bank_transfer | store_credit | cash | other
    reason: text("reason").notNull(),
    requested_by_user_id: varchar("requested_by_user_id", { length: 255 }).notNull(),
    approved_by_user_id: varchar("approved_by_user_id", { length: 255 }),
    approved_at: timestamp("approved_at", { mode: "string" }),
    processed_by_user_id: varchar("processed_by_user_id", { length: 255 }),
    processed_at: timestamp("processed_at", { mode: "string" }),
    provider_reference: varchar("provider_reference", { length: 128 }),
    rejection_reason: varchar("rejection_reason", { length: 512 }),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("refund_requests_order_idx").on(t.order_id),
    index("refund_requests_status_idx").on(t.status),
  ],
);

export const partial_payments = mysqlTable(
  "partial_payments",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    order_id: varchar("order_id", { length: 255 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    payment_number: int("payment_number").notNull(),
    type: varchar("type", { length: 16 }).notNull(),
    // deposit | installment | balance
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("DZD"),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    // pending | paid | failed | refunded
    paid_at: timestamp("paid_at", { mode: "string" }),
    payment_method: varchar("payment_method", { length: 32 }),
    payment_reference: varchar("payment_reference", { length: 128 }),
    notes: varchar("notes", { length: 512 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("partial_payments_order_idx").on(t.order_id, t.payment_number),
    index("partial_payments_status_idx").on(t.status),
  ],
);

// ═══════════════════════════════════════════
// ADMIN TASK MANAGEMENT
// ═══════════════════════════════════════════

export const admin_tasks = mysqlTable(
  "admin_tasks",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    task_type: varchar("task_type", { length: 32 }).notNull(),
    // order_follow_up | customer_follow_up | inventory_review | campaign_review | general
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    reference_type: varchar("reference_type", { length: 32 }),
    // order_id | user_id | campaign_id | product_id | sku_id
    reference_id: varchar("reference_id", { length: 255 }),
    assigned_to_user_id: varchar("assigned_to_user_id", { length: 255 }),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    // pending | in_progress | completed | cancelled
    priority: varchar("priority", { length: 16 }).notNull().default("normal"),
    // low | normal | high | urgent
    due_at: timestamp("due_at", { mode: "string" }),
    completed_at: timestamp("completed_at", { mode: "string" }),
    completed_by_user_id: varchar("completed_by_user_id", { length: 255 }),
    completion_notes: text("completion_notes"),
    created_by_user_id: varchar("created_by_user_id", { length: 255 }).notNull(),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("admin_tasks_assigned_idx").on(t.assigned_to_user_id, t.status),
    index("admin_tasks_type_status_idx").on(t.task_type, t.status),
    index("admin_tasks_due_idx").on(t.due_at, t.status),
    index("admin_tasks_reference_idx").on(t.reference_type, t.reference_id),
  ],
);

// ═══════════════════════════════════════════
// NOTIFICATION SYSTEM
// ═══════════════════════════════════════════

export const notifications = mysqlTable(
  "notifications",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    user_id: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 64 }).notNull(),
    // order_created | order_assigned | order_shipped | order_delivered |
    // low_stock | out_of_stock |
    // callback_reminder | support_case_update |
    // promotion_approval | campaign_activation |
    // task_assigned | task_due
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message"),
    reference_type: varchar("reference_type", { length: 32 }),
    reference_id: varchar("reference_id", { length: 255 }),
    is_read: boolean("is_read").notNull().default(false),
    read_at: timestamp("read_at", { mode: "string" }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("notifications_user_unread_idx").on(t.user_id, t.is_read, t.created_at),
    index("notifications_type_idx").on(t.type),
  ],
);
