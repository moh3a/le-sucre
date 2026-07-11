"use client";

import Link from "next/link";

import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { trpc } from "@/components/providers/app-providers";
import { DataTable } from "@/features/data-table/components/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { useDataTable } from "@/features/data-table/use-data-table";
import { QueryGuard } from "@/components/query-guard";
import { formatDate } from "@/lib/format";

type ProductOrderRow = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  grand_total: string;
  customer_name: string | null;
  created_at: string;
};

function get_columns(t: ReturnType<typeof useTranslations>): ColumnDef<ProductOrderRow>[] {
  return [
    {
      id: "order_number",
      accessorKey: "order_number",
      header: ({ column }) => <DataTableColumnHeader column={column} label={t("orders_column_order")} />,
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
      header: ({ column }) => <DataTableColumnHeader column={column} label={t("orders_column_client")} />,
      cell: ({ row }) => row.original.customer_name ?? "—",
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} label={t("orders_column_status")} />,
      cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
    },
    {
      id: "grand_total",
      accessorKey: "grand_total",
      header: ({ column }) => <DataTableColumnHeader column={column} label={t("orders_column_total")} />,
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
      header: ({ column }) => <DataTableColumnHeader column={column} label={t("orders_column_date")} />,
      cell: ({ row }) => formatDate(row.original.created_at, { month: "short" }),
    },
  ];
}

export function ProductOrdersPanel({ product_id }: { product_id: string }) {
  const t = useTranslations("products");
  const query = trpc.orders.adminListByProduct.useQuery({
    product_id,
    page: 1,
    limit: 10,
  });
  const { data } = query;

  const items = (data?.items ?? []) as ProductOrderRow[];
  const columns = get_columns(t);
  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: data?.meta.total_pages ?? 1,
    queryKeys: { page: "poPage", perPage: "poPerPage" },
    getRowId: (row) => row.id,
  });

  return (
    <QueryGuard query={query} loadingFallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
      <Card>
        <CardHeader>
          <CardTitle>{t("orders_title")}</CardTitle>
          <CardDescription>
            {t("orders_description", { count: data?.meta.total_records ?? 0 })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable table={table} />
        </CardContent>
      </Card>
    </QueryGuard>
  );
}
