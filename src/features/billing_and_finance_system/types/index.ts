import { invoices, invoice_items } from "../db/schema";

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;

export type InvoiceItem = typeof invoice_items.$inferSelect;
export type NewInvoiceItem = typeof invoice_items.$inferInsert;

export type InvoiceStatus = "unpaid" | "paid" | "void" | "refunded" | "partially_refunded";
export type InvoiceType = "order_invoice" | "refund_invoice" | "credit_note";

export interface FinancialSummary {
  revenue_total: number;
  tax_total: number;
  credits_total: number;
  invoice_count: number;
  refund_count: number;
}
