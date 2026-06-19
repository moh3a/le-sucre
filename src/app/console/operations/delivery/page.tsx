"use client";

import { useState } from "react";
import { trpc } from "@/components/providers/app-providers";
import { SimpleDataTable } from "@/features/operations_workflows/components/simple-data-table";
import { StatsGrid } from "@/components/console/stats-grid";
import type { StatItem } from "@/components/console/stats-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { Truck, AlertTriangle, XCircle, RotateCcw } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  successful: "Livré",
  failed: "Échoué",
  customer_unavailable: "Client absent",
  wrong_address: "Mauvaise adresse",
  refused: "Refusé",
  cancelled: "Annulé",
};

const STATUS_BADGE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  successful: "default",
  failed: "destructive",
  customer_unavailable: "secondary",
  wrong_address: "outline",
  refused: "destructive",
  cancelled: "outline",
};

const ATTEMPT_STATUS_OPTIONS = [
  { value: "", label: "Tous" },
  { value: "successful", label: "Livré" },
  { value: "failed", label: "Échoué" },
  { value: "customer_unavailable", label: "Client absent" },
  { value: "wrong_address", label: "Mauvaise adresse" },
  { value: "refused", label: "Refusé" },
  { value: "cancelled", label: "Annulé" },
];

export default function DeliveryPageClient() {
  const [status_filter, set_status_filter] = useState("");

  const { data: stats, isLoading: stats_loading } = trpc.operations.deliveryGetStats.useQuery();
  const { data: attempts_data, isLoading: attempts_loading } = trpc.operations.deliveryListAttempts.useQuery({
    page: 1,
    limit: 100,
    status: status_filter || undefined,
  });

  if (stats_loading) return <Skeleton className="h-48 w-full" />;

  const items = attempts_data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Livraisons</h1>
        <p className="text-muted-foreground text-sm">Gestion des tentatives de livraison, des retours et des réexpéditions</p>
      </div>

      <StatsGrid
        items={
          [
            { label: "Tentatives réussies", value: stats?.total_successful ?? 0, icon: Truck },
            { label: "Tentatives échouées", value: stats?.total_failed ?? 0, icon: XCircle },
            { label: "Échecs aujourd'hui", value: stats?.today_failed ?? 0, icon: AlertTriangle },
            { label: "Retours entrepôt (RTO)", value: stats?.total_rto ?? 0, icon: RotateCcw },
          ] satisfies StatItem[]
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="text-base font-medium">Tentatives de livraison</CardTitle>
          <div className="flex items-center gap-2">
            <select
              className="border-input bg-background ring-offset-background h-8 rounded-md border px-2 text-xs"
              value={status_filter}
              onChange={(e) => set_status_filter(e.target.value)}
            >
              {ATTEMPT_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {attempts_loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <SimpleDataTable
              columns={[
                { accessorKey: "order_id", header: "Commande" },
                { accessorKey: "attempt_number", header: "Tentative #" },
                {
                  accessorKey: "status",
                  header: "Statut",
                  cell: ({ row }) => (
                    <Badge variant={STATUS_BADGE_VARIANTS[row.original.status as string] ?? "outline"}>
                      {STATUS_LABELS[row.original.status as string] ?? row.original.status}
                    </Badge>
                  ),
                },
                {
                  accessorKey: "attempted_at",
                  header: "Date",
                  cell: ({ row }) => formatDate(row.original.attempted_at as string, {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                  }),
                },
                {
                  accessorKey: "next_attempt_at",
                  header: "Prochaine tentative",
                  cell: ({ row }) =>
                    row.original.next_attempt_at
                      ? formatDate(row.original.next_attempt_at as string, { month: "short", day: "numeric", hour: "2-digit" })
                      : "—",
                },
                { accessorKey: "description", header: "Description" },
                { accessorKey: "delivery_person_id", header: "Livreur" },
              ]}
              data={items}
              pageCount={attempts_data?.meta?.total_pages}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
