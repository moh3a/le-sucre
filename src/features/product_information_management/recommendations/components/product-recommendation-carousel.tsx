"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import type { RecommendationItem } from "../types";

interface ProductRecommendationCarouselProps {
  title: string;
  items: RecommendationItem[];
  isLoading?: boolean;
}

export function ProductRecommendationCarousel({
  title,
  items,
  isLoading,
}: ProductRecommendationCarouselProps) {
  const t = useTranslations("recommendations");
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = React.useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = React.useState(false);

  const scrollPrev = React.useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = React.useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;

    const updateButtons = () => {
      setPrevBtnEnabled(emblaApi.canScrollPrev());
      setNextBtnEnabled(emblaApi.canScrollNext());
    };

    updateButtons();
    emblaApi.on("select", updateButtons);
    emblaApi.on("reInit", updateButtons);

    return () => {
      emblaApi.off("select", updateButtons);
      emblaApi.off("reInit", updateButtons);
    };
  }, [emblaApi]);

  if (isLoading) {
    return (
      <div className="font-moya space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-secondary/20 bg-background overflow-hidden border">
              <Skeleton className="aspect-square w-full rounded-none" />
              <CardContent className="space-y-2 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <div className="font-moya space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-orla text-primary-foreground text-2xl">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            disabled={!prevBtnEnabled}
            className="border-secondary/30 text-secondary hover:bg-secondary/10 size-8 rounded-full disabled:opacity-50"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            disabled={!nextBtnEnabled}
            className="border-secondary/30 text-secondary hover:bg-secondary/10 size-8 rounded-full disabled:opacity-50"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="min-w-0 flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_22%]"
            >
              <Link href={`/products/${item.slug}`} className="group">
                <Card className="border-primary-foreground/15 bg-background hover:border-crimson-violet/40 flex h-full flex-col overflow-hidden border transition-all duration-300 hover:shadow-lg">
                  <div className="bg-cream/20 relative aspect-square overflow-hidden">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="bg-primary-foreground/5 text-primary-foreground/40 flex h-full w-full items-center justify-center text-xs">
                        {t("no_image")}
                      </div>
                    )}
                  </div>
                  <CardContent className="flex flex-1 flex-col justify-between p-4">
                    <div className="space-y-1">
                      {item.brand_name && (
                        <p className="text-primary-foreground/60 text-[10px] font-semibold tracking-wider uppercase">
                          {item.brand_name}
                        </p>
                      )}
                      <h3 className="font-orla text-primary-foreground group-hover:text-crimson-violet line-clamp-1 text-sm leading-snug transition-colors">
                        {item.name}
                      </h3>
                    </div>
                    <div className="border-primary-foreground/5 text-crimson-violet mt-3 border-t pt-2 text-sm font-semibold">
                      {item.min_price} {item.currency}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
