"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { useDataTable } from "@/features/data-table/use-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

type PreorderAllocationRow = {
  id: string;
  sku_id: string;
  warehouse_id: string;
  order_id: string | null;
  cart_id: string | null;
  order_item_id: string | null;
  quantity: number;
  status: string;
  estimated_available_at: string | null;
  fulfilled_at: string | null;
  created_at: string;
};

const STATUS_BADGES: Record<
  string,
  { label: string; variant: "destructive" | "warning" | "success" | "secondary" }
> = {
  pending: { label: "En Attente", variant: "warning" },
  confirmed: { label: "Confirmé", variant: "secondary" },
  fulfilled: { label: "Fini", variant: "success" },
  cancelled: { label: "Annulé", variant: "destructive" },
};

export function PreordersTable({
  data,
  onUpdateEta,
}: {
  data: PreorderAllocationRow[];
  onUpdateEta: (id: string, date: string) => void;
}) {
  const columns = React.useMemo<ColumnDef<PreorderAllocationRow>[]>(
    () => [
      {
        id: "id",
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader column={column} label="ID Allocation" />,
        cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.id}</span>,
      },
      {
        id: "sku_id",
        accessorKey: "sku_id",
        header: ({ column }) => <DataTableColumnHeader column={column} label="SKU" />,
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.sku_id}</span>,
      },
      {
        id: "order_id",
        accessorKey: "order_id",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Commande" />,
        cell: ({ row }) => {
          const oid = row.original.order_id;
          if (!oid) return <span className="text-muted-foreground">—</span>;
          return (
            <Link
              href={`/console/orders/${oid}`}
              className="text-crimson-violet font-mono text-xs hover:underline"
            >
              {oid}
            </Link>
          );
        },
      },
      {
        id: "quantity",
        accessorKey: "quantity",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Quantité" />,
        cell: ({ row }) => row.original.quantity,
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
        id: "estimated_available_at",
        accessorKey: "estimated_available_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Disponibilité estimée" />
        ),
        cell: ({ row }) => {
          const eta = row.original.estimated_available_at;
          const formatted = eta
            ? new Date(eta).toLocaleDateString("fr-FR", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Non définie";

          return (
            <div className="flex items-center gap-2">
              <span className="text-xs">{formatted}</span>
              {row.original.status !== "fulfilled" && row.original.status !== "cancelled" && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => {
                    const promptVal = window.prompt(
                      "Nouvelle date de disponibilité estimée (AAAA-MM-JJ) :",
                    );
                    if (promptVal) {
                      const date = new Date(promptVal);
                      if (isNaN(date.getTime())) {
                        window.alert(
                          "Format de date invalide. Veuillez entrer une date au format AAAA-MM-JJ.",
                        );
                        return;
                      }
                      onUpdateEta(row.original.id, format(date, "yyyy-MM-dd HH:mm:ss"));
                    }
                  }}
                >
                  <Calendar className="h-3 w-3" />
                </Button>
              )}
            </div>
          );
        },
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Créé le" />,
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleDateString("fr-FR", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
      },
    ],
    [onUpdateEta],
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount: 1,
    queryKeys: { page: "poPage", perPage: "poPerPage" },
    getRowId: (row) => row.id,
  });

  return <DataTable table={table} />;
}
