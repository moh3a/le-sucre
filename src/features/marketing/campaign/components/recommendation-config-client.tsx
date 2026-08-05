"use client";

import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { parseAsString, useQueryState } from "nuqs";
import { BarChart3, Layers, PackageSearch, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { useDataTable } from "@/features/data-table/use-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";

const STRATEGY_IDS = [
  "trending",
  "bestselling",
  "new_arrivals",
  "top_rated",
  "category_based",
  "brand_based",
  "personalized",
  "frequently_bought",
] as const;

type StrategyRow = {
  id: string;
  label: string;
  description: string;
  sections: number;
};

export function RecommendationConfigClient() {
  const t = useTranslations("campaigns");

  const [search, setSearch] = useQueryState("recSearch", parseAsString);

  const { data, isLoading } = trpc.campaigns.recommendationStats.useQuery();

  const rows = React.useMemo<StrategyRow[]>(() => {
    const q = (search ?? "").trim().toLowerCase();
    return STRATEGY_IDS.filter((id) => {
      if (!q) return true;
      const haystack = `${id} ${t(`strategy_${id}` as never)} ${t(`strategy_${id}_desc` as never)}`.toLowerCase();
      return haystack.includes(q);
    }).map((id) => ({
      id,
      label: t(`strategy_${id}` as never),
      description: t(`strategy_${id}_desc` as never),
      sections: data?.usage?.[id] ?? 0,
    }));
  }, [search, data, t]);

  const columns = React.useMemo<ColumnDef<StrategyRow>[]>(
    () => [
      {
        id: "strategy",
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("recommendation_strategy_column")} />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium">{row.original.id}</span>
        ),
      },
      {
        id: "type",
        accessorKey: "label",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("recommendation_type_column")} />
        ),
        cell: ({ row }) => <span className="font-medium">{row.original.label}</span>,
      },
      {
        id: "description",
        accessorKey: "description",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("recommendation_description_column")} />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">{row.original.description}</span>
        ),
      },
      {
        id: "sections",
        accessorKey: "sections",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("recommendation_sections_column")} />
        ),
        cell: ({ row }) => <Badge variant="secondary">{row.original.sections}</Badge>,
      },
    ],
    [t],
  );

  const { table } = useDataTable({
    data: rows,
    columns: columns as ColumnDef<(typeof rows)[number]>[],
    pageCount: Math.max(1, Math.ceil(rows.length / 10)),
    queryKeys: { page: "recPage", perPage: "recPerPage", sort: "recSort" },
    getRowId: (row) => row.id,
  });

  return (
    <QueryGuard
      query={{ isLoading }}
      loadingFallback={<DataTableSkeleton columnCount={4} rowCount={8} filterCount={1} />}
    >
      <ConsolePageShell
        title={t("recommendation_strategies")}
        subtitle={t("recommendation_strategies_subtitle")}
        actions={
          <Button asChild>
            <Link href="/console/campaigns/new">
              <Plus className="mr-2 size-4" />
              {t("recommendation_create")}
            </Link>
          </Button>
        }
        stats={
          <StatsGrid
            loading={isLoading}
            items={[
              {
                label: t("recommendation_total"),
                value: data?.total ?? 0,
                icon: Layers,
                color: "info",
              },
              {
                label: t("recommendation_sections"),
                value: data?.configured_sections ?? 0,
                icon: PackageSearch,
                color: "success",
              },
              {
                label: t("recommendation_campaigns"),
                value: data?.campaigns_using ?? 0,
                icon: BarChart3,
                color: "warning",
              },
              {
                label: t("recommendation_in_use"),
                value: data?.strategies_in_use ?? 0,
                icon: Sparkles,
                color: "default",
              },
            ]}
          />
        }
      >
        <DataTable table={table}>
          <DataTableAdvancedToolbar table={table}>
            <Input
              placeholder={t("search_placeholder")}
              value={search || ""}
              onChange={(e) => setSearch(e.target.value || null)}
              className="max-w-sm"
            />
          </DataTableAdvancedToolbar>
        </DataTable>
        <p className="text-muted-foreground max-w-3xl text-sm">{t("recommendation_note")}</p>
      </ConsolePageShell>
    </QueryGuard>
  );
}
