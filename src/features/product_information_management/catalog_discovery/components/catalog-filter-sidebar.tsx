"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
}: CatalogFilterSidebarProps) {
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
      onPropertyChange(
        code,
        current.filter((v) => v !== valueCode),
      );
    } else {
      onPropertyChange(code, [...current, valueCode]);
    }
  };

  return (
    <div className="w-full space-y-6 rounded-2xl border border-primary-foreground/15 bg-background p-6 shadow-sm">
      <div>
        <h3 className="font-orla mb-4 text-lg text-primary-foreground">Filtres</h3>
        <Separator className="bg-primary-foreground/10" />
      </div>

      {/* Disponibilité */}
      <div className="space-y-3">
        <h4 className="font-orla text-sm tracking-wider text-primary-foreground/80 uppercase">
          Disponibilité
        </h4>
        <div className="flex items-center space-x-3">
          <Checkbox
            id="in_stock_only"
            checked={inStockOnly}
            onCheckedChange={(checked) => onInStockChange(Boolean(checked))}
            className="border-primary-foreground/30 data-[state=checked]:border-crimson-violet data-[state=checked]:bg-crimson-violet"
          />
          <Label
            htmlFor="in_stock_only"
            className="text-secondary font-moya cursor-pointer text-sm select-none"
          >
            En stock uniquement
          </Label>
        </div>
      </div>

      <Separator className="bg-primary-foreground/10" />

      {/* Marques / Enseignes */}
      {facets?.brands && facets.brands.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-orla text-sm tracking-wider text-primary-foreground/80 uppercase">Marques</h4>
          <div className="max-h-48 space-y-2 overflow-y-auto pr-2">
            {facets.brands.map((brand) => (
              <div key={brand.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`brand_${brand.id}`}
                  checked={selectedBrandIds.includes(brand.id)}
                  onCheckedChange={() => handleBrandToggle(brand.id)}
                  className="border-primary-foreground/30 data-[state=checked]:border-crimson-violet data-[state=checked]:bg-crimson-violet"
                />
                <Label
                  htmlFor={`brand_${brand.id}`}
                  className="text-secondary font-moya flex w-full cursor-pointer items-center justify-between text-sm select-none"
                >
                  <span>{brand.name}</span>
                  <span className="text-secondary/40 text-xs font-semibold">({brand.count})</span>
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {facets?.brands && facets.brands.length > 0 && <Separator className="bg-primary-foreground/10" />}

      {/* Prix Slider */}
      <div className="space-y-4">
        <h4 className="font-orla text-sm tracking-wider text-primary-foreground/80 uppercase">
          Prix maximum
        </h4>
        <div className="space-y-2">
          <input
            type="range"
            min={facets?.price?.min ?? 0}
            max={facets?.price?.max ?? 20000}
            value={priceRange[1]}
            onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
            className="w-full cursor-pointer accent-crimson-violet"
          />
          <div className="text-secondary font-moya flex items-center justify-between text-xs">
            <span>{facets?.price?.min ?? 0} DZD</span>
            <span className="font-semibold text-crimson-violet">{priceRange[1]} DZD</span>
          </div>
        </div>
      </div>

      {/* Propriétés dynamiques (Facets) */}
      {facets?.properties?.map((prop) => {
        if (prop.values.length === 0) return null;

        return (
          <div key={prop.code} className="space-y-3 border-t border-primary-foreground/10 pt-4">
            <h4 className="font-orla text-sm tracking-wider text-primary-foreground/80 uppercase">
              {prop.name}
            </h4>
            <div className="space-y-2">
              {prop.values.map((val) => {
                const isChecked = (selectedProperties[prop.code] ?? []).includes(val.code);

                return (
                  <div key={val.code} className="flex items-center space-x-3">
                    <Checkbox
                      id={`prop_${prop.code}_${val.code}`}
                      checked={isChecked}
                      onCheckedChange={() => handlePropertyToggle(prop.code, val.code)}
                      className="border-primary-foreground/30 data-[state=checked]:border-crimson-violet data-[state=checked]:bg-crimson-violet"
                    />
                    <Label
                      htmlFor={`prop_${prop.code}_${val.code}`}
                      className="text-secondary font-moya flex w-full cursor-pointer items-center justify-between text-sm select-none"
                    >
                      <span>{val.label}</span>
                      <span className="text-secondary/40 text-xs font-semibold">({val.count})</span>
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
