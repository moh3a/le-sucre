import "server-only";

import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";

import { InvoicePdfTemplate } from "../components/pdf/invoice_pdf_template";
import type { Invoice, InvoiceItem } from "../types";

export interface InvoicePdfGenerationInput extends Omit<
  Invoice,
  "billing_address" | "shipping_address"
> {
  order_number?: string;
  billing_address: Record<string, unknown>;
  shipping_address: Record<string, unknown>;
  items: InvoiceItem[];
}

export class PdfGenerationService {
  /**
   * Generates a PDF buffer from an invoice object.
   */
  async generate_invoice_pdf(invoice_data: InvoicePdfGenerationInput): Promise<Buffer> {
    // Generate React PDF template element
    const element = React.createElement(InvoicePdfTemplate, {
      invoice: {
        invoice_number: invoice_data.invoice_number,
        order_id: invoice_data.order_id,
        order_number: invoice_data.order_number || invoice_data.order_id,
        status: invoice_data.status,
        type: invoice_data.type,
        currency: invoice_data.currency,
        subtotal: String(invoice_data.subtotal),
        discount_total: String(invoice_data.discount_total),
        tax_total: String(invoice_data.tax_total),
        shipping_total: String(invoice_data.shipping_total),
        grand_total: String(invoice_data.grand_total),
        billing_address: invoice_data.billing_address,
        shipping_address: invoice_data.shipping_address,
        vat_number: invoice_data.vat_number,
        created_at: invoice_data.created_at,
        due_at: invoice_data.due_at,
        paid_at: invoice_data.paid_at,
        items: invoice_data.items.map((item) => ({
          id: item.id,
          sku_code: item.sku_code,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: String(item.unit_price),
          tax_rate: String(item.tax_rate),
          tax_amount: String(item.tax_amount),
          line_total: String(item.line_total),
        })),
      },
    });

    // Compile into PDF Buffer
    return await renderToBuffer(
      element as unknown as React.ReactElement<import("@react-pdf/renderer").DocumentProps>,
    );
  }
}

export const pdf_generation_service = new PdfGenerationService();
