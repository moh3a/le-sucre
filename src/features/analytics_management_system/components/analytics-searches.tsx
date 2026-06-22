"use client";

import { Search } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";

export function AnalyticsSearches({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = trpc.analytics.searchAnalytics.useQuery({ from, to });

  if (!data) return <p className="text-muted-foreground text-sm">Aucune donnée disponible.</p>;

  return (
    <QueryGuard
      query={{ isLoading }}
      loadingFallback={<p className="text-muted-foreground text-sm">Chargement…</p>}
    >
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
    </QueryGuard>
  );
}
