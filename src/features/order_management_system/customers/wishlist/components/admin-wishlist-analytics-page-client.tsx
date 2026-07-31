"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Heart, TrendingUp, Package, ShoppingBag, RefreshCw, Loader2 } from "lucide-react";
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
import { toast } from "sonner";

export function AdminWishlistAnalyticsPageClient() {
  const t = useTranslations("wishlist");
  const [period, setPeriod] = useState("30d");
  const {
    data: summary,
    isLoading,
    refetch,
  } = trpc.wishlistManagement.admin.summary.useQuery({
    period: period as "7d" | "30d" | "90d" | "1y",
  });
  const { data: trending } = trpc.wishlistManagement.admin.trendingProducts.useQuery({
    limit: 10,
    period: 7,
  });
  const { data: abandoned } = trpc.wishlistManagement.admin.abandonedProducts.useQuery({
    limit: 10,
  });
  const { data: highConverting } = trpc.wishlistManagement.admin.highConvertingProducts.useQuery({
    limit: 10,
  });
  const { data: topFavorited } = trpc.wishlistManagement.admin.topFavorited.useQuery({ limit: 10 });
  const invalidateMut = trpc.wishlistManagement.admin.invalidateCache.useMutation({
    onSuccess: () => {
      toast.success(t("cache_invalidated"));
    },
    onError: () => {
      toast.error(t("cache_invalidated"));
    },
  });

  return (
    <QueryGuard query={{ isLoading }}>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <Heart className="h-6 w-6 text-red-500" />
              {t("analytics_title")}
            </h1>
            <p className="text-muted-foreground">{t("analytics_subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">{t("days_7")}</SelectItem>
                <SelectItem value="30d">{t("days_30")}</SelectItem>
                <SelectItem value="90d">{t("days_90")}</SelectItem>
                <SelectItem value="1y">{t("year_1")}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={invalidateMut.isPending}
              onClick={() => invalidateMut.mutate()}
            >
              {invalidateMut.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                    <Heart className="h-4 w-4" />
                    {t("wishlists")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{summary?.total_wishlists ?? 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                    <TrendingUp className="h-4 w-4" />
                    {t("active_lists")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{summary?.active_wishlists ?? 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                    <Package className="h-4 w-4" />
                    {t("saved_products")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{summary?.total_saved_products ?? 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                    <ShoppingBag className="h-4 w-4" />
                    {t("conversion_rate")}
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
                  <CardTitle className="text-lg">{t("most_wished_products")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("product")}</TableHead>
                        <TableHead className="text-right">{t("adds")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.most_wished_products.map(
                        (p: { product_id: string; name: string; count: number }, i: number) => (
                          <TableRow key={p.product_id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground w-6">{i + 1}.</span>
                                <span className="font-medium">{p.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{p.count}</TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {trending && trending.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t("trending_7d")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("product")}</TableHead>
                          <TableHead className="text-right">{t("signal")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trending.map((p: { product_id: string; count: number }, i: number) => (
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
                    <CardTitle className="text-lg">{t("abandoned_products")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("product")}</TableHead>
                          <TableHead className="text-right">{t("adds_without_purchase")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {abandoned.map((p: { product_id: string; adds: number }) => (
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
                    <CardTitle className="text-lg">{t("high_conversion")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("product")}</TableHead>
                          <TableHead className="text-right">{t("adds")}</TableHead>
                          <TableHead className="text-right">{t("conversions")}</TableHead>
                          <TableHead className="text-right">{t("rate")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {highConverting
                          .slice(0, 5)
                          .map(
                            (p: {
                              product_id: string;
                              adds: number;
                              conversions: number;
                              rate: number;
                            }) => (
                              <TableRow key={p.product_id}>
                                <TableCell>{p.product_id}</TableCell>
                                <TableCell className="text-right">{p.adds}</TableCell>
                                <TableCell className="text-right">{p.conversions}</TableCell>
                                <TableCell className="text-right">{p.rate}%</TableCell>
                              </TableRow>
                            ),
                          )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {topFavorited && topFavorited.products.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t("top_favorited")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("product")}</TableHead>
                          <TableHead className="text-right">{t("favorites")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topFavorited.products.map(
                          (p: { product_id: string; count: number }, i: number) => (
                            <TableRow key={p.product_id}>
                              <TableCell>
                                <span className="text-muted-foreground mr-2">{i + 1}.</span>
                                {p.product_id}
                              </TableCell>
                              <TableCell className="text-right">{p.count}</TableCell>
                            </TableRow>
                          ),
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        }
      </div>
    </QueryGuard>
  );
}
