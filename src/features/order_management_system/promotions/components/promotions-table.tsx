"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { useDataTable } from "@/features/data-table/use-data-table";
import { Badge } from "@/components/ui/badge";

type PromotionRow = {
  id: string;
  name: string;
  slug: string;
  promotion_type: string;
  status: string;
  priority: number;
  is_stackable: boolean;
  starts_at: string | null;
  ends_at: string | null;
};

const TYPE_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> =
  {
    promo_code: { label: "Code Promo", variant: "default" },
    automatic: { label: "Automatique", variant: "secondary" },
    flash_sale: { label: "Vente Flash", variant: "outline" },
    bundle: { label: "Bundle", variant: "outline" },
    customer: { label: "Client Spécifique", variant: "secondary" },
  };

const STATUS_BADGES: Record<
  string,
  { label: string; variant: "destructive" | "warning" | "success" | "secondary" }
> = {
  draft: { label: "Brouillon", variant: "secondary" },
  scheduled: { label: "Planifié", variant: "warning" },
  active: { label: "Actif", variant: "success" },
  paused: { label: "En Pause", variant: "destructive" },
};

export function PromotionsTable({ data }: { data: PromotionRow[] }) {
  const columns = React.useMemo<ColumnDef<PromotionRow>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Nom" />,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-muted-foreground font-mono text-xs">{row.original.slug}</span>
          </div>
        ),
      },
      {
        id: "promotion_type",
        accessorKey: "promotion_type",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Type" />,
        cell: ({ row }) => {
          const cfg = TYPE_BADGES[row.original.promotion_type] ?? {
            label: row.original.promotion_type,
            variant: "outline",
          };
          return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
        },
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Statut" />,
        cell: ({ row }) => {
          const cfg = STATUS_BADGES[row.original.status] ?? {
            label: row.original.status,
            variant: "secondary",
          };

          return (
            <Badge
              variant={
                cfg.variant === "warning"
                  ? "outline"
                  : cfg.variant === "success"
                    ? "default"
                    : cfg.variant
              }
            >
              {cfg.label}
            </Badge>
          );
        },
      },
      {
        id: "priority",
        accessorKey: "priority",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Priorité" />,
        cell: ({ row }) => row.original.priority,
      },
      {
        id: "dates",
        header: "Validité",
        cell: ({ row }) => {
          const start = row.original.starts_at;
          const end = row.original.ends_at;

          if (!start && !end)
            return <span className="text-muted-foreground text-xs">Illimitée</span>;

          const format = (dStr: string | null) =>
            dStr
              ? new Date(dStr).toLocaleDateString("fr-FR", {
                  month: "short",
                  day: "numeric",
                  year: "2-digit",
                })
              : "∞";

          return (
            <span className="text-xs">
              {format(start)} → {format(end)}
            </span>
          );
        },
      },
      {
        id: "is_stackable",
        accessorKey: "is_stackable",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Cumulable" />,
        cell: ({ row }) => (
          <Badge variant={row.original.is_stackable ? "default" : "secondary"}>
            {row.original.is_stackable ? "Oui" : "Non"}
          </Badge>
        ),
      },
    ],
    [],
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount: 1,
    queryKeys: { page: "pmPage", perPage: "pmPerPage" },
    getRowId: (row) => row.id,
  });

  return <DataTable table={table} />;
}
