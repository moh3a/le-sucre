import { z } from "zod";

export const invoice_status_schema = z.enum([
  "unpaid",
  "paid",
  "void",
  "refunded",
  "partially_refunded",
]);

export const invoice_type_schema = z.enum(["order_invoice", "refund_invoice", "credit_note"]);

export const query_invoices_schema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  status: invoice_status_schema.optional(),
  type: invoice_type_schema.optional(),
  order_id: z.string().optional(),
  search: z.string().optional(),
});

export const update_invoice_status_schema = z.object({
  id: z.string().min(1),
  status: invoice_status_schema,
});

export const generate_invoice_schema = z.object({
  order_id: z.string().min(1),
});

export const refund_invoice_schema = z.object({
  order_id: z.string().min(1),
  refund_items: z.array(
    z.object({
      sku_id: z.string().min(1),
      quantity: z.number().int().positive(),
      amount: z.string().min(1), // decimal in string form
    }),
  ),
  notes: z.string().optional(),
});

export const financial_query_schema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});
