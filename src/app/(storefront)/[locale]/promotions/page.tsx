import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { SectionHeader } from "@/components/storefront/section-header";
import { PromotionCouponCard } from "@/features/order_management_system/promotions/components/storefront/promotion-coupon-card";
import { PromotionTieredOffer } from "@/features/order_management_system/promotions/components/storefront/promotion-tiered-offer";
import { PromotionLoyaltyCard } from "@/features/order_management_system/promotions/components/storefront/promotion-loyalty-card";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Promotions",
};

export default async function PromotionsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "promotions" });

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      {/* ACTIVE PROMOTIONS BANNERS */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">{t("activeBanners")}</h2>
        <Carousel className="mx-auto w-full max-w-5xl">
          <CarouselContent>
            {[1, 2, 3].map((i) => (
              <CarouselItem key={i}>
                <div className="flex h-64 items-center justify-center rounded-lg bg-linear-to-r from-primary to-chiffon">
                  <p className="text-2xl font-semibold text-primary-foreground">
                    {t("bannerPlaceholder", { index: i })}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      <Separator />

      {/* COUPON CODES */}
      <section>
        <SectionHeader title={t("couponCodes")} />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {["BIENVENUE10", "LIVRAISON", "SUCRE15"].map((code) => (
            <PromotionCouponCard
              key={code}
              coupon={{
                code,
                description: t("couponDescription", { code }),
                discount_label: "",
              }}
            />
          ))}
        </div>
      </section>

      <Separator />

      {/* TIERED OFFERS */}
      <PromotionTieredOffer
        title={t("tieredOffers")}
        description={t("achetezPlus")}
        offers={[
          { threshold: "50€", label: "Économisez 5%", description: t("tierDescription", { min: "50€" }) },
          { threshold: "100€", label: "Économisez 10%", description: t("tierDescription", { min: "100€" }) },
          { threshold: "200€", label: "Économisez 15%", description: t("tierDescription", { min: "200€" }) },
        ]}
      />

      <Separator />

      {/* LOYALTY PROGRAM */}
      <PromotionLoyaltyCard
        title={t("loyaltyProgram")}
        description={t("loyaltyDescription")}
        pointsLabel={t("earnPoints")}
        ctaLabel={t("learnMore")}
      />

      <Separator />

      {/* FLASH SALES TEASER */}
      <section className="text-center">
        <h2 className="mb-2 text-2xl font-bold">{t("flashSales")}</h2>
        <p className="text-muted-foreground mb-4">{t("flashTeaser")}</p>
        <Button variant="default">{t("viewFlashSales")}</Button>
      </section>
    </div>
  );
}
