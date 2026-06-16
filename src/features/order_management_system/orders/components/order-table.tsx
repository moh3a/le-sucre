"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { ReceiptCent, ToggleLeft } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { useDataTable } from "@/features/data-table/use-data-table";
import { trpc } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { FacetedFilter } from "@/features/data-table/components/data-table-faceted-filter-simple";
import { DateRangeFilter } from "@/features/data-table/components/data-table-date-range-filter";

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  grand_total: string;
  guest_phone: string | null;
  created_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  operator_name: string | null;
  delivery_name: string | null;
};

const ORDER_LABELS: Record<string, string> = {
  pending_payment: "En attente de paiement",
  confirmed: "Confirmée",
  paid: "Payée",
  processing: "En cours",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  refunded: "Remboursée",
};

const PAYMENT_LABELS: Record<string, string> = {
  pending: "En attente",
  authorized: "Autorisé",
  paid: "Payé",
  failed: "Échoué",
  refunded: "Remboursé",
};

const FULFILLMENT_LABELS: Record<string, string> = {
  unfulfilled: "Non expédié",
  partial: "Partiel",
  fulfilled: "Expédié",
  returned: "Retourné",
};

const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending_payment: "outline",
  confirmed: "secondary",
  paid: "default",
  processing: "secondary",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
  refunded: "destructive",
};

const PAYMENT_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  authorized: "secondary",
  paid: "default",
  failed: "destructive",
  refunded: "destructive",
};

const FULFILLMENT_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  unfulfilled: "outline",
  partial: "secondary",
  fulfilled: "default",
  returned: "destructive",
};

export function OrderTable({ compact = false }: { compact?: boolean }) {
  const columns = React.useMemo<ColumnDef<OrderRow>[]>(
    () => [
      {
        id: "order_number",
        accessorKey: "order_number",
        header: ({ column }) => <DataTableColumnHeader column={column} label="N° commande" />,
        cell: ({ row }) => (
          <Link
            href={`/console/orders/${row.original.id}`}
            className="font-mono text-sm font-medium hover:underline"
          >
            {row.original.order_number}
          </Link>
        ),
      },
      {
        id: "customer",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Client" />,
        cell: ({ row }) => {
          const name = row.original.customer_name;
          const phone = row.original.customer_phone ?? row.original.guest_phone;
          return (
            <div className="flex flex-col">
              <span className="font-medium">{name ?? "—"}</span>
              {phone && <span className="text-muted-foreground text-xs">{phone}</span>}
            </div>
          );
        },
      },
      {
        id: "customer_phone",
        accessorKey: "customer_phone",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Téléphone" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.customer_phone ?? "—"}
          </span>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Statut" />,
        cell: ({ row }) => (
          <Badge variant={STATUS_BADGE[row.original.status] ?? "secondary"}>
            {ORDER_LABELS[row.original.status] ?? row.original.status}
          </Badge>
        ),
      },
      {
        id: "fulfillment_status",
        accessorKey: "fulfillment_status",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Expédition" />,
        cell: ({ row }) => (
          <Badge variant={FULFILLMENT_BADGE[row.original.fulfillment_status] ?? "outline"}>
            {FULFILLMENT_LABELS[row.original.fulfillment_status] ?? row.original.fulfillment_status}
          </Badge>
        ),
      },
      {
        id: "payment_status",
        accessorKey: "payment_status",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Paiement" />,
        cell: ({ row }) => (
          <Badge variant={PAYMENT_BADGE[row.original.payment_status] ?? "outline"}>
            {PAYMENT_LABELS[row.original.payment_status] ?? row.original.payment_status}
          </Badge>
        ),
      },
      {
        id: "operator_name",
        accessorKey: "operator_name",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Opérateur" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">{row.original.operator_name ?? "—"}</span>
        ),
      },
      {
        id: "delivery_name",
        accessorKey: "delivery_name",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Livreur" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">{row.original.delivery_name ?? "—"}</span>
        ),
      },
      {
        id: "grand_total",
        accessorKey: "grand_total",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Total" />,
        cell: ({ row }) =>
          Number(row.original.grand_total).toLocaleString("fr-FR", {
            style: "currency",
            currency: "DZD",
            maximumFractionDigits: 0,
          }),
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Date" />,
        cell: ({ row }) => formatDate(row.original.created_at, { month: "short" }),
        meta: { label: "Date", icon: ReceiptCent },
      },
    ],
    [],
  );

  const [page] = useQueryState("ordPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("ordPerPage", parseAsInteger.withDefault(compact ? 5 : 10));
  const [status_filter, setStatusFilter] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString, ","),
  );
  const [payment_status, setPaymentStatus] = useQueryState("payment_status", parseAsString);
  const [fulfillment_status, setFulfillmentStatus] = useQueryState(
    "fulfillment_status",
    parseAsString,
  );
  const [from, setFrom] = useQueryState("from", parseAsString);
  const [to, setTo] = useQueryState("to", parseAsString);

  const status = status_filter?.[0];

  const { data, isLoading } = trpc.orders.adminListEnriched.useQuery({
    page,
    limit: per_page,
    status,
    payment_status: payment_status ?? undefined,
    fulfillment_status: fulfillment_status ?? undefined,
    from: from ?? undefined,
    to: to ?? undefined,
  });

  const items = (data?.items ?? []) as OrderRow[];
  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: data?.meta.total_pages ?? 0,
    queryKeys: { page: "ordPage", perPage: "ordPerPage" },
    getRowId: (row) => row.id,
  });

  const statusOptions = [
    { label: "En attente de paiement", value: "pending_payment" },
    { label: "Payé", value: "paid" },
    { label: "En cours", value: "processing" },
    { label: "Livré", value: "fulfilled" },
    { label: "Annulé", value: "cancelled" },
  ];
  const paymentOptions = [
    { label: "Non payé", value: "unpaid" },
    { label: "Payé", value: "paid" },
    { label: "Remboursé", value: "refunded" },
  ];
  const fulfillmentOptions = [
    { label: "Non expédié", value: "unfulfilled" },
    { label: "Partiel", value: "partial" },
    { label: "Expédié", value: "fulfilled" },
  ];

  if (isLoading && !data) return <DataTableSkeleton columnCount={8} rowCount={compact ? 5 : 10} />;

  return (
    <DataTable table={table}>
      {!compact ? (
        <DataTableAdvancedToolbar table={table}>
          <FacetedFilter
            title="Statut"
            options={statusOptions}
            icon={ToggleLeft}
            value={status}
            onChange={(newStatus) => setStatusFilter(newStatus ? [newStatus] : null)}
          />
          <FacetedFilter
            title="Paiement"
            options={paymentOptions}
            icon={ToggleLeft}
            value={payment_status}
            onChange={setPaymentStatus}
          />
          <FacetedFilter
            title="Expédition"
            options={fulfillmentOptions}
            icon={ToggleLeft}
            value={fulfillment_status}
            onChange={setFulfillmentStatus}
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
      ) : null}
    </DataTable>
  );
}
