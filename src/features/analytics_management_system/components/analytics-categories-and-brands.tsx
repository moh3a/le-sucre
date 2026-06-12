"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/components/providers/app-providers";
import { format_currency } from "@/lib/format";

export function AnalyticsCategoriesBrands({ from, to }: { from: string; to: string }) {
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
