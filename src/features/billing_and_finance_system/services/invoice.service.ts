import "server-only";
import { generate_id } from "@/lib/utils";
import { invoice_repository } from "../repositories/invoice.repository";
import { tax_calculation_service } from "./tax_calculation.service";
import { pdf_generation_service } from "./pdf_generation.service";
import { email_service } from "./email.service";
import { generate_sequential_number } from "../helpers/number_generator";
import { order_repository } from "@/features/order_management_system/orders/repositories/order.repository";
import { NotFoundError, ValidationError } from "@/lib/error_handling";

export class InvoiceService {
  constructor(
    private readonly repo = invoice_repository,
    private readonly order_repo = order_repository,
  ) {}

  /**
   * Generates a standard invoice from an existing order.
   */
  async generate_order_invoice(order_id: string) {
    const full_order = await this.order_repo.get_full(order_id);
    if (!full_order) {
      throw new NotFoundError("Commande introuvable");
    }

    const { order, items } = full_order;

    // Check if invoice already exists
    const existing = await this.repo.find_by_order_id(order_id);
    const existing_invoice = existing.find((inv) => inv.type === "order_invoice");
    if (existing_invoice) {
      return this.repo.find_by_id(existing_invoice.id);
    }

    const invoice_number = await generate_sequential_number("INV");

    // Perform tax and subtotal calculations
    const totals = tax_calculation_service.calculate_invoice_totals({
      items: items.map((i) => ({
        unit_price: i.unit_price,
        quantity: i.quantity,
        tax_rate: 0.19, // Algerian VAT default is 19%
      })),
      discount_total: order.discount_total,
      shipping_total: order.shipping_total,
    });

    const is_paid = order.payment_status === "paid";
    const now_str = new Date().toISOString().slice(0, 19).replace("T", " ");

    const new_invoice = {
      id: generate_id(),
      invoice_number,
      order_id: order.id,
      user_id: order.user_id,
      status: is_paid ? "paid" : "unpaid",
      type: "order_invoice",
      currency: order.currency,
      subtotal: totals.subtotal,
      discount_total: totals.discount_total,
      tax_total: totals.tax_total,
      shipping_total: totals.shipping_total,
      grand_total: totals.grand_total,
      billing_address: (order.billing_address || order.shipping_address) as Record<string, unknown>,
      shipping_address: order.shipping_address as Record<string, unknown>,
      vat_number: (order.metadata?.vat_number as string) || null,
      due_at: is_paid ? null : now_str,
      paid_at: is_paid ? now_str : null,
      metadata: {},
    };

    const new_items = items.map((i, index) => {
      const calc_item = totals.items[index];
      return {
        id: generate_id(),
        invoice_id: new_invoice.id,
        sku_id: i.sku_id,
        sku_code: i.sku_code,
        product_name: i.product_name,
        quantity: i.quantity,
        unit_price: calc_item.unit_price,
        tax_rate: calc_item.tax_rate,
        tax_amount: calc_item.tax_amount,
        line_total: calc_item.line_total,
      };
    });

    const invoice_id = await this.repo.create_invoice(new_invoice, new_items);
    const invoice = await this.repo.find_by_id(invoice_id);

    if (!invoice) {
      throw new Error("Erreur lors de la création de la facture");
    }

    // Generate PDF and deliver via email background worker trigger
    try {
      const pdf_buffer = await pdf_generation_service.generate_invoice_pdf({
        ...invoice,
        order_number: order.order_number,
      });

      const recipient_email = order.guest_email || "billing@lesucre.dz";
      await email_service.send_invoice_email({
        to_email: recipient_email,
        customer_name: (new_invoice.billing_address?.full_name as string) || "Client",
        invoice_number: invoice.invoice_number,
        amount: invoice.grand_total,
        currency: invoice.currency,
        pdf_buffer,
      });
    } catch (err) {
      // Don't fail the transaction if PDF generation/delivery fails, let background jobs retry it
      console.error("PDF generation or email delivery failed:", err);
    }

    return invoice;
  }

  /**
   * Generates a refund invoice document when products are refunded.
   */
  async generate_refund_invoice(params: {
    order_id: string;
    refund_items: Array<{
      sku_id: string;
      quantity: number;
      amount: string;
    }>;
    notes?: string;
  }) {
    const { order_id, refund_items, notes } = params;
    const full_order = await this.order_repo.get_full(order_id);
    if (!full_order) {
      throw new NotFoundError("Commande introuvable");
    }

    const { order, items } = full_order;
    const invoice_number = await generate_sequential_number("REF");

    // Map refunded items back to order item metadata to fetch name & code
    const list_items = refund_items.map((ri) => {
      const match = items.find((oi) => oi.sku_id === ri.sku_id);
      if (!match) {
        throw new ValidationError(
          `L'article SKU ${ri.sku_id} ne fait pas partie de cette commande`,
        );
      }
      return {
        unit_price: ri.amount,
        quantity: ri.quantity,
        sku_id: ri.sku_id,
        sku_code: match.sku_code,
        product_name: match.product_name,
        tax_rate: 0.19,
      };
    });

    const totals = tax_calculation_service.calculate_invoice_totals({
      items: list_items,
      discount_total: "0.00",
      shipping_total: "0.00",
    });

    const now_str = new Date().toISOString().slice(0, 19).replace("T", " ");

    const new_invoice = {
      id: generate_id(),
      invoice_number,
      order_id: order.id,
      user_id: order.user_id,
      status: "paid", // Refund invoices are settled immediately
      type: "refund_invoice",
      currency: order.currency,
      subtotal: totals.subtotal,
      discount_total: "0.00",
      tax_total: totals.tax_total,
      shipping_total: "0.00",
      grand_total: totals.grand_total,
      billing_address: (order.billing_address || order.shipping_address) as Record<string, unknown>,
      shipping_address: order.shipping_address as Record<string, unknown>,
      vat_number: (order.metadata?.vat_number as string) || null,
      due_at: null,
      paid_at: now_str,
      metadata: { notes: notes ?? "" },
    };

    const new_items = list_items.map((i, index) => {
      const calc_item = totals.items[index];
      return {
        id: generate_id(),
        invoice_id: new_invoice.id,
        sku_id: i.sku_id,
        sku_code: i.sku_code,
        product_name: i.product_name,
        quantity: i.quantity,
        unit_price: calc_item.unit_price,
        tax_rate: calc_item.tax_rate,
        tax_amount: calc_item.tax_amount,
        line_total: calc_item.line_total,
      };
    });

    const invoice_id = await this.repo.create_invoice(new_invoice, new_items);
    return this.repo.find_by_id(invoice_id);
  }

  /**
   * Generates a credit note which can be applied for store credits.
   */
  async generate_credit_note(params: { order_id: string; amount: string; notes?: string }) {
    const { order_id, amount, notes } = params;
    const full_order = await this.order_repo.get_full(order_id);
    if (!full_order) {
      throw new NotFoundError("Commande introuvable");
    }

    const { order } = full_order;
    const invoice_number = await generate_sequential_number("CN");
    const now_str = new Date().toISOString().slice(0, 19).replace("T", " ");

    const totals = tax_calculation_service.calculate_invoice_totals({
      items: [
        {
          unit_price: amount,
          quantity: 1,
          tax_rate: 0.0, // Credit notes might have flat amounts with no VAT depending on compliance rules
        },
      ],
    });

    const new_invoice = {
      id: generate_id(),
      invoice_number,
      order_id: order.id,
      user_id: order.user_id,
      status: "paid",
      type: "credit_note",
      currency: order.currency,
      subtotal: totals.subtotal,
      discount_total: "0.00",
      tax_total: "0.00",
      shipping_total: "0.00",
      grand_total: totals.grand_total,
      billing_address: (order.billing_address || order.shipping_address) as Record<string, unknown>,
      shipping_address: order.shipping_address as Record<string, unknown>,
      vat_number: (order.metadata?.vat_number as string) || null,
      due_at: null,
      paid_at: now_str,
      metadata: { notes: notes ?? "" },
    };

    const new_items = [
      {
        id: generate_id(),
        invoice_id: new_invoice.id,
        sku_id: "store_credit",
        sku_code: "CREDIT-NOTE",
        product_name: `Avoir commercial - Commande ${order.order_number}`,
        quantity: 1,
        unit_price: totals.subtotal,
        tax_rate: "0.00",
        tax_amount: "0.00",
        line_total: totals.grand_total,
      },
    ];

    const invoice_id = await this.repo.create_invoice(new_invoice, new_items);
    return this.repo.find_by_id(invoice_id);
  }

  async mark_as_paid(invoice_id: string) {
    const invoice = await this.repo.find_by_id(invoice_id);
    if (!invoice) {
      throw new NotFoundError("Facture introuvable");
    }
    const now_str = new Date().toISOString().slice(0, 19).replace("T", " ");
    await this.repo.update_status(invoice_id, "paid", now_str);
    return this.repo.find_by_id(invoice_id);
  }

  async void_invoice(invoice_id: string) {
    const invoice = await this.repo.find_by_id(invoice_id);
    if (!invoice) {
      throw new NotFoundError("Facture introuvable");
    }
    await this.repo.update_status(invoice_id, "void");
    return this.repo.find_by_id(invoice_id);
  }

  async get_financial_summary(start_date?: string, end_date?: string) {
    return await this.repo.get_financial_summary(start_date, end_date);
  }

  async find_by_id(id: string) {
    return await this.repo.find_by_id(id);
  }

  async list_my_invoices(user_id: string, page: number, limit: number, status?: string) {
    return await this.repo.list_customer_invoices(user_id, page, limit, status);
  }

  async list_invoices_admin(params: {
    page: number;
    limit: number;
    status?: string;
    type?: string;
    order_id?: string;
    search?: string;
  }) {
    return await this.repo.list_admin_invoices(params);
  }
}

export const invoice_service = new InvoiceService();
