"use client";

import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString } from "nuqs";
import { useQueryState } from "nuqs";
import { Download, Eye, FileText, ToggleLeft } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { useDataTable } from "@/features/data-table/use-data-table";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { FacetedFilter } from "@/features/data-table/components/data-table-faceted-filter-simple";
import { DateRangeFilter } from "@/features/data-table/components/data-table-date-range-filter";
import { toast } from "sonner";
import { InvoiceStatus, InvoiceType } from "../types";

type InvoiceRow = {
  id: string;
  invoice_number: string;
  type: string;
  status: string;
  grand_total: string;
  currency: string;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
};

const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  paid: "default",
  unpaid: "outline",
  void: "destructive",
  refunded: "secondary",
  partially_refunded: "secondary",
};

export function InvoiceTable() {
  const t = useTranslations("invoices");

  const STATUS_LABEL: Record<string, string> = {
    paid: t("status_paid"),
    unpaid: t("status_unpaid"),
    void: t("status_void"),
    refunded: t("status_refunded"),
    partially_refunded: t("status_partially_refunded"),
  };

  const TYPE_LABEL: Record<string, string> = {
    order_invoice: t("type_order_invoice"),
    refund_invoice: t("type_refund_invoice"),
    credit_note: t("type_credit_note"),
  };
  const [page] = useQueryState("invPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("invPerPage", parseAsInteger.withDefault(10));
  const [status, setStatus] = useQueryState("invStatus", parseAsString);
  const [type, setType] = useQueryState("invType", parseAsString);
  const [from, setFrom] = useQueryState("invFrom", parseAsString);
  const [to, setTo] = useQueryState("invTo", parseAsString);

  const { data, isLoading, error } = trpc.invoices.list_invoices.useQuery({
    page,
    limit: per_page,
    status: (status ?? undefined) as InvoiceStatus | undefined,
    type: (type ?? undefined) as InvoiceType | undefined,
  });

  const handleDownload = async (id: string, invoice_number: string) => {
    try {
      const res = await fetch(`/api/admin/invoices/${id}/download`);
      if (!res.ok) throw new Error(t("download_failed"));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t("download_error"));
    }
  };

  const columns = React.useMemo<ColumnDef<InvoiceRow>[]>(
    () => [
      {
        id: "invoice_number",
        accessorKey: "invoice_number",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("invoice_number_column")} />,
        cell: ({ row }) => (
          <Link
            href={`/console/invoices/${row.original.id}`}
            className="font-mono text-sm font-semibold hover:underline"
          >
            {row.original.invoice_number}
          </Link>
        ),
      },
      {
        id: "type",
        accessorKey: "type",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("type_column")} />,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <FileText className="text-muted-foreground size-3.5" />
            <span className="text-sm">{TYPE_LABEL[row.original.type] ?? row.original.type}</span>
          </div>
        ),
      },
      {
        id: "customer",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("client_column")} />,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.customer_name ?? "—"}</span>
            {row.original.customer_email && (
              <span className="text-muted-foreground text-xs">{row.original.customer_email}</span>
            )}
          </div>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("status_column")} />,
        cell: ({ row }) => (
          <Badge variant={STATUS_BADGE[row.original.status] ?? "outline"}>
            {STATUS_LABEL[row.original.status] ?? row.original.status}
          </Badge>
        ),
      },
      {
        id: "grand_total",
        accessorKey: "grand_total",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("total_column")} />,
        cell: ({ row }) =>
          Number(row.original.grand_total).toLocaleString("fr-FR", {
            style: "currency",
            currency: row.original.currency || "DZD",
            maximumFractionDigits: 0,
          }),
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("date_column")} />,
        cell: ({ row }) => formatDate(row.original.created_at, { month: "short" }),
      },
      {
        id: "actions",
        header: () => null,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/console/invoices/${row.original.id}`}>
                <Eye className="size-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDownload(row.original.id, row.original.invoice_number)}
            >
              <Download className="size-4" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const items = (data?.items ?? []) as InvoiceRow[];
  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: data?.meta.total_pages ?? 0,
    queryKeys: { page: "invPage", perPage: "invPerPage" },
    getRowId: (row) => row.id,
  });

  const statusOptions = [
    { label: t("status_paid"), value: "paid" },
    { label: t("status_unpaid"), value: "unpaid" },
    { label: t("status_void"), value: "void" },
    { label: t("status_refunded"), value: "refunded" },
  ];

  const typeOptions = [
    { label: t("type_order_invoice"), value: "order_invoice" },
    { label: t("type_refund_invoice"), value: "refund_invoice" },
    { label: t("type_credit_note"), value: "credit_note" },
  ];

  return (
    <QueryGuard query={{ isLoading, error }} loadingFallback={<DataTableSkeleton columnCount={7} rowCount={10} />}>
    <DataTable table={table}>
      <DataTableAdvancedToolbar table={table}>
        <FacetedFilter
          title={t("status_title")}
          options={statusOptions}
          icon={ToggleLeft}
          value={status}
          onChange={setStatus}
        />
        <FacetedFilter
          title={t("type_title")}
          options={typeOptions}
          icon={ToggleLeft}
          value={type}
          onChange={setType}
        />
        <DateRangeFilter
          title={t("date_title")}
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
        />
        <DataTableSortList table={table} />
      </DataTableAdvancedToolbar>
    </DataTable>
    </QueryGuard>
  );
}
