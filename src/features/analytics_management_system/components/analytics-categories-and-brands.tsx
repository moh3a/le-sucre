"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { useDataTable } from "@/features/data-table/use-data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format_currency } from "@/lib/format";

type CategoryRow = {
  category_id: string;
  revenue: string;
  views: number;
};

type BrandRow = {
  brand_id: string;
  revenue: string;
  views: number;
};

function CategoryTable({
  data,
  isLoading,
  t,
}: {
  data: CategoryRow[];
  isLoading: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const columns = React.useMemo<ColumnDef<CategoryRow>[]>(
    () => [
      {
        id: "category_id",
        accessorKey: "category_id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("col_category")} />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.category_id || t("no_category")}</span>
        ),
      },
      {
        id: "views",
        accessorKey: "views",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("col_views")} />
        ),
        cell: ({ row }) => row.original.views.toLocaleString("fr-FR"),
      },
      {
        id: "revenue",
        accessorKey: "revenue",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("col_revenue")} />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary">
            {format_currency(Number(row.original.revenue), "DZD", 0)}
          </Badge>
        ),
      },
    ],
    [t],
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount: 1,
    queryKeys: { page: "catPage", perPage: "catPerPage", sort: "catSort" },
    getRowId: (row) => row.category_id,
  });

  return (
    <QueryGuard
      query={{ isLoading }}
      loadingFallback={<DataTableSkeleton columnCount={3} rowCount={5} />}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t("top_categories")}</CardTitle>
          <CardDescription>{t("top_categories_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable table={table} />
        </CardContent>
      </Card>
    </QueryGuard>
  );
}

function BrandTable({
  data,
  isLoading,
  t,
}: {
  data: BrandRow[];
  isLoading: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const columns = React.useMemo<ColumnDef<BrandRow>[]>(
    () => [
      {
        id: "brand_id",
        accessorKey: "brand_id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("col_brand")} />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.brand_id || t("no_brand")}</span>
        ),
      },
      {
        id: "views",
        accessorKey: "views",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("col_views")} />
        ),
        cell: ({ row }) => row.original.views.toLocaleString("fr-FR"),
      },
      {
        id: "revenue",
        accessorKey: "revenue",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("col_revenue")} />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary">
            {format_currency(Number(row.original.revenue), "DZD", 0)}
          </Badge>
        ),
      },
    ],
    [t],
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount: 1,
    queryKeys: { page: "brPage", perPage: "brPerPage", sort: "brSort" },
    getRowId: (row) => row.brand_id,
  });

  return (
    <QueryGuard
      query={{ isLoading }}
      loadingFallback={<DataTableSkeleton columnCount={3} rowCount={5} />}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t("top_brands")}</CardTitle>
          <CardDescription>{t("top_brands_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable table={table} />
        </CardContent>
      </Card>
    </QueryGuard>
  );
}

export function AnalyticsCategoriesBrands({ from, to }: { from: string; to: string }) {
  const t = useTranslations("analytics");
  const { data, isLoading } = trpc.analytics.products.useQuery({ from, to, limit: 50, sort: "revenue" });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <CategoryTable data={data?.categories ?? []} isLoading={isLoading} t={t} />
      <BrandTable data={data?.brands ?? []} isLoading={isLoading} t={t} />
    </div>
  );
}
