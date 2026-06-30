import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Nouveautés",
};

export default async function NewArrivalsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "newArrivals" });

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      {/* PAGE HEADER */}
      <section className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("description")}</p>
        </div>
        <Badge variant="default" className="shrink-0">
          {t("nouveau")}
        </Badge>
      </section>

      <Separator />

      {/* FILTER BAR */}
      <section className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{t("category")}</span>
          <div className="bg-muted h-9 w-40 animate-pulse rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{t("sort")}</span>
          <div className="bg-muted h-9 w-36 animate-pulse rounded-full" />
        </div>
      </section>

      {/* PRODUCT GRID */}
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
                <Skeleton className="mt-1 h-3 w-1/3" />
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

      <Separator />

      {/* PAGINATION */}
      <section className="flex items-center justify-center gap-2">
        {[1, 2, 3, "...", 12].map((page, i) => (
          <Button
            key={i}
            variant={page === 1 ? "default" : "outline"}
            size="sm"
            className="min-w-9"
            disabled={page === "..."}
          >
            {page}
          </Button>
        ))}
      </section>
    </div>
  );
}
