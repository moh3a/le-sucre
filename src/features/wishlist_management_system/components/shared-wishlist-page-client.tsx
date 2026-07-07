"use client";

import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CircleAlert, Gift, PackageOpen } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/components/providers/app-providers";

export function SharedWishlistPageClient({ token }: { token: string }) {
  const t = useTranslations("sharedWishlist");

  const { data, isLoading, error } = trpc.wishlistManagement.sharedWishlists.getByToken.useQuery({ token });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl py-6">
        <div className="mb-8 space-y-2 text-center">
          <Skeleton className="mx-auto h-8 w-64" />
          <Skeleton className="mx-auto h-4 w-48" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
              <Skeleton className="size-16 shrink-0 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
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

  if (!data || !data.wishlist) {
    return (
      <div className="container mx-auto px-4 py-8">
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

  const { wishlist, items } = data as any;

  return (
    <div className="container mx-auto max-w-3xl py-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">{wishlist.name}</h1>
        {wishlist.description && (
          <p className="text-muted-foreground mt-2">{wishlist.description}</p>
        )}
        <p className="text-muted-foreground mt-1 text-sm">
          {t("itemsLabel", { count: items.length })}
        </p>
      </div>

      <div className="space-y-2">
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
          items.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-lg border p-4"
            >
              {item.product?.media?.[0]?.url ? (
                <img
                  src={item.product.media[0].url}
                  alt=""
                  className="size-16 shrink-0 rounded-md object-cover"
                />
              ) : (
                <div className="bg-muted flex size-16 shrink-0 items-center justify-center rounded-md">
                  <span className="text-muted-foreground text-xs">?</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {item.product?.translations?.[0]?.name ?? item.product_id}
                </p>
                <p className="text-muted-foreground text-sm">
                  {t("quantityLabel", { quantity: item.quantity })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {item.current_price && (
                  <p className="font-semibold">{item.current_price} DA</p>
                )}
                <Button size="sm">{t("addToCart")}</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
