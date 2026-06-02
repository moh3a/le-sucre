"use client";

// [ ] not to standards

import * as React from "react";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/components/providers/app-providers";
import { ForecastTable } from "./forecast-table";
import { AlertTriangle, ShieldAlert, Calendar } from "lucide-react";

export function ForecastPageClient() {
  const [riskLevel, setRiskLevel] = React.useState<string | undefined>(undefined);
  const { data, isLoading } = trpc.forecast.dashboard.useQuery({
    risk_level: riskLevel || undefined,
    page: 1,
    limit: 50,
  });

  const criticalCount = data?.rows.filter((r) => r.risk_level === "critical").length ?? 0;
  const highCount = data?.rows.filter((r) => r.risk_level === "high").length ?? 0;
  const totalRisky = criticalCount + highCount;

  const rows = React.useMemo(() => {
    if (!data?.rows) return [];
    return data.rows.map((r) => ({
      sku_id: r.sku_id,
      sku_code: r.sku_code,
      avg_daily_sales: Number(r.avg_daily_sales || 0),
      days_until_stockout: r.days_until_stockout !== null ? Number(r.days_until_stockout) : 9999,
      recommended_reorder_qty: Number(r.recommended_reorder_qty || 0),
      risk_level: r.risk_level,
      computed_at: r.computed_at,
    }));
  }, [data]);

  const avgDaysLeft = React.useMemo(() => {
    if (rows.length === 0) return 0;
    const validRows = rows.filter((r) => r.days_until_stockout !== 9999);
    if (validRows.length === 0) return 0;
    const sum = validRows.reduce((acc, curr) => acc + curr.days_until_stockout, 0);
    return Math.round(sum / validRows.length);
  }, [rows]);

  return (
    <ConsolePageShell
      title="Prévisions Stock"
      subtitle="Analyse des prévisions de demande et de stock"
      stats={
        <StatsGrid
          loading={isLoading}
          items={[
            {
              label: "Alertes ouvertes",
              value: data?.open_alerts ?? 0,
              icon: ShieldAlert,
              color: (data?.open_alerts ?? 0) > 0 ? "error" : "info",
            },
            {
              label: "SKUs à risque élevé/critique",
              value: totalRisky,
              icon: AlertTriangle,
              color: totalRisky > 0 ? "warning" : "success",
            },
            {
              label: "Moyenne jours restants",
              value: `${avgDaysLeft} j`,
              icon: Calendar,
              color: avgDaysLeft < 15 ? "error" : avgDaysLeft < 30 ? "warning" : "default",
            },
          ]}
        />
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div className="text-muted-foreground flex items-center text-sm">
            Filtrer par niveau de risque pour prioriser les réapprovisionnements.
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={riskLevel || "all"}
              onValueChange={(val) => setRiskLevel(val === "all" ? undefined : val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Niveau de Risque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les risques</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
                <SelectItem value="high">Élevé</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Faible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Analyse Prévisionnelle de Stock</CardTitle>
            <CardDescription>
              Vitesse de vente et quantités recommandées pour éviter les ruptures.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground py-4 text-sm">
                Chargement des données de prévision…
              </p>
            ) : rows.length === 0 ? (
              <p className="text-muted-foreground py-4 text-sm">
                Aucune prévision disponible pour le filtre sélectionné.
              </p>
            ) : (
              <ForecastTable data={rows} />
            )}
          </CardContent>
        </Card>
      </div>
    </ConsolePageShell>
  );
}
