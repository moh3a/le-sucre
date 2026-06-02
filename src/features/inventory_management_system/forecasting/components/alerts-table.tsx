"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { useDataTable } from "@/features/data-table/use-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Eye } from "lucide-react";

type AlertRow = {
  id: string;
  sku_id: string;
  warehouse_id: string;
  alert_type: string;
  severity: string;
  message: string;
  status: string;
  created_at: string;
};

const SEVERITY_BADGES: Record<
  string,
  { label: string; variant: "destructive" | "warning" | "secondary" | "default" }
> = {
  critical: { label: "Critique", variant: "destructive" },
  warning: { label: "Avertissement", variant: "warning" },
  info: { label: "Info", variant: "secondary" },
};

export function AlertsTable({
  data,
  onAck,
  onResolve,
  isMutating,
}: {
  data: AlertRow[];
  onAck: (id: string) => void;
  onResolve: (id: string) => void;
  isMutating: boolean;
}) {
  const columns = React.useMemo<ColumnDef<AlertRow>[]>(
    () => [
      {
        id: "sku_id",
        accessorKey: "sku_id",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Code SKU" />,
        cell: ({ row }) => <span className="font-mono font-medium">{row.original.sku_id}</span>,
      },
      {
        id: "severity",
        accessorKey: "severity",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Sévérité" />,
        cell: ({ row }) => {
          const cfg = SEVERITY_BADGES[row.original.severity] ?? {
            label: row.original.severity,
            variant: "outline",
          };
          return (
            <Badge variant={cfg.variant === "warning" ? "outline" : cfg.variant}>{cfg.label}</Badge>
          );
        },
      },
      {
        id: "alert_type",
        accessorKey: "alert_type",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Type" />,
        cell: ({ row }) => (
          <span className="capitalize">{row.original.alert_type.replace(/_/g, " ")}</span>
        ),
      },
      {
        id: "message",
        accessorKey: "message",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Message" />,
        cell: ({ row }) => <span className="text-sm">{row.original.message}</span>,
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Détecté le" />,
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleDateString("fr-FR", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const alert = row.original;
          if (alert.status === "resolved") {
            return (
              <span className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                <Check className="text-success h-4 w-4" /> Résolue
              </span>
            );
          }

          return (
            <div className="flex gap-2">
              {alert.status === "open" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 text-xs"
                  onClick={() => onAck(alert.id)}
                  disabled={isMutating}
                >
                  <Eye className="mr-1 h-3 w-3" /> Prendre acte
                </Button>
              )}
              <Button
                size="sm"
                variant="default"
                className="h-8 px-2 text-xs"
                onClick={() => onResolve(alert.id)}
                disabled={isMutating}
              >
                <Check className="mr-1 h-3 w-3" /> Résoudre
              </Button>
            </div>
          );
        },
      },
    ],
    [onAck, onResolve, isMutating],
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount: 1,
    queryKeys: { page: "alPage", perPage: "alPerPage" },
    getRowId: (row) => row.id,
  });

  return <DataTable table={table} />;
}
