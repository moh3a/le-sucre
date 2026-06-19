"use client";

import { useState } from "react";
import { trpc } from "@/components/providers/app-providers";
import {
  Heart,
  TrendingUp,
  Package,
  ShoppingBag,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AdminWishlistAnalyticsPageClient() {
  const [period, setPeriod] = useState("30d");
  const { data: summary, isLoading, refetch } = trpc.wishlistManagement.admin.summary.useQuery({
    period: period as "7d" | "30d" | "90d" | "1y",
  });
  const { data: trending } = trpc.wishlistManagement.admin.trendingProducts.useQuery({ limit: 10, period: 7 });
  const { data: abandoned } = trpc.wishlistManagement.admin.abandonedProducts.useQuery({ limit: 10 });
  const { data: highConverting } = trpc.wishlistManagement.admin.highConvertingProducts.useQuery({ limit: 10 });
  const { data: topFavorited } = trpc.wishlistManagement.admin.topFavorited.useQuery({ limit: 10 });
  const invalidateMut = trpc.wishlistManagement.admin.invalidateCache.useMutation();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            Analyse des listes de souhaits
          </h1>
          <p className="text-muted-foreground">
            Tableau de bord des performances
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
              <SelectItem value="1y">1 an</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => invalidateMut.mutate()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Listes de souhaits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{summary?.total_wishlists ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Listes actives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{summary?.active_wishlists ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Produits sauvegardés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{summary?.total_saved_products ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Taux de conversion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{summary?.wishlist_conversion_rate ?? 0}%</p>
              </CardContent>
            </Card>
          </div>

          {summary && summary.most_wished_products.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Produits les plus souhaités</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead className="text-right">Ajouts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.most_wished_products.map((p: any, i: number) => (
                      <TableRow key={p.product_id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground w-6">{i + 1}.</span>
                            <span className="font-medium">{p.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{p.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trending && trending.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tendances (7 jours)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead className="text-right">Signal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trending.map((p: any, i: number) => (
                        <TableRow key={p.product_id}>
                          <TableCell>
                            <span className="text-muted-foreground mr-2">{i + 1}.</span>
                            {p.product_id}
                          </TableCell>
                          <TableCell className="text-right">{p.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {abandoned && abandoned.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Produits abandonnés</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead className="text-right">Ajouts sans achat</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {abandoned.map((p: any) => (
                        <TableRow key={p.product_id}>
                          <TableCell>{p.product_id}</TableCell>
                          <TableCell className="text-right">{p.adds}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {highConverting && highConverting.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Forte conversion</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead className="text-right">Ajouts</TableHead>
                        <TableHead className="text-right">Conversions</TableHead>
                        <TableHead className="text-right">Taux</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {highConverting.slice(0, 5).map((p: any) => (
                        <TableRow key={p.product_id}>
                          <TableCell>{p.product_id}</TableCell>
                          <TableCell className="text-right">{p.adds}</TableCell>
                          <TableCell className="text-right">{p.conversions}</TableCell>
                          <TableCell className="text-right">{p.rate}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {topFavorited && topFavorited.products.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Produits les plus favoris</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead className="text-right">Favoris</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topFavorited.products.map((p: any, i: number) => (
                        <TableRow key={p.product_id}>
                          <TableCell>
                            <span className="text-muted-foreground mr-2">{i + 1}.</span>
                            {p.product_id}
                          </TableCell>
                          <TableCell className="text-right">{p.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
