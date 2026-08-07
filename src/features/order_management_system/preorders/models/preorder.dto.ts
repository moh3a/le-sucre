import { z } from "zod";

const mysql_datetime = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

export const upsert_preorder_settings_dto = z.object({
  sku_id: z.string().min(1).max(255),
  is_preorder_enabled: z.boolean().default(false),
  allow_backorder: z.boolean().default(false),
  max_preorder_qty: z.number().int().min(1).nullable().optional(),
  estimated_available_at: z.string().regex(mysql_datetime).nullable().optional(),
  deposit_percent: z.coerce.number().min(0).max(100).default(100),
  lead_time_days: z.coerce.number().int().min(1).max(365).default(14),
  is_active: z.boolean().default(true),
});

export const list_preorder_allocations_dto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  search: z.string().optional(),
  sku_id: z.string().optional(),
});

export const list_preorder_settings_dto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

export const update_preorder_eta_dto = z.object({
  allocation_id: z.string().min(1).max(255),
  estimated_available_at: z.string().regex(mysql_datetime),
});

export const create_preorder_allocation_dto = z.object({
  sku_id: z.string().min(1).max(255),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
  contact_name: z.string().max(255).optional(),
  contact_email: z.string().email().max(255).optional(),
  contact_phone: z.string().max(50).optional(),
});

export const bulk_upsert_preorder_settings_dto = z.object({
  entries: z.array(upsert_preorder_settings_dto).min(1).max(500),
});
