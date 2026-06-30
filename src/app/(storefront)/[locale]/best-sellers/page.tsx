import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Meilleures ventes",
};

const CATEGORIES = ["Tous", "Pâtisserie", "Chocolats", "Confiseries", "Sucettes"];

export default async function BestSellersPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bestSellers" });

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      {/* PAGE HEADER */}
      <section className="flex items-center gap-3">
        <span className="text-3xl" role="img" aria-label="trophy">
          🏆
        </span>
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("description")}</p>
        </div>
      </section>

      <Separator />

      {/* TOP RANKED PRODUCTS */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">{t("topRanked")}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex-row items-center gap-4">
                <span className="bg-[#c8d152] flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-[#4d4c20]">
                  {i + 1}
                </span>
                <div>
                  <CardTitle className="text-base">{t("productName", { rank: i + 1 })}</CardTitle>
                  <CardDescription>
                    {i < 3 ? (
                      <Badge variant="default" className="mt-1">
                        {t("topPick")}
                      </Badge>
                    ) : (
                      <span>{t("rating", { stars: 5 - (i % 3) })}</span>
                    )}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted h-20 w-full rounded-lg" />
              </CardContent>
              <CardFooter className="justify-between">
                <span className="font-semibold">{`${(i + 1) * 5}€`}</span>
                <Button size="sm">{t("addToCart")}</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* CATEGORY TOP SELLERS */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">{t("categoryTop")}</h2>
        <Tabs defaultValue="Tous">
          <TabsList className="mb-6">
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat} value={cat}>
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
          {CATEGORIES.map((cat) => (
            <TabsContent key={cat} value={cat}>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((p) => (
                  <Card key={p}>
                    <CardContent className="p-0">
                      <div className="bg-muted aspect-square w-full rounded-lg" />
                    </CardContent>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        {t("categoryProduct", { category: cat, index: p })}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      <Separator />

      {/* TRENDING NOW */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">{t("trending")}</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="min-w-[180px] shrink-0">
              <CardContent className="p-0">
                <div className="bg-muted aspect-square w-full rounded-lg" />
              </CardContent>
              <CardHeader>
                <CardTitle className="text-sm">{t("trendingProduct", { index: i })}</CardTitle>
                <Badge variant="outline" className="mt-1 w-fit">
                  {t("trending")}
                </Badge>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
