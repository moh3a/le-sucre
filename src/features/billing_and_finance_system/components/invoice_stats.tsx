"use client";

import { Banknote, CheckCircle2, Clock, FileX, ReceiptCent, RefreshCcw } from "lucide-react";
import { format, startOfMonth } from "date-fns";

import { StatsGrid } from "@/components/console/stats-grid";
import { trpc } from "@/components/providers/app-providers";

type StatusAggregate = {
  status: string;
  count: number;
  total_amount: number;
};

function count_for_status(rows: StatusAggregate[] | undefined, status: string) {
  return rows?.find((row) => row.status === status)?.count ?? 0;
}

function amount_for_status(rows: StatusAggregate[] | undefined, status: string) {
  return rows?.find((row) => row.status === status)?.total_amount ?? 0;
}

export function InvoiceStats() {
  const today = new Date();
  const start = format(startOfMonth(today), "yyyy-MM-dd");
  const end = format(today, "yyyy-MM-dd");

  const { data, isFetching, isLoading } = trpc.invoices.get_summary.useQuery({
    start_date: start,
    end_date: end,
  });

  const status_rows = data?.status_aggregates;
  const total_invoices = status_rows?.reduce((sum, row) => sum + row.count, 0) ?? 0;
  const paid_revenue = amount_for_status(status_rows, "paid");
  const refunded_amount =
    amount_for_status(status_rows, "refunded") +
    amount_for_status(status_rows, "partially_refunded");

  return (
    <StatsGrid
      loading={isFetching || isLoading}
      items={[
        {
          label: "Chiffre d'affaires (mois)",
          value: paid_revenue.toLocaleString("fr-FR", {
            style: "currency",
            currency: "DZD",
            maximumFractionDigits: 0,
          }),
          icon: Banknote,
          color: "info",
        },
        {
          label: "Factures totales",
          value: total_invoices,
          icon: ReceiptCent,
          color: "default",
        },
        {
          label: "Factures payées",
          value: count_for_status(status_rows, "paid"),
          icon: CheckCircle2,
          color: "success",
        },
        {
          label: "Factures impayées",
          value: count_for_status(status_rows, "unpaid"),
          icon: Clock,
          color: "warning",
        },
        {
          label: "Remboursements",
          value: refunded_amount.toLocaleString("fr-FR", {
            style: "currency",
            currency: "DZD",
            maximumFractionDigits: 0,
          }),
          icon: RefreshCcw,
          color: "error",
        },
        {
          label: "Factures annulées",
          value: count_for_status(status_rows, "void"),
          icon: FileX,
          color: "error",
        },
      ]}
    />
  );
}
