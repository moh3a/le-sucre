import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Marques",
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const MOCK_BRANDS = [
  { name: "Lindt", count: 45 },
  { name: "Milka", count: 32 },
  { name: "Ferrero", count: 28 },
  { name: "Nestlé", count: 51 },
  { name: "Côte d'Or", count: 19 },
  { name: "Suchard", count: 14 },
  { name: "Haribo", count: 67 },
  { name: "Kinder", count: 23 },
  { name: "Mon Chéri", count: 8 },
  { name: "Toblerone", count: 12 },
  { name: "Orion", count: 9 },
  { name: "Poulain", count: 11 },
];

export default async function BrandsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "brands" });

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      {/* PAGE HEADER */}
      <section className="text-center">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
      </section>

      <Separator />

      {/* SEARCH BAR */}
      <section className="mx-auto max-w-md">
        <Input placeholder={t("searchBrands")} />
      </section>

      {/* ALPHABETICAL INDEX */}
      <section className="flex flex-wrap justify-center gap-1">
        {ALPHABET.map((letter) => (
          <Button
            key={letter}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 font-mono text-xs"
          >
            {letter}
          </Button>
        ))}
      </section>

      {/* FEATURED BRANDS */}
      <section>
        <h2 className="mb-4 text-xl font-bold">{t("featured")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_BRANDS.slice(0, 3).map((brand) => (
            <Card key={brand.name} className="bg-[#f9f7be]">
              <CardHeader>
                <div className="bg-muted mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full">
                  <span className="text-muted-foreground text-xs">{t("logo")}</span>
                </div>
                <CardTitle className="text-center text-lg">{brand.name}</CardTitle>
                <CardDescription className="text-center">
                  {brand.count} {t("products")}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* BRAND GRID */}
      <section>
        <h2 className="mb-4 text-xl font-bold">{t("allBrands")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {MOCK_BRANDS.map((brand) => (
            <Card key={brand.name}>
              <CardHeader className="flex-row items-center gap-4">
                <div className="bg-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                  <span className="text-muted-foreground text-xs">{t("logo")}</span>
                </div>
                <div>
                  <CardTitle className="text-sm">{brand.name}</CardTitle>
                  <CardDescription>
                    {brand.count} {t("products")}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
