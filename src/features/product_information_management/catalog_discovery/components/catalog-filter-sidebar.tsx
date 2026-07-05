"use client";

import { useTranslations } from "next-intl";
import { SlidersHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { CatalogFacets } from "../types";

interface CatalogFilterSidebarProps {
  facets?: CatalogFacets;
  selectedBrandIds: string[];
  onBrandChange: (ids: string[]) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  inStockOnly: boolean;
  onInStockChange: (value: boolean) => void;
  selectedProperties: Record<string, string[]>;
  onPropertyChange: (code: string, values: string[]) => void;
  className?: string;
}

export function CatalogFilterSidebar({
  facets,
  selectedBrandIds,
  onBrandChange,
  priceRange,
  onPriceChange,
  inStockOnly,
  onInStockChange,
  selectedProperties,
  onPropertyChange,
  className,
}: CatalogFilterSidebarProps) {
  const t = useTranslations("catalog");

  const hasActiveFilters =
    inStockOnly ||
    selectedBrandIds.length > 0 ||
    priceRange[1] < (facets?.price?.max ?? 20000) ||
    Object.values(selectedProperties).some((v) => v.length > 0);

  const activeFilterCount =
    (inStockOnly ? 1 : 0) +
    selectedBrandIds.length +
    (priceRange[1] < (facets?.price?.max ?? 20000) ? 1 : 0) +
    Object.values(selectedProperties).reduce((sum, v) => sum + v.length, 0);

  const handleClearAll = () => {
    onBrandChange([]);
    onPriceChange([0, facets?.price?.max ?? 20000]);
    onInStockChange(false);
    Object.keys(selectedProperties).forEach((code) => onPropertyChange(code, []));
  };

  const handleBrandToggle = (brandId: string) => {
    if (selectedBrandIds.includes(brandId)) {
      onBrandChange(selectedBrandIds.filter((id) => id !== brandId));
    } else {
      onBrandChange([...selectedBrandIds, brandId]);
    }
  };

  const handlePropertyToggle = (code: string, valueCode: string) => {
    const current = selectedProperties[code] ?? [];
    if (current.includes(valueCode)) {
      onPropertyChange(code, current.filter((v) => v !== valueCode));
    } else {
      onPropertyChange(code, [...current, valueCode]);
    }
  };

  return (
    <div className={cn("w-full space-y-1", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-1 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4" />
          <span className="text-sm font-semibold">{t("filters")}</span>
          {activeFilterCount > 0 && (
            <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-muted-foreground h-auto px-2 py-1 text-xs"
          >
            {t("clear_all")}
          </Button>
        )}
      </div>

      <Separator />

      <ScrollArea className="h-[calc(100vh-14rem)]">
        <div className="space-y-1 py-2">
          {/* In Stock */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex w-full items-center justify-between px-1 py-2.5 text-sm font-medium hover:no-underline">
              {t("in_stock")}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-1 pb-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="in_stock_only"
                  checked={inStockOnly}
                  onCheckedChange={(checked) => onInStockChange(Boolean(checked))}
                />
                <Label htmlFor="in_stock_only" className="cursor-pointer text-sm">
                  {t("in_stock")}
                </Label>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Price */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex w-full items-center justify-between px-1 py-2.5 text-sm font-medium hover:no-underline">
              {t("price")}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 px-1 pb-3">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder={t("min_price")}
                  value={priceRange[0]}
                  onChange={(e) =>
                    onPriceChange([Number(e.target.value) || 0, priceRange[1]])
                  }
                  className="h-8 text-xs"
                  min={0}
                  max={facets?.price?.max ?? 20000}
                />
                <span className="text-muted-foreground shrink-0 text-xs">—</span>
                <Input
                  type="number"
                  placeholder={t("max_price")}
                  value={priceRange[1]}
                  onChange={(e) =>
                    onPriceChange([priceRange[0], Number(e.target.value) || 0])
                  }
                  className="h-8 text-xs"
                  min={0}
                  max={facets?.price?.max ?? 20000}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{facets?.price?.min ?? 0} DZD</span>
                <span>{facets?.price?.max ?? 20000} DZD</span>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Brands */}
          {facets?.brands && facets.brands.length > 0 && (
            <>
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex w-full items-center justify-between px-1 py-2.5 text-sm font-medium hover:no-underline">
                  {t("brands")}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 px-1 pb-2">
                  {facets.brands.map((brand) => (
                    <div key={brand.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`brand_${brand.id}`}
                        checked={selectedBrandIds.includes(brand.id)}
                        onCheckedChange={() => handleBrandToggle(brand.id)}
                      />
                      <Label
                        htmlFor={`brand_${brand.id}`}
                        className="flex w-full cursor-pointer items-center justify-between text-sm"
                      >
                        <span>{brand.name}</span>
                        <span className="text-muted-foreground/40 text-[11px] font-semibold">
                          ({brand.count})
                        </span>
                      </Label>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
              <Separator />
            </>
          )}

          {/* Properties (variants) */}
          {facets?.properties?.map((prop) => {
            if (prop.values.length === 0) return null;

            return (
              <div key={prop.code}>
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex w-full items-center justify-between px-1 py-2.5 text-sm font-medium hover:no-underline">
                    {prop.name}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 px-1 pb-2">
                    {prop.values.map((val) => {
                      const isChecked = (selectedProperties[prop.code] ?? []).includes(val.code);

                      return (
                        <div key={val.code} className="flex items-center gap-2">
                          <Checkbox
                            id={`prop_${prop.code}_${val.code}`}
                            checked={isChecked}
                            onCheckedChange={() => handlePropertyToggle(prop.code, val.code)}
                          />
                          <Label
                            htmlFor={`prop_${prop.code}_${val.code}`}
                            className="flex w-full cursor-pointer items-center justify-between text-sm"
                          >
                            <span>{val.label}</span>
                            <span className="text-muted-foreground/40 text-[11px] font-semibold">
                              ({val.count})
                            </span>
                          </Label>
                        </div>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
                <Separator />
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
