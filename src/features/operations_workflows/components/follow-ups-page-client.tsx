"use client";

import { trpc } from "@/components/providers/app-providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SimpleDataTable } from "./simple-data-table";
import { Phone, AlertTriangle } from "lucide-react";

const status_labels: Record<string, string> = {
  pending: "En attente",
  completed: "Terminé",
  cancelled: "Annulé",
  rescheduled: "Reporté",
};

const status_badges: Record<string, "destructive" | "secondary" | "default" | "outline"> = {
  pending: "outline",
  completed: "default",
  cancelled: "destructive",
  rescheduled: "secondary",
};

const fu_type_labels: Record<string, string> = {
  callback: "Rappel",
  follow_up: "Suivi",
  reminder: "Rappel automatique",
};

export function FollowUpsPageClient() {
  const { data, isLoading } = trpc.operations.customerListMyFollowUps.useQuery({ page: 1, limit: 20 });
  const overdue = trpc.operations.customerGetOverdueFollowUps.useQuery();

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relances et suivis</h1>
          <p className="text-muted-foreground">Gestion des rappels et suivis clients</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En retard</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdue.data?.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suivis actifs</CardTitle>
            <Phone className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.meta?.total_records ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <SimpleDataTable
            columns={[
              {
                accessorKey: "follow_up_type",
                header: "Type",
                cell: ({ row }) => fu_type_labels[row.original.follow_up_type as string] ?? row.original.follow_up_type,
              },
              { accessorKey: "title", header: "Titre" },
              { accessorKey: "priority", header: "Priorité" },
              {
                accessorKey: "status",
                header: "Statut",
                cell: ({ row }) => (
                  <Badge variant={status_badges[row.original.status as string]}>
                    {status_labels[row.original.status as string] ?? row.original.status}
                  </Badge>
                ),
              },
              { accessorKey: "scheduled_at", header: "Programmé le" },
            ]}
            data={data?.items ?? []}
            pageCount={data?.meta?.total_pages}
          />
        </CardContent>
      </Card>
    </div>
  );
}
