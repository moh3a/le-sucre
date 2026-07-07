"use client";

import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { SectionHeader } from "@/components/storefront/section-header";
import { PromotionCouponCard } from "@/features/order_management_system/promotions/components/storefront/promotion-coupon-card";
import { PromotionTieredOffer } from "@/features/order_management_system/promotions/components/storefront/promotion-tiered-offer";
import { PromotionLoyaltyCard } from "@/features/order_management_system/promotions/components/storefront/promotion-loyalty-card";
import { CircleAlert, Gift } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { trpc } from "@/components/providers/app-providers";
import { PromotionsPageSkeleton } from "./promotions-page-skeleton";
import type { AppLocale } from "@/i18n/config";

interface PromotionsPageClientProps {
  locale: AppLocale;
}

export function PromotionsPageClient({ locale }: PromotionsPageClientProps) {
  const t = useTranslations("promotions");

  const { data, isLoading, error } = trpc.promotions.storefrontPromotions.useQuery();

  if (isLoading) {
    return <PromotionsPageSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-start justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <AlertTitle>{t("error_title")}</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : t("error_description")}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const promotions = data?.promotions ?? [];
  const promo_codes = data?.promo_codes ?? [];

  const banners = promotions.filter(
    (p) => p.promotion_type === "automatic" || p.promotion_type === "customer",
  );

  const coupon_promotions = promotions.filter(
    (p) => p.promotion_type === "promo_code",
  );
  const coupon_codes_by_promotion = new Map<string, (typeof promo_codes)[number]>();
  for (const pc of promo_codes) {
    if (!coupon_codes_by_promotion.has(pc.promotion_id)) {
      coupon_codes_by_promotion.set(pc.promotion_id, pc);
    }
  }

  const tiered_promotions = promotions.filter(
    (p) =>
      p.promotion_type === "automatic" &&
      p.rules.some((r) => r.min_subtotal != null && Number(r.min_subtotal) > 0),
  );

  const empty = promotions.length === 0;

  if (empty && !promo_codes.length) {
    return (
      <div className="container mx-auto space-y-12 px-4 py-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Gift className="size-6" />
            </EmptyMedia>
            <EmptyTitle>{t("empty_title")}</EmptyTitle>
            <EmptyDescription>{t("empty_description")}</EmptyDescription>
          </EmptyHeader>
        </Empty>

        <Separator />

        <PromotionLoyaltyCard
          title={t("loyaltyProgram")}
          description={t("loyaltyDescription")}
          pointsLabel={t("earnPoints")}
          ctaLabel={t("learnMore")}
        />

        <Separator />

        <section className="text-center">
          <h2 className="mb-2 text-2xl font-bold">{t("flashSales")}</h2>
          <p className="text-muted-foreground mb-4">{t("flashTeaser")}</p>
          <Button variant="default" asChild>
            <a href={`/${locale}/flash-sales`}>{t("viewFlashSales")}</a>
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      {banners.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-bold">{t("activeBanners")}</h2>
          <Carousel className="mx-auto w-full max-w-5xl">
            <CarouselContent>
              {banners.map((promo) => (
                <CarouselItem key={promo.id}>
                  <div className="flex h-64 flex-col items-center justify-center rounded-lg bg-linear-to-r from-primary to-chiffon p-8 text-center">
                    <h3 className="mb-2 text-2xl font-semibold text-primary-foreground">
                      {promo.name}
                    </h3>
                    {promo.description && (
                      <p className="max-w-lg text-primary-foreground/80">
                        {promo.description}
                      </p>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </section>
      )}

      {banners.length > 0 && <Separator />}

      {coupon_promotions.length > 0 && promo_codes.length > 0 && (
        <section>
          <SectionHeader title={t("couponCodes")} />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coupon_promotions.map((promo) => {
              const matched = coupon_codes_by_promotion.get(promo.id);
              if (!matched) return null;
              return (
                <PromotionCouponCard
                  key={promo.id}
                  coupon={{
                    code: matched.code,
                    description: promo.description ?? matched.code,
                    discount_label: "",
                  }}
                />
              );
            })}
          </div>
        </section>
      )}

      {coupon_promotions.length > 0 && promo_codes.length > 0 && <Separator />}

      {tiered_promotions.map((promo) => {
        const tiers = promo.rules
          .filter((r) => r.min_subtotal != null && Number(r.min_subtotal) > 0)
          .sort((a, b) => Number(a.min_subtotal) - Number(b.min_subtotal))
          .map((rule) => ({
            threshold: `${rule.min_subtotal}€`,
            label:
              rule.discount_type === "percent"
                ? `${t("economisezPercent", { value: rule.discount_value })}`
                : `${t("economisezFixed", { value: rule.discount_value })}`,
            description: t("tierDescription", {
              min: `${rule.min_subtotal}€`,
            }),
          }));

        if (!tiers.length) return null;

        return (
          <div key={promo.id}>
            <PromotionTieredOffer
              title={promo.name}
              description={promo.description ?? undefined}
              offers={tiers}
            />
            <Separator />
          </div>
        );
      })}

      <PromotionLoyaltyCard
        title={t("loyaltyProgram")}
        description={t("loyaltyDescription")}
        pointsLabel={t("earnPoints")}
        ctaLabel={t("learnMore")}
      />

      <Separator />

      <section className="text-center">
        <h2 className="mb-2 text-2xl font-bold">{t("flashSales")}</h2>
        <p className="text-muted-foreground mb-4">{t("flashTeaser")}</p>
        <Button variant="default" asChild>
          <a href={`/${locale}/flash-sales`}>{t("viewFlashSales")}</a>
        </Button>
      </section>
    </div>
  );
}
