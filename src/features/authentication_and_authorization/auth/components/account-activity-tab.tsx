"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { useDataTable } from "@/features/data-table/use-data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

type ActivityRow = {
  id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export function AccountActivityTab() {
  const t = useTranslations("products");

  const action_label = useCallback((action: string): string => {
    const labels: Record<string, string> = {
      "profile.updated": t("activity_profile_updated"),
      "password.changed": t("activity_password_changed"),
      "auth.login.success": t("activity_login_success"),
      "auth.login.failure": t("activity_login_failure"),
      "auth.logout": t("activity_logout"),
    };
    return labels[action] ?? action;
  }, [t]);

  const columns = useMemo<ColumnDef<ActivityRow>[]>(
    () => [
      {
        id: "action",
        accessorKey: "action",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("activity_action_column")} />,
        cell: ({ row }) => <span className="font-medium">{action_label(row.original.action)}</span>,
      },
      {
        id: "resource",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("activity_resource_column")} />,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.resource_type ? `${row.original.resource_type}#${row.original.resource_id?.slice(0, 8)}` : "—"}
          </span>
        ),
      },
      {
        id: "ip_address",
        accessorKey: "ip_address",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("activity_ip_column")} />,
        cell: ({ row }) => row.original.ip_address ?? "—",
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("activity_date_column")} />,
        cell: ({ row }) => formatDate(row.original.created_at),
      },
    ],
    [t, action_label],
  );

  const { data, isLoading, error } = trpc.auth.myActivity.useQuery({
    page: 1,
    limit: 20,
  });

  const items = (data?.items ?? []) as ActivityRow[];
  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: data?.meta.total_pages ?? 1,
    queryKeys: { page: "actPage", perPage: "actPerPage" },
    getRowId: (row) => row.id,
  });

  return (
    <QueryGuard query={{ isLoading, error }} loadingFallback={<DataTableSkeleton columnCount={4} rowCount={10} />}>
    <Card>
      <CardHeader>
        <CardTitle>{t("activity_recent_title")}</CardTitle>
        <CardDescription>
          {t("activity_entries_count", { count: data?.meta.total_records ?? 0 })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable table={table} />
      </CardContent>
    </Card>
    </QueryGuard>
  );
}
