"use client";

// [ ] not to standards

import * as React from "react";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/components/providers/app-providers";
import { AlertsTable } from "./alerts-table";

export function AlertsPageClient() {
  const [status, setStatus] = React.useState<string>("open");
  const utils = trpc.useUtils();

  const { data: alertsData, isLoading } = trpc.forecast.alerts.useQuery({
    status: status || undefined,
    page: 1,
    limit: 50,
  });

  const ackMutation = trpc.forecast.ackAlert.useMutation({
    onSuccess: () => {
      void utils.forecast.alerts.invalidate();
      void utils.forecast.dashboard.invalidate();
    },
  });

  const resolveMutation = trpc.forecast.resolveAlert.useMutation({
    onSuccess: () => {
      void utils.forecast.alerts.invalidate();
      void utils.forecast.dashboard.invalidate();
    },
  });

  const handleAck = (id: string) => {
    ackMutation.mutate({ id });
  };

  const handleResolve = (id: string) => {
    resolveMutation.mutate({ id });
  };

  const isMutating = ackMutation.isPending || resolveMutation.isPending;

  return (
    <ConsolePageShell title="Alertes Stock" subtitle="Gestion des alertes de stock faible">
      <Tabs value={status} onValueChange={setStatus} className="space-y-6">
        <TabsList>
          <TabsTrigger value="open">Actives</TabsTrigger>
          <TabsTrigger value="ack">Pris acte</TabsTrigger>
          <TabsTrigger value="resolved">Résolues</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>
              Alertes automatiques générées par l&apos;analyse prévisionnelle des niveaux de stock.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground py-4 text-sm">Chargement des alertes…</p>
            ) : !alertsData || alertsData.length === 0 ? (
              <p className="text-muted-foreground py-4 text-sm">
                Aucune alerte de stock dans cette catégorie.
              </p>
            ) : (
              <AlertsTable
                data={alertsData}
                onAck={handleAck}
                onResolve={handleResolve}
                isMutating={isMutating}
              />
            )}
          </CardContent>
        </Card>
      </Tabs>
    </ConsolePageShell>
  );
}
