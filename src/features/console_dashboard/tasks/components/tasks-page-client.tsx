"use client";

import { trpc } from "@/components/providers/app-providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SimpleDataTable } from "@/components/console/simple-data-table";
import { ListTodo, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

const status_labels: Record<string, string> = {
  pending: "En attente",
  in_progress: "En cours",
  completed: "Terminée",
  cancelled: "Annulée",
};

const status_badges: Record<string, "destructive" | "secondary" | "default" | "outline"> = {
  pending: "outline",
  in_progress: "secondary",
  completed: "default",
  cancelled: "destructive",
};

const type_labels: Record<string, string> = {
  order_follow_up: "Suivi commande",
  customer_follow_up: "Suivi client",
  inventory_review: "Révision inventaire",
  campaign_review: "Révision campagne",
  general: "Général",
};

export function TasksPageClient() {
  const { data, isLoading } = trpc.operations.adminTaskListAll.useQuery({ page: 1, limit: 20 });
  const dashboard = trpc.operations.adminTaskDashboard.useQuery();

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tâches</h1>
          <p className="text-muted-foreground">Gestion des tâches internes</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="text-secondary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.data?.pending ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <ListTodo className="text-secondary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.data?.in_progress ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En retard</CardTitle>
            <AlertTriangle className="text-destructive h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.data?.overdue ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.data?.completed ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <SimpleDataTable
            columns={[
              {
                accessorKey: "task_type",
                header: "Type",
                cell: ({ row }) =>
                  type_labels[row.original.task_type as string] ?? row.original.task_type,
              },
              { accessorKey: "title", header: "Titre" },
              { accessorKey: "assigned_to_user_id", header: "Assigné à" },
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
              { accessorKey: "due_at", header: "Échéance" },
            ]}
            data={data?.items ?? []}
            pageCount={data?.meta?.total_pages}
          />
        </CardContent>
      </Card>
    </div>
  );
}
