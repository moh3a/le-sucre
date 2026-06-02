"use client";

import {
  BarChart,
  ArrowRight,
  Eye,
  ShoppingCart,
  CreditCard,
  ShoppingBag,
  Search,
} from "lucide-react";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/components/providers/app-providers";
import { AnalyticsDashboardClient } from "./analytics-dashboard-client";
import { AnalyticsProductsTable } from "./analytics-products-table";
import { format_currency } from "@/lib/format";

function default_range() {
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  return { from, to };
}

export function AnalyticsPageClient() {
  const { from, to } = default_range();

  return (
    <ConsolePageShell title="Analytique" subtitle="Performance boutique et produits">
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="categories_brands">Catégories & Marques</TabsTrigger>
          <TabsTrigger value="funnel">Entonnoir</TabsTrigger>
          <TabsTrigger value="searches">Recherches</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AnalyticsDashboardClient />
        </TabsContent>

        <TabsContent value="products">
          <AnalyticsProductsTable />
        </TabsContent>

        <TabsContent value="categories_brands">
          <AnalyticsCategoriesBrands from={from} to={to} />
        </TabsContent>

        <TabsContent value="funnel">
          <AnalyticsFunnel from={from} to={to} />
        </TabsContent>

        <TabsContent value="searches">
          <AnalyticsSearches from={from} to={to} />
        </TabsContent>
      </Tabs>
    </ConsolePageShell>
  );
}

function AnalyticsCategoriesBrands({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = trpc.analytics.products.useQuery({ from, to });

  if (isLoading) return <p className="text-muted-foreground text-sm">Chargement…</p>;
  if (!data) return <p className="text-muted-foreground text-sm">Aucune donnée disponible.</p>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Top Catégories</CardTitle>
          <CardDescription>Les catégories générant le plus de revenus</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="hover:bg-muted/50 border-b transition-colors">
                  <th className="text-muted-foreground h-10 px-2 text-left align-middle font-medium">
                    Catégorie ID
                  </th>
                  <th className="text-muted-foreground h-10 px-2 text-right align-middle font-medium">
                    Vues
                  </th>
                  <th className="text-muted-foreground h-10 px-2 text-right align-middle font-medium">
                    Revenus
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {data.categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-muted-foreground p-4 text-center">
                      Aucune donnée.
                    </td>
                  </tr>
                ) : (
                  data.categories.map((c) => (
                    <tr
                      key={c.category_id}
                      className="hover:bg-muted/50 border-b transition-colors"
                    >
                      <td className="p-2 align-middle font-medium">
                        {c.category_id || "Sans catégorie"}
                      </td>
                      <td className="p-2 text-right align-middle">{c.views.toLocaleString()}</td>
                      <td className="text-crimson-violet p-2 text-right align-middle font-medium">
                        {format_currency(Number(c.revenue || 0))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Marques</CardTitle>
          <CardDescription>Les marques générant le plus de revenus</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="hover:bg-muted/50 border-b transition-colors">
                  <th className="text-muted-foreground h-10 px-2 text-left align-middle font-medium">
                    Marque ID
                  </th>
                  <th className="text-muted-foreground h-10 px-2 text-right align-middle font-medium">
                    Vues
                  </th>
                  <th className="text-muted-foreground h-10 px-2 text-right align-middle font-medium">
                    Revenus
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {data.brands.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-muted-foreground p-4 text-center">
                      Aucune donnée.
                    </td>
                  </tr>
                ) : (
                  data.brands.map((b) => (
                    <tr key={b.brand_id} className="hover:bg-muted/50 border-b transition-colors">
                      <td className="p-2 align-middle font-medium">
                        {b.brand_id || "Sans marque"}
                      </td>
                      <td className="p-2 text-right align-middle">{b.views.toLocaleString()}</td>
                      <td className="text-crimson-violet p-2 text-right align-middle font-medium">
                        {format_currency(Number(b.revenue || 0))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AnalyticsFunnel({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = trpc.analytics.overview.useQuery({ from, to });

  if (isLoading) return <p className="text-muted-foreground text-sm">Chargement…</p>;
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
  );
}

function AnalyticsSearches({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = trpc.analytics.searchAnalytics.useQuery({ from, to });

  if (isLoading) return <p className="text-muted-foreground text-sm">Chargement…</p>;
  if (!data) return <p className="text-muted-foreground text-sm">Aucune donnée disponible.</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recherches Populaires</CardTitle>
        <CardDescription>Mots-clés recherchés par vos clients</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="hover:bg-muted/50 border-b transition-colors">
                <th className="text-muted-foreground h-10 px-4 text-left align-middle font-medium">
                  Terme de recherche
                </th>
                <th className="text-muted-foreground h-10 px-4 text-right align-middle font-medium">
                  Volume de recherche
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {data.top_searches.length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-muted-foreground p-4 text-center">
                    Aucun mot-clé recherché.
                  </td>
                </tr>
              ) : (
                data.top_searches.map((s) => (
                  <tr key={s.query} className="hover:bg-muted/50 border-b transition-colors">
                    <td className="flex items-center gap-2 p-4 align-middle font-medium">
                      <Search className="text-muted-foreground h-4 w-4" />
                      <span>{s.query}</span>
                    </td>
                    <td className="p-4 text-right align-middle font-medium">
                      {s.count.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
