"use client";

import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CircleAlert, Gift, Heart, Share2, PackageOpen } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/components/providers/app-providers";
import { Link } from "@/i18n/navigation";

interface SharedCollectionPageClientProps {
  token: string;
}

export function SharedCollectionPageClient({ token }: SharedCollectionPageClientProps) {
  const t = useTranslations("sharedCollection");

  const { data, isLoading, error } = trpc.wishlistManagement.collections.getSharedByToken.useQuery({ token });

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-12 px-4 py-8">
        <section className="text-center">
          <Skeleton className="mx-auto mb-4 h-10 w-64" />
          <Skeleton className="mx-auto h-5 w-96" />
          <div className="mt-4 flex items-center justify-center gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-36 rounded-full" />
          </div>
        </section>

        <Separator />

        <section>
          <Skeleton className="mb-6 h-8 w-48" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="mb-4 h-48 w-full rounded-lg" />
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-36" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="size-9 rounded-md" />
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-9 w-32 rounded-md" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-start justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <AlertTitle>{t("error_title")}</AlertTitle>
            <AlertDescription>{t("error_description")}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!data || !data.collection) {
    return (
      <div className="container mx-auto space-y-12 px-4 py-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageOpen className="size-6" />
            </EmptyMedia>
            <EmptyTitle>{t("empty_title")}</EmptyTitle>
            <EmptyDescription>{t("empty_description")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const { collection, items } = data;

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      <section className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{collection.name}</h1>
        {collection.description && (
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            {collection.description}
          </p>
        )}
        <div className="mt-4 flex items-center justify-center gap-2">
          <Badge variant="outline">{t("itemsLabel", { count: items.length })}</Badge>
          <Badge variant="secondary">
            {t("tokenLabel", { token: token.slice(0, 8) })}
          </Badge>
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="mb-6 text-2xl font-bold">{t("productsTitle")}</h2>
        {items.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Gift className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t("empty_items_title")}</EmptyTitle>
              <EmptyDescription>{t("empty_items_description")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="bg-muted mb-4 flex h-48 items-center justify-center rounded-lg">
                    {item.product?.media?.[0]?.url ? (
                      <img
                        src={item.product.media[0].url}
                        alt=""
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        {t("productImageAlt")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {item.product?.translations?.[0]?.name ?? item.product_id}
                      </CardTitle>
                      <CardDescription>
                        {item.product
                          ? `${item.product.base_price} ${item.product.currency}`
                          : ""}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Heart className="size-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span />
                  <Button size="sm">{t("addToCart")}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
