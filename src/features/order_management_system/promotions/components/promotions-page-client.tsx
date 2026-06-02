"use client";

// [ ] not to standards

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { trpc } from "@/components/providers/app-providers";
import { PromotionsTable } from "./promotions-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function PromotionsPageClient() {
  const { data: promotionsData, isLoading } = trpc.promotions.adminList.useQuery({
    page: 1,
    limit: 50,
  });

  return (
    <ConsolePageShell
      title="Promotions"
      subtitle="Gestion des codes promo, ventes flash et bundles"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Campagnes et Remises</CardTitle>
            <CardDescription>
              Liste des règles de remise automatiques, codes promotionnels, ventes flash et offres
              groupées.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground py-4 text-sm">Chargement des promotions…</p>
            ) : !promotionsData || promotionsData.length === 0 ? (
              <p className="text-muted-foreground py-4 text-sm">Aucune promotion configurée.</p>
            ) : (
              <PromotionsTable data={promotionsData} />
            )}
          </CardContent>
        </Card>
      </div>
    </ConsolePageShell>
  );
}
