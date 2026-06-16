"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, useQueryState } from "nuqs";
import * as React from "react";

import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { useDataTable } from "@/features/data-table/use-data-table";
import { trpc } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { EditUser } from "./edit-user";

type UserRow = {
  id: string;
  name: string | null;
  phone: string;
  role: string;
  roles: string | null;
  email: string;
  email_verified: boolean;
  is_active: boolean;
  banned: boolean | null;
  ban_reason: string | null;
  ban_expires: string | null;
  created_at: string;
};

export function UsersTable() {
  const columns = React.useMemo<ColumnDef<UserRow>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Nom" />,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name ?? "—"}</span>
            <span className="text-muted-foreground text-xs">{row.original.email}</span>
          </div>
        ),
      },
      {
        id: "phone",
        accessorKey: "phone",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Téléphone" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">{row.original.phone ?? "—"}</span>
        ),
      },
      {
        id: "email_verified",
        accessorKey: "email_verified",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Vérifié" />,
        cell: ({ row }) => (
          <Badge variant={row.original.email_verified ? "default" : "outline"}>
            {row.original.email_verified ? "Oui" : "Non"}
          </Badge>
        ),
      },
      {
        id: "is_active",
        accessorKey: "is_active",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Actif" />,
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "default" : "destructive"}>
            {row.original.is_active ? "Actif" : "Inactif"}
          </Badge>
        ),
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Inscription" />,
        cell: ({ row }) => formatDate(row.original.created_at, { month: "short" }),
      },
      {
        id: "role",
        accessorKey: "role",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Rôle" />,
        cell: ({ row }) => <Badge variant="outline">{row.original.role}</Badge>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <EditUser
            userId={row.original.id}
            name={row.original.name}
            email={row.original.email}
            is_active={row.original.is_active}
            banned={row.original.banned}
            role={row.original.role}
          />
        ),
      },
    ],
    [],
  );

  const [page] = useQueryState("usersPage", parseAsInteger.withDefault(1));
  const [perPage] = useQueryState("usersPerPage", parseAsInteger.withDefault(20));

  const { data, isLoading } = trpc.adminAuth.listUsers.useQuery({
    page,
    limit: perPage,
  });

  const items = data?.items ?? [];
  const pageCount = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount,
    queryKeys: { page: "usersPage", perPage: "usersPerPage" },
    getRowId: (row) => row.id,
  });

  if (isLoading && !data) {
    return <DataTableSkeleton columnCount={6} rowCount={10} />;
  }

  return <DataTable table={table} />;
}
