import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "brandDetail" });
  return {
    title: `${t("brand")} : ${slug.replace(/-/g, " ")}`,
  };
}

export default async function BrandDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "brandDetail" });

  if (!slug) {
    notFound();
  }

  const brandName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      {/* BRAND HEADER */}
      <section className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div className="bg-muted flex h-24 w-24 shrink-0 items-center justify-center rounded-full">
          <span className="text-muted-foreground text-sm">{t("logo")}</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold">{brandName}</h1>
          <p className="text-muted-foreground mt-2">{t("brandDescription")}</p>
          <Button variant="link" className="mt-1 h-auto p-0">
            {t("visitWebsite")}
          </Button>
        </div>
      </section>

      <Separator />

      {/* BRAND PRODUCTS */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">{t("products")}</h2>
          <div className="flex gap-2">
            {[t("all"), t("categoryPlaceholder")].map((cat) => (
              <Badge key={cat} variant={cat === t("all") ? "default" : "outline"}>
                {cat}
              </Badge>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
            <Card key={p}>
              <CardContent className="p-0">
                <div className="bg-muted aspect-square w-full rounded-lg" />
              </CardContent>
              <CardHeader>
                <CardTitle className="text-sm">
                  {t("productName", { brand: brandName, index: p })}
                </CardTitle>
                <CardDescription>{`${p * 3}€`}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button size="sm" className="w-full">
                  {t("addToCart")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* ABOUT BRAND */}
      <section>
        <h2 className="mb-4 text-2xl font-bold">{t("about")}</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed">
              {t("aboutText", { brand: brandName })}
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
