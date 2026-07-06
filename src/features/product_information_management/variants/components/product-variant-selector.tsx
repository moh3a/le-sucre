"use client";

import { Button } from "@/components/ui/button";

interface ProductVariantSelectorProps {
  options: string[];
  selected?: string;
  onChange: (value: string) => void;
  label?: string;
}

export function ProductVariantSelector({
  options,
  selected,
  onChange,
  label,
}: ProductVariantSelectorProps) {
  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option}
            variant={selected === option ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(option)}
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
}
