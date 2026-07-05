"use client";

import { useTranslations } from "next-intl";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CatalogFilterSidebar } from "./catalog-filter-sidebar";
import type { CatalogFacets } from "../types";

interface CatalogMobileFiltersSheetProps {
  facets?: CatalogFacets;
  selectedBrandIds: string[];
  onBrandChange: (ids: string[]) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  inStockOnly: boolean;
  onInStockChange: (value: boolean) => void;
  selectedProperties: Record<string, string[]>;
  onPropertyChange: (code: string, values: string[]) => void;
  activeFilterCount: number;
}

export function CatalogMobileFiltersSheet({
  facets,
  selectedBrandIds,
  onBrandChange,
  priceRange,
  onPriceChange,
  inStockOnly,
  onInStockChange,
  selectedProperties,
  onPropertyChange,
  activeFilterCount,
}: CatalogMobileFiltersSheetProps) {
  const t = useTranslations("catalog");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative gap-2">
          <SlidersHorizontal className="size-4" />
          {t("filter")}
          {activeFilterCount > 0 && (
            <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0 sm:w-[350px]">
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <SlidersHorizontal className="size-4" />
            {t("all_filters")}
          </SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <CatalogFilterSidebar
            facets={facets}
            selectedBrandIds={selectedBrandIds}
            onBrandChange={onBrandChange}
            priceRange={priceRange}
            onPriceChange={onPriceChange}
            inStockOnly={inStockOnly}
            onInStockChange={onInStockChange}
            selectedProperties={selectedProperties}
            onPropertyChange={onPropertyChange}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
