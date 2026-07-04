import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SectionHeader } from "@/components/storefront/section-header";
import { BrandCard } from "@/features/product_information_management/brands/components/storefront/brand-card";
import type { BrandItem } from "@/components/storefront/types";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "brands" });
  return { title: t("title") };
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const MOCK_BRANDS: BrandItem[] = [
  { id: "1", name: "Lindt", slug: "lindt", logo_url: null, product_count: 45 },
  { id: "2", name: "Milka", slug: "milka", logo_url: null, product_count: 32 },
  { id: "3", name: "Ferrero", slug: "ferrero", logo_url: null, product_count: 28 },
  { id: "4", name: "Nestlé", slug: "nestle", logo_url: null, product_count: 51 },
  { id: "5", name: "Côte d'Or", slug: "cote-dor", logo_url: null, product_count: 19 },
  { id: "6", name: "Suchard", slug: "suchard", logo_url: null, product_count: 14 },
  { id: "7", name: "Haribo", slug: "haribo", logo_url: null, product_count: 67 },
  { id: "8", name: "Kinder", slug: "kinder", logo_url: null, product_count: 23 },
  { id: "9", name: "Mon Chéri", slug: "mon-cheri", logo_url: null, product_count: 8 },
  { id: "10", name: "Toblerone", slug: "toblerone", logo_url: null, product_count: 12 },
  { id: "11", name: "Orion", slug: "orion", logo_url: null, product_count: 9 },
  { id: "12", name: "Poulain", slug: "poulain", logo_url: null, product_count: 11 },
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
          <Button key={letter} variant="ghost" size="sm" className="h-8 w-8 p-0 font-mono text-xs">
            {letter}
          </Button>
        ))}
      </section>

      {/* FEATURED BRANDS */}
      <section>
        <SectionHeader title={t("featured")} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_BRANDS.slice(0, 3).map((brand) => (
            <BrandCard key={brand.id} brand={brand} variant="featured" />
          ))}
        </div>
      </section>

      <Separator />

      {/* BRAND GRID */}
      <section>
        <SectionHeader title={t("allBrands")} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {MOCK_BRANDS.map((brand) => (
            <BrandCard key={brand.id} brand={brand} variant="list" />
          ))}
        </div>
      </section>
    </div>
  );
}
