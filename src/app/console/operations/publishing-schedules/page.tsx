"use client";

import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/components/providers/app-providers";
import { SimpleDataTable } from "@/components/console/simple-data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { CalendarClock, CheckCircle, XCircle, AlertTriangle, Ban, Calendar } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  pending: "Planifiée",
  executed: "Exécutée",
  failed: "Échouée",
  cancelled: "Annulée",
};

const STATUS_BADGES: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  executed: "default",
  failed: "destructive",
  cancelled: "outline",
};

const ACTION_LABELS: Record<string, string> = {
  publish: "Publication",
  unpublish: "Dépublication",
};

const FILTER_OPTIONS = [
  { value: "", label: "Tous" },
  { value: "pending", label: "Planifiée" },
  { value: "executed", label: "Exécutée" },
  { value: "failed", label: "Échouée" },
  { value: "cancelled", label: "Annulée" },
];

export default function PublishingSchedulesPageClient() {
  const [status_filter, set_status_filter] = useState("");

  const { data: stats, isLoading: stats_loading } = trpc.operations.productGetScheduleStats.useQuery();
  const { data: schedules_data, isLoading: schedules_loading, refetch } = trpc.operations.productListScheduledActions.useQuery({
    page: 1,
    limit: 100,
    status: status_filter || undefined,
  });

  const cancel_schedule = trpc.operations.productCancelSchedule.useMutation({
    onSuccess: () => { refetch(); toast.success("Planification annulée"); },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  if (stats_loading) return <Skeleton className="h-48 w-full" />;

  const items = schedules_data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Planifications de publication</h1>
        <p className="text-muted-foreground text-sm">Gérer les publications et dépublications programmées de produits</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planifiées</CardTitle>
            <Calendar className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exécutées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.executed ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Échouées</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.failed ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annulées</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.cancelled ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="text-base font-medium">Actions programmées</CardTitle>
          <div className="flex items-center gap-2">
            <select
              className="border-input bg-background ring-offset-background h-8 rounded-md border px-2 text-xs"
              value={status_filter}
              onChange={(e) => set_status_filter(e.target.value)}
            >
              {FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {schedules_loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <SimpleDataTable
              columns={[
                { accessorKey: "product_id", header: "Produit" },
                {
                  accessorKey: "action",
                  header: "Action",
                  cell: ({ row }) => (
                    <Badge variant={row.original.action === "publish" ? "default" : "secondary"}>
                      {ACTION_LABELS[row.original.action as string] ?? row.original.action}
                    </Badge>
                  ),
                },
                {
                  accessorKey: "status",
                  header: "Statut",
                  cell: ({ row }) => (
                    <Badge variant={STATUS_BADGES[row.original.status as string]}>
                      {STATUS_LABELS[row.original.status as string] ?? row.original.status}
                    </Badge>
                  ),
                },
                {
                  accessorKey: "scheduled_at",
                  header: "Programmée le",
                  cell: ({ row }) => formatDate(row.original.scheduled_at as string, {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                  }),
                },
                {
                  accessorKey: "executed_at",
                  header: "Exécutée le",
                  cell: ({ row }) =>
                    row.original.executed_at
                      ? formatDate(row.original.executed_at as string, { month: "short", day: "numeric", hour: "2-digit" })
                      : "—",
                },
                { accessorKey: "cancel_reason", header: "Motif annulation" },
                {
                  id: "actions",
                  header: "Actions",
                  cell: ({ row }) =>
                    row.original.status === "pending" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-red-500"
                        onClick={() =>
                          cancel_schedule.mutate({ schedule_id: row.original.id as string, reason: "Annulé par opérateur" })
                        }
                        disabled={cancel_schedule.isPending}
                      >
                        <XCircle className="mr-1 h-3 w-3" />
                        Annuler
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    ),
                },
              ]}
              data={items}
              pageCount={schedules_data?.meta?.total_pages}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
