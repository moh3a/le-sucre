"use client";

import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import {
  BarChart3,
  Calendar,
  Download,
  Eye,
  Layers,
  Megaphone,
  MoreHorizontal,
  Pencil,
  Play,
  Square,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { useDataTable } from "@/features/data-table/use-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { XCircle } from "lucide-react";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { QueryGuard } from "@/components/query-guard";
import { CampaignStatusBadge } from "./campaign_status_badge";
import { formatDate } from "@/lib/format";
import { trpc } from "@/components/providers/app-providers";

type CampaignRow = {
  id: string;
  name: string;
  slug: string;
  campaign_type: string;
  status: string;
  priority: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

interface Option {
  label: string;
  value: string;
}

const STATUS_OPTIONS: Option[] = [
  { value: "draft", label: "Brouillon" },
  { value: "scheduled", label: "Planifiée" },
  { value: "active", label: "Active" },
  { value: "paused", label: "En pause" },
  { value: "ended", label: "Terminée" },
  { value: "cancelled", label: "Annulée" },
];

const TYPE_OPTIONS: Option[] = [
  { value: "homepage", label: "Page d'accueil" },
  { value: "seasonal", label: "Saisonnière" },
  { value: "flash_sale", label: "Vente flash" },
  { value: "targeted", label: "Ciblée" },
  { value: "banner", label: "Bannière" },
  { value: "category", label: "Catégorie" },
  { value: "brand", label: "Marque" },
  { value: "landing_page", label: "Page d'atterrissage" },
];

const TYPE_BADGE_LABELS: Record<string, string> = {
  homepage: "Accueil",
  seasonal: "Saisonnière",
  flash_sale: "Flash",
  targeted: "Ciblée",
  banner: "Bannière",
  category: "Catégorie",
  brand: "Marque",
  landing_page: "Landing",
};

function FacetedFilter({
  title,
  options,
  icon: Icon,
  value,
  onChange,
}: {
  title: string;
  options: Option[];
  icon?: React.ComponentType<{ className?: string }>;
  value?: string;
  onChange: (value: string | null) => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed font-normal">
          {value ? (
            <div
              role="button"
              aria-label={`Clear ${title} filter`}
              tabIndex={0}
              className="focus-visible:ring-ring rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-1 focus-visible:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            >
              <XCircle className="size-4" />
            </div>
          ) : (
            Icon && <Icon className="size-4" />
          )}
          <span className="ml-2">{title}</span>
          {value && (
            <>
              <Separator orientation="vertical" className="mx-0.5 data-[orientation=vertical]:h-4" />
              <span className="ml-1">{options.find((o) => o.value === value)?.label}</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-0">
        <div className="p-2">
          {options.map((option) => (
            <Button
              key={option.value}
              variant={value === option.value ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                onChange(value === option.value ? null : option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function CampaignListPage() {
  const t = useTranslations("campaigns");
  const [page, setPage] = useQueryState("cmpPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("cmpPerPage", parseAsInteger.withDefault(20));
  const [search, setSearch] = useQueryState("cmpSearch", parseAsString);
  const [status, setStatus] = useQueryState("cmpStatus", parseAsString);
  const [campaign_type, setCampaignType] = useQueryState("cmpType", parseAsString);

  const { data, isLoading } = trpc.campaigns.adminList.useQuery({
    page,
    limit: per_page,
    search: search || undefined,
    status: (status || undefined) as
      | "draft" | "scheduled" | "active" | "paused" | "ended" | "cancelled"
      | undefined,
    campaign_type: (campaign_type || undefined) as
      | "homepage" | "seasonal" | "flash_sale" | "targeted" | "banner" | "category"
      | "brand" | "landing_page"
      | undefined,
  });

  const { data: stats, isLoading: statsLoading } = trpc.campaigns.campaignStats.useQuery();

  const columns = React.useMemo<ColumnDef<CampaignRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("campaign_column")} />,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <Link
              href={`/console/campaigns/${row.original.id}`}
              className="font-medium hover:underline"
            >
              {row.original.name}
            </Link>
            <span className="text-muted-foreground font-mono text-xs">{row.original.slug}</span>
          </div>
        ),
      },
      {
        id: "campaign_type",
        accessorKey: "campaign_type",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("type_column")} />,
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {TYPE_BADGE_LABELS[row.original.campaign_type] ?? row.original.campaign_type}
          </Badge>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("status_column")} />,
        cell: ({ row }) => <CampaignStatusBadge status={row.original.status} />,
      },
      {
        id: "priority",
        accessorKey: "priority",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("priority_column")} />,
        cell: ({ row }) => <span className="font-mono text-sm">{row.original.priority}</span>,
      },
      {
        id: "starts_at",
        accessorKey: "starts_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("start_column")} />,
        cell: ({ row }) =>
          row.original.starts_at
            ? formatDate(row.original.starts_at, { month: "short" })
            : "—",
      },
      {
        id: "ends_at",
        accessorKey: "ends_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("end_column")} />,
        cell: ({ row }) =>
          row.original.ends_at
            ? formatDate(row.original.ends_at, { month: "short" })
            : "—",
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/console/campaigns/${row.original.id}/analytics`}>
                  <BarChart3 className="mr-2 size-4" />
                  Analytiques
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/console/campaigns/${row.original.id}`}>
                  <Pencil className="mr-2 size-4" />
                  {t("edit")}
                </Link>
              </DropdownMenuItem>
              {row.original.status !== "active" && (
                <DropdownMenuItem>
                  <Play className="mr-2 size-4 text-emerald-600" />
                  {t("activate")}
                </DropdownMenuItem>
              )}
              {row.original.status === "active" && (
                <DropdownMenuItem>
                  <Square className="mr-2 size-4 text-amber-600" />
                  {t("pause")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  const items = (data?.items ?? []) as CampaignRow[];
  const page_count = data?.meta.totalPages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "cmpPage", perPage: "cmpPerPage", sort: "cmpSort" },
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  return (
    <QueryGuard query={{ isLoading }} loadingFallback={<DataTableSkeleton columnCount={7} rowCount={10} filterCount={3} />}>
    <ConsolePageShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={
        <Button asChild>
          <Link href="/console/campaigns/new">
            <Megaphone className="mr-2 h-4 w-4" />
            {t("new_campaign")}
          </Link>
        </Button>
      }
      stats={
        <StatsGrid
          loading={statsLoading}
          items={[
            { label: "Total", value: stats?.total ?? 0, icon: Layers, color: "info" },
            { label: "Actives", value: stats?.active ?? 0, icon: Megaphone, color: "success" },
            { label: "Planifiées", value: stats?.scheduled ?? 0, icon: Calendar, color: "warning" },
            { label: "Brouillons", value: stats?.draft ?? 0, icon: Eye, color: "default" },
            { label: "Terminées", value: stats?.ended ?? 0, icon: Square, color: "default" },
          ]}
        />
      }
    >
      <DataTable table={table}>
        <DataTableAdvancedToolbar table={table}>
          <Input
            placeholder={t("search_placeholder")}
            value={search || ""}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-sm"
          />
          <FacetedFilter
            title={t("status_title")}
            options={STATUS_OPTIONS}
            value={status ?? undefined}
            onChange={(val) => {
              setStatus(val);
              setPage(1);
            }}
          />
          <FacetedFilter
            title={t("type_title")}
            options={TYPE_OPTIONS}
            value={campaign_type ?? undefined}
            onChange={(val) => {
              setCampaignType(val);
              setPage(1);
            }}
          />
          <DataTableSortList table={table} />
        </DataTableAdvancedToolbar>
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <div className="flex items-center gap-2 border-t p-2">
            <Badge variant="outline">
              {table.getFilteredSelectedRowModel().rows.length}{" "}{t("selected")}
            </Badge>
            <Button variant="secondary" size="sm">
              <Play className="mr-1 h-4 w-4" />
              Activer
            </Button>
            <Button variant="secondary" size="sm">
              <Square className="mr-1 h-4 w-4" />
              Mettre en pause
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a
                href={`/api/admin/campaigns/export?${new URLSearchParams({
                  ...(search ? { search } : {}),
                  ...(status ? { status } : {}),
                  ...(campaign_type ? { campaign_type } : {}),
                })}`}
                download="campaigns.csv"
              >
                <Download className="mr-1 h-4 w-4" />
                {t("export")}
              </a>
            </Button>
          </div>
        )}
      </DataTable>
    </ConsolePageShell>
    </QueryGuard>
  );
}
