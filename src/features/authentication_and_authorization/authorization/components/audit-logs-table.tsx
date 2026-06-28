"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { useDataTable } from "@/features/data-table/use-data-table";
import { Badge } from "@/components/ui/badge";

type AuditLogRow = {
  id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  actor_name: string | null;
  actor_email: string | null;
};

export function AuditLogsTable({ data }: { data: AuditLogRow[] }) {
  const t = useTranslations("audit");
  const columns = React.useMemo<ColumnDef<AuditLogRow>[]>(
    () => [
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("date_column")} />,
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleString("fr-FR", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
      },
      {
        id: "actor",
        header: t("user_column"),
        cell: ({ row }) => {
          const { actor_name, actor_email } = row.original;
          if (!actor_name && !actor_email)
            return <span className="text-muted-foreground">{t("system")}</span>;
          return (
            <div className="flex flex-col">
              <span className="text-xs font-medium">{actor_name || t("no_name")}</span>
              <span className="text-muted-foreground text-[10px]">{actor_email}</span>
            </div>
          );
        },
      },
      {
        id: "action",
        accessorKey: "action",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("action_column")} />,
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="bg-secondary text-olive-leaf border-primary/20 font-mono text-[10px] uppercase"
          >
            {row.original.action}
          </Badge>
        ),
      },
      {
        id: "resource",
        header: t("resource_column"),
        cell: ({ row }) => {
          const { resource_type, resource_id } = row.original;
          if (!resource_type) return "—";
          return (
            <div className="flex flex-col">
              <span className="text-xs font-semibold capitalize">
                {resource_type.replace(/_/g, " ")}
              </span>
              {resource_id && (
                <span className="text-muted-foreground font-mono text-[10px]">{resource_id}</span>
              )}
            </div>
          );
        },
      },
      {
        id: "ip_address",
        accessorKey: "ip_address",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("ip_column")} />,
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.ip_address ?? "—"}</span>
        ),
      },
      {
        id: "metadata",
        accessorKey: "metadata",
        header: t("metadata_column"),
        cell: ({ row }) => {
          const metaStr = row.original.metadata;
          if (!metaStr) return "—";
          try {
            const parsed = JSON.parse(metaStr);
            return (
              <pre className="bg-muted max-h-16 max-w-xs overflow-auto rounded p-1 font-mono text-[10px]">
                {JSON.stringify(parsed, null, 2)}
              </pre>
            );
          } catch {
            return <span className="font-mono text-[10px]">{metaStr}</span>;
          }
        },
      },
    ],
    [t],
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount: 1,
    queryKeys: { page: "auPage", perPage: "auPerPage" },
    getRowId: (row) => row.id,
  });

  return <DataTable table={table} />;
}
