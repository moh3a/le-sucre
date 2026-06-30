import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

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
                <div className="flex h-64 items-center justify-center rounded-lg bg-gradient-to-r from-[#c8d152] to-[#f9f7be]">
                  <p className="text-2xl font-semibold text-[#4d4c20]">
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
        <h2 className="mb-6 text-2xl font-bold">{t("couponCodes")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {["BIENVENUE10", "LIVRAISON", "SUCRE15"].map((code) => (
            <Card key={code}>
              <CardHeader>
                <CardTitle className="font-mono text-lg">{code}</CardTitle>
                <CardDescription>
                  {t("couponDescription", { code })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Input value={code} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="sm">
                  {t("copy")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* TIERED OFFERS */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">{t("tieredOffers")}</h2>
        <p className="text-muted-foreground mb-4">{t("achetezPlus")}</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { min: "50€", label: "Économisez 5%" },
            { min: "100€", label: "Économisez 10%" },
            { min: "200€", label: "Économisez 15%" },
          ].map((tier) => (
            <Card key={tier.min}>
              <CardHeader className="text-center">
                <Badge variant="secondary" className="mb-2 self-center">
                  {tier.min}
                </Badge>
                <CardTitle className="text-xl">{tier.label}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-sm">
                  {t("tierDescription", { min: tier.min })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* LOYALTY PROGRAM */}
      <section>
        <Card className="bg-[#fff3e3]">
          <CardHeader>
            <CardTitle>{t("loyaltyProgram")}</CardTitle>
            <CardDescription>{t("loyaltyDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            <Badge variant="outline" className="text-sm">
              {t("earnPoints")}
            </Badge>
            <Button>{t("learnMore")}</Button>
          </CardContent>
        </Card>
      </section>

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
