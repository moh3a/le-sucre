import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Récemment consultés",
};

const hasProducts = false;

export default async function RecentlyViewedPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "recentlyViewed" });

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      {/* PAGE HEADER */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
        <Button variant="outline" size="sm">
          {t("clearHistory")}
        </Button>
      </section>

      <Separator />

      {hasProducts ? (
        /* PRODUCT GRID */
        <section>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                </CardContent>
                <CardHeader>
                  <Skeleton className="mb-1 h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    {t("viewProduct")}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      ) : (
        /* EMPTY STATE */
        <section className="py-16 text-center">
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle>{t("emptyTitle")}</CardTitle>
              <CardDescription>{t("emptyDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button variant="link">{t("shopNow")}</Button>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
