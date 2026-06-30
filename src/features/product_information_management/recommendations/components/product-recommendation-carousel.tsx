"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
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
        <div className="bg-muted h-8 w-48 animate-pulse rounded" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="border-secondary/20 animate-pulse overflow-hidden border bg-white"
            >
              <div className="bg-muted aspect-square" />
              <CardContent className="space-y-2 p-4">
                <div className="bg-muted h-4 w-3/4 rounded" />
                <div className="bg-muted h-4 w-1/2 rounded" />
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
        <h2 className="font-orla text-2xl text-[#4d4c20]">{title}</h2>
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
                <Card className="flex h-full flex-col overflow-hidden border border-[#4d4c20]/15 bg-white transition-all duration-300 hover:border-[#700145]/40 hover:shadow-lg">
                  <div className="relative aspect-square overflow-hidden bg-[#fff3e3]/20">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#4d4c20]/5 text-xs text-[#4d4c20]/40">
                        Aucune image
                      </div>
                    )}
                  </div>
                  <CardContent className="flex flex-1 flex-col justify-between p-4">
                    <div className="space-y-1">
                      {item.brand_name && (
                        <p className="text-[10px] font-semibold tracking-wider text-[#4d4c20]/60 uppercase">
                          {item.brand_name}
                        </p>
                      )}
                      <h3 className="font-orla line-clamp-1 text-sm leading-snug text-[#4d4c20] transition-colors group-hover:text-[#700145]">
                        {item.name}
                      </h3>
                    </div>
                    <div className="mt-3 border-t border-[#4d4c20]/5 pt-2 text-sm font-semibold text-[#700145]">
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
