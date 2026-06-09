import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { create_trpc_router } from "@/lib/trpc/router";
import {
  admin_procedure,
  storefront_procedure,
} from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { invoice_service } from "../services/invoice.service";
import {
  query_invoices_schema,
  generate_invoice_schema,
  refund_invoice_schema,
  financial_query_schema,
} from "../models/invoice.dto";

export const invoice_router = create_trpc_router({
  // ─── Customer / Storefront Endpoints ───────────────────
  list_my_invoices: storefront_procedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(10),
        status: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user_id = ctx.user.id;
      return await invoice_service.list_my_invoices(user_id, input.page, input.limit, input.status);
    }),

  get_my_invoice: storefront_procedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const user_id = ctx.user.id;
      const invoice = await invoice_service.find_by_id(input.id);
      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Facture introuvable",
        });
      }
      if (invoice.user_id !== user_id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Vous n'avez pas l'autorisation d'accéder à cette facture",
        });
      }
      return invoice;
    }),

  // ─── Admin / Dashboard Endpoints ──────────────────────
  list_invoices: admin_procedure.input(query_invoices_schema).query(async ({ input }) => {
    return await invoice_service.list_invoices_admin(input);
  }),

  get_invoice: admin_procedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      const invoice = await invoice_service.find_by_id(input.id);
      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Facture introuvable",
        });
      }
      return invoice;
    }),

  generate_invoice: admin_procedure.input(generate_invoice_schema).mutation(async ({ input }) => {
    try {
      return await invoice_service.generate_order_invoice(input.order_id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: msg || "Impossible de générer la facture de la commande",
      });
    }
  }),

  generate_refund_invoice: admin_procedure
    .input(refund_invoice_schema)
    .mutation(async ({ input }) => {
      try {
        return await invoice_service.generate_refund_invoice({
          order_id: input.order_id,
          refund_items: input.refund_items,
          notes: input.notes,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: msg || "Impossible de générer la facture de remboursement",
        });
      }
    }),

  generate_credit_note: admin_procedure
    .input(
      z.object({
        order_id: z.string().min(1),
        amount: z.string().min(1),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await invoice_service.generate_credit_note({
          order_id: input.order_id,
          amount: input.amount,
          notes: input.notes,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: msg || "Impossible de générer la note de crédit",
        });
      }
    }),

  void_invoice: admin_procedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      try {
        return await invoice_service.void_invoice(input.id);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: msg || "Impossible d'annuler la facture",
        });
      }
    }),

  mark_as_paid: admin_procedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      try {
        return await invoice_service.mark_as_paid(input.id);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: msg || "Impossible de marquer la facture comme payée",
        });
      }
    }),

  get_summary: admin_procedure.input(financial_query_schema).query(async ({ input }) => {
    return await invoice_service.get_financial_summary(input.start_date, input.end_date);
  }),
});
