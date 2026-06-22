"use client";

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

const STATUS_LABEL: Record<string, string> = {
  paid: "Payée",
  unpaid: "Impayée",
  void: "Annulée",
  refunded: "Remboursée",
  partially_refunded: "Partiellement remboursée",
};

const TYPE_LABEL: Record<string, string> = {
  order_invoice: "Facture",
  refund_invoice: "Remboursement",
  credit_note: "Note de crédit",
};

export function InvoiceTable() {
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
    from: from ?? undefined,
    to: to ?? undefined,
  });

  const handleDownload = async (id: string, invoice_number: string) => {
    try {
      const res = await fetch(`/api/admin/invoices/${id}/download`);
      if (!res.ok) throw new Error("Téléchargement échoué");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Impossible de télécharger la facture");
    }
  };

  const columns = React.useMemo<ColumnDef<InvoiceRow>[]>(
    () => [
      {
        id: "invoice_number",
        accessorKey: "invoice_number",
        header: ({ column }) => <DataTableColumnHeader column={column} label="N° Facture" />,
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
        header: ({ column }) => <DataTableColumnHeader column={column} label="Type" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <FileText className="text-muted-foreground size-3.5" />
            <span className="text-sm">{TYPE_LABEL[row.original.type] ?? row.original.type}</span>
          </div>
        ),
      },
      {
        id: "customer",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Client" />,
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
        header: ({ column }) => <DataTableColumnHeader column={column} label="Statut" />,
        cell: ({ row }) => (
          <Badge variant={STATUS_BADGE[row.original.status] ?? "outline"}>
            {STATUS_LABEL[row.original.status] ?? row.original.status}
          </Badge>
        ),
      },
      {
        id: "grand_total",
        accessorKey: "grand_total",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Total" />,
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
        header: ({ column }) => <DataTableColumnHeader column={column} label="Date" />,
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
    { label: "Payée", value: "paid" },
    { label: "Impayée", value: "unpaid" },
    { label: "Annulée", value: "void" },
    { label: "Remboursée", value: "refunded" },
  ];

  const typeOptions = [
    { label: "Facture", value: "order_invoice" },
    { label: "Remboursement", value: "refund_invoice" },
    { label: "Note de crédit", value: "credit_note" },
  ];

  return (
    <QueryGuard query={{ isLoading, error }} loadingFallback={<DataTableSkeleton columnCount={7} rowCount={10} />}>
    <DataTable table={table}>
      <DataTableAdvancedToolbar table={table}>
        <FacetedFilter
          title="Statut"
          options={statusOptions}
          icon={ToggleLeft}
          value={status}
          onChange={setStatus}
        />
        <FacetedFilter
          title="Type"
          options={typeOptions}
          icon={ToggleLeft}
          value={type}
          onChange={setType}
        />
        <DateRangeFilter
          title="Date"
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
