"use client";

import { Banknote, CheckCircle2, Clock, FileX, ReceiptCent, RefreshCcw } from "lucide-react";
import { format, startOfMonth } from "date-fns";

import { StatsGrid } from "@/components/console/stats-grid";
import { trpc } from "@/components/providers/app-providers";

export function InvoiceStats() {
  const today = new Date();
  const start = format(startOfMonth(today), "yyyy-MM-dd");
  const end = format(today, "yyyy-MM-dd");

  const { data, isFetching, isLoading } = trpc.invoices.get_summary.useQuery({
    start_date: start,
    end_date: end,
  });

  return (
    <StatsGrid
      loading={isFetching || isLoading}
      items={[
        {
          label: "Chiffre d'affaires (mois)",
          value: Number(data?.total_revenue ?? 0).toLocaleString("fr-FR", {
            style: "currency",
            currency: "DZD",
            maximumFractionDigits: 0,
          }),
          icon: Banknote,
          color: "info",
        },
        {
          label: "Factures totales",
          value: data?.total_invoices ?? 0,
          icon: ReceiptCent,
          color: "default",
        },
        {
          label: "Factures payées",
          value: data?.paid_invoices ?? 0,
          icon: CheckCircle2,
          color: "success",
        },
        {
          label: "Factures impayées",
          value: data?.unpaid_invoices ?? 0,
          icon: Clock,
          color: "warning",
        },
        {
          label: "Remboursements",
          value: Number(data?.total_refunded ?? 0).toLocaleString("fr-FR", {
            style: "currency",
            currency: "DZD",
            maximumFractionDigits: 0,
          }),
          icon: RefreshCcw,
          color: "error",
        },
        {
          label: "Factures annulées",
          value: data?.voided_invoices ?? 0,
          icon: FileX,
          color: "error",
        },
      ]}
    />
  );
}
