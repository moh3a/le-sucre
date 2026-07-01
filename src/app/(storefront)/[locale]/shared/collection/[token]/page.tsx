import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, Share2 } from "lucide-react";
import Link from "next/link";

type Props = {
  params: Promise<{ locale: string; token: string }>;
};

type CollectionItem = {
  nameKey: string;
  priceKey: string;
  badgeKey: string | null;
};

const ITEMS: CollectionItem[] = [
  { nameKey: "item1_name", priceKey: "item1_price", badgeKey: "badge_new" },
  { nameKey: "item2_name", priceKey: "item2_price", badgeKey: "badge_popular" },
  { nameKey: "item3_name", priceKey: "item3_price", badgeKey: "badge_season" },
  { nameKey: "item4_name", priceKey: "item4_price", badgeKey: null },
  { nameKey: "item5_name", priceKey: "item5_price", badgeKey: "badge_set" },
  { nameKey: "item6_name", priceKey: "item6_price", badgeKey: null },
];

export async function generateMetadata({ params }: Props): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sharedCollection" });
  return { title: t("title") };
}

export default async function SharedCollectionPage({ params }: Props) {
  const { locale, token } = await params;
  const t = await getTranslations({ locale, namespace: "sharedCollection" });

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      <section className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">{t("subtitle")}</p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <Badge variant="outline">{t("itemsLabel", { count: ITEMS.length })}</Badge>
          <Badge variant="secondary">{t("tokenLabel", { token: token.slice(0, 8) })}</Badge>
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="mb-6 text-2xl font-bold">{t("productsTitle")}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item) => (
            <Card key={item.nameKey}>
              <CardHeader>
                <div className="bg-muted mb-4 flex h-48 items-center justify-center rounded-lg">
                  <span className="text-muted-foreground text-sm">{t("productImageAlt")}</span>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{t(item.nameKey)}</CardTitle>
                    <CardDescription>{t(item.priceKey)}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Heart className="size-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                {item.badgeKey ? (
                  <Badge variant="secondary">{t(item.badgeKey)}</Badge>
                ) : (
                  <span />
                )}
                <Button size="sm">{t("addToCart")}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      <section className="text-center">
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <CardTitle>{t("ctaTitle")}</CardTitle>
            <CardDescription>{t("ctaDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-4">
            <Button>
              <Share2 className="mr-2 size-4" />
              {t("createCollection")}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/account/wishlists">{t("login")}</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
