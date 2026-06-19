"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { trpc } from "@/components/providers/app-providers";
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { useDataTable } from "@/features/data-table/use-data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const ACTION_LABELS: Record<string, string> = {
  "profile.updated": "Profil mis à jour",
  "password.changed": "Mot de passe changé",
  "auth.login.success": "Connexion réussie",
  "auth.login.failure": "Échec de connexion",
  "auth.logout": "Déconnexion",
};

function action_label(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

export function AccountActivityTab() {
  const t = useTranslations("products");

  const columns = useMemo<ColumnDef<ActivityRow>[]>(
    () => [
      {
        id: "action",
        accessorKey: "action",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Action" />,
        cell: ({ row }) => <span className="font-medium">{action_label(row.original.action)}</span>,
      },
      {
        id: "resource",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Ressource" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.resource_type ? `${row.original.resource_type}#${row.original.resource_id?.slice(0, 8)}` : "—"}
          </span>
        ),
      },
      {
        id: "ip_address",
        accessorKey: "ip_address",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Adresse IP" />,
        cell: ({ row }) => row.original.ip_address ?? "—",
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Date" />,
        cell: ({ row }) => formatDate(row.original.created_at),
      },
    ],
    [],
  );

  const { data, isLoading } = trpc.auth.myActivity.useQuery({
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

  if (isLoading) return <DataTableSkeleton columnCount={4} rowCount={10} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité récente</CardTitle>
        <CardDescription>
          {data?.meta.total_records ?? 0} entrée(s) d&apos;activité
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable table={table} />
      </CardContent>
    </Card>
  );
}
