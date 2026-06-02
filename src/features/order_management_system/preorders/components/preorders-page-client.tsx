"use client";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { trpc } from "@/components/providers/app-providers";
import { PreordersTable } from "./preorders-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function PreordersPageClient() {
  const utils = trpc.useUtils();
  const { data: preorderAllocations, isLoading } = trpc.preorders.adminListAllocations.useQuery({
    page: 1,
    limit: 50,
  });

  const updateEtaMutation = trpc.preorders.updateEstimatedDate.useMutation({
    onSuccess: () => {
      void utils.preorders.adminListAllocations.invalidate();
    },
  });

  const handleUpdateEta = (allocation_id: string, dateStr: string) => {
    updateEtaMutation.mutate({
      allocation_id,
      estimated_available_at: dateStr,
    });
  };

  return (
    <ConsolePageShell
      title="Précommandes"
      subtitle="Gestion des précommandes et des allocations"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Allocations de Précommande</CardTitle>
            <CardDescription>
              Liste des allocations de produits en précommande rattachées aux commandes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-sm py-4">Chargement des précommandes…</p>
            ) : !preorderAllocations || preorderAllocations.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">Aucune allocation de précommande active.</p>
            ) : (
              <PreordersTable
                data={preorderAllocations}
                onUpdateEta={handleUpdateEta}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </ConsolePageShell>
  );
}
