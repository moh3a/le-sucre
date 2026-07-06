"use client";

import { Button } from "@/components/ui/button";

interface ProductQuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  ariaLabelDecrease?: string;
  ariaLabelIncrease?: string;
}

export function ProductQuantitySelector({
  value,
  min = 1,
  max = 99,
  onChange,
  ariaLabelDecrease = "Decrease quantity",
  ariaLabelIncrease = "Increase quantity",
}: ProductQuantitySelectorProps) {
  return (
    <div className="flex items-center rounded-md border">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label={ariaLabelDecrease}
      >
        −
      </Button>
      <span className="w-8 text-center text-sm tabular-nums">{value}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label={ariaLabelIncrease}
      >
        +
      </Button>
    </div>
  );
}
