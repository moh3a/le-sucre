"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert, PackageOpen } from "lucide-react";
import { trpc } from "@/components/providers/app-providers";
import { SectionHeader } from "@/components/storefront/section-header";
import { BrandCard } from "@/features/product_information_management/brands/components/storefront/brand-card";
import { Empty, EmptyHeader, EmptyTitle, EmptyMedia } from "@/components/ui/empty";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function BrandsContent() {
  const t = useTranslations("brands");
  const [search, setSearch] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const query = trpc.brands.listActive.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const brands = useMemo(() => query.data ?? [], [query.data]);

  const filteredBrands = useMemo(() => {
    let result = brands;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((b) => b.name.toLowerCase().includes(q));
    }
    if (selectedLetter) {
      result = result.filter((b) => b.name.toUpperCase().startsWith(selectedLetter));
    }
    return result;
  }, [brands, search, selectedLetter]);

  const featuredBrands = brands.slice(0, 3);
  const empty = brands.length === 0;

  if (query.isLoading) {
    return (
      <div className="container mx-auto space-y-8 px-4 py-8">
        <section className="text-center">
          <Skeleton className="mx-auto h-8 w-48" />
          <Skeleton className="mx-auto mt-2 h-4 w-64" />
        </section>
        <Separator />
        <section className="mx-auto max-w-md">
          <Skeleton className="h-10 w-full" />
        </section>
        <section className="flex flex-wrap justify-center gap-1">
          {Array.from({ length: 26 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8" />
          ))}
        </section>
        <section>
          <Skeleton className="mb-4 h-6 w-32" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <BrandCard key={i} isLoading variant="featured" />
            ))}
          </div>
        </section>
        <Separator />
        <section>
          <Skeleton className="mb-4 h-6 w-32" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <BrandCard key={i} isLoading variant="list" />
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (query.error) {
    return (
      <div className="container mx-auto space-y-8 px-4 py-8">
        <section className="text-center">
          <h1 className="text-3xl font-bold">{t("title")}</h1>
        </section>
        <Separator />
        <div className="flex items-start justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <AlertTitle>{t("title")}</AlertTitle>
            <AlertDescription>
              {query.error instanceof Error ? query.error.message : t("error_loading")}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="container mx-auto space-y-8 px-4 py-8">
        <section className="text-center">
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
        </section>
        <Separator />
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageOpen className="size-6" />
            </EmptyMedia>
            <EmptyTitle>{t("empty")}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <section className="text-center">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
      </section>

      <Separator />

      <section className="mx-auto max-w-md">
        <Input
          placeholder={t("searchBrands")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedLetter(null);
          }}
        />
      </section>

      <section className="flex flex-wrap justify-center gap-1">
        {ALPHABET.map((letter) => (
          <Button
            key={letter}
            variant={selectedLetter === letter ? "default" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0 font-mono text-xs"
            onClick={() => {
              setSelectedLetter(selectedLetter === letter ? null : letter);
              setSearch("");
            }}
          >
            {letter}
          </Button>
        ))}
      </section>

      {!search && !selectedLetter && (
        <section>
          <SectionHeader title={t("featured")} />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredBrands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} variant="featured" />
            ))}
          </div>
        </section>
      )}

      {!search && !selectedLetter && <Separator />}

      <section>
        <SectionHeader title={t("allBrands")} />
        {filteredBrands.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredBrands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} variant="list" />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <PackageOpen className="size-6" />
                </EmptyMedia>
                <EmptyTitle>{t("no_results")}</EmptyTitle>
              </EmptyHeader>
            </Empty>
          </div>
        )}
      </section>
    </div>
  );
}
