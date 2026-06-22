"use client";

import { BarChart, ArrowRight, Eye, ShoppingCart, CreditCard, ShoppingBag } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";

export function AnalyticsFunnel({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = trpc.analytics.overview.useQuery({ from, to });

  if (!data) return <p className="text-muted-foreground text-sm">Aucune donnée disponible.</p>;

  // Convert raw funnel steps into presentable array
  const stepsMap: Record<
    string,
    { label: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    view: { label: "Vues de produits", icon: Eye },
    add_to_cart: { label: "Ajouts au panier", icon: ShoppingCart },
    checkout: { label: "Initiations de commande", icon: CreditCard },
    purchase: { label: "Achats validés", icon: ShoppingBag },
  };

  const funnelSteps = data.funnel.map((s) => ({
    ...s,
    info: stepsMap[s.step] || { label: s.step, icon: BarChart },
  }));

  return (
    <QueryGuard
      query={{ isLoading }}
      loadingFallback={<p className="text-muted-foreground text-sm">Chargement…</p>}
    >
      <Card>
      <CardHeader>
        <CardTitle>Entonnoir de Conversion</CardTitle>
        <CardDescription>Parcours client et taux d&apos;abandon des sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8 py-4">
          {funnelSteps.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center">
              Pas d&apos;activité récente dans l&apos;entonnoir.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {funnelSteps.map((step, idx) => {
                const IconComponent = step.info.icon;
                const percentage = Math.round(step.rate * 100);
                return (
                  <div key={step.step} className="flex flex-col items-center gap-4 md:flex-row">
                    <div className="flex w-full items-center gap-3 md:w-64">
                      <div className="bg-secondary text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                        <IconComponent className="text-olive-leaf h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{step.info.label}</p>
                        <p className="text-muted-foreground text-xs">
                          {step.sessions.toLocaleString()} sessions
                        </p>
                      </div>
                    </div>

                    <div className="bg-secondary relative h-8 w-full flex-1 overflow-hidden rounded-md">
                      <div
                        className="bg-primary h-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                      <span className="text-olive-leaf absolute inset-0 flex items-center justify-end px-3 text-xs font-bold">
                        {percentage}%
                      </span>
                    </div>

                    {idx < funnelSteps.length - 1 && (
                      <div className="text-muted-foreground hidden h-8 items-center md:flex">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
      </Card>
    </QueryGuard>
  );
}
