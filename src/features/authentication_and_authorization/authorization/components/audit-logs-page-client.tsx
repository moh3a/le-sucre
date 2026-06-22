"use client";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { AuditLogsTable } from "./audit-logs-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function AuditLogsPageClient() {
  const { data: auditLogsData, isLoading, error } = trpc.adminAuth.listAuditLogs.useQuery({
    page: 1,
    limit: 50,
  });

  return (
    <QueryGuard query={{ isLoading, error }}>
      <ConsolePageShell
        title="Journaux d'audit"
        subtitle="Historique des actions et modifications"
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Journal d&apos;activité</CardTitle>
              <CardDescription>
                Traces d&apos;audit des actions administratives effectuées sur la plateforme.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!auditLogsData?.items || auditLogsData.items.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4">Aucune action enregistrée.</p>
              ) : (
                <AuditLogsTable data={auditLogsData.items} />
              )}
            </CardContent>
          </Card>
        </div>
      </ConsolePageShell>
    </QueryGuard>
  );
}
