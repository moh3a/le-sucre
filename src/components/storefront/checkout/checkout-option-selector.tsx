"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OptionItem {
  id: string;
  name: string;
  description?: string;
  price?: string;
}

interface CheckoutOptionSelectorProps {
  title: string;
  options: OptionItem[];
  selectedId?: string;
  onChange: (id: string) => void;
  name: string;
}

export function CheckoutOptionSelector({
  title,
  options,
  selectedId,
  onChange,
  name,
}: CheckoutOptionSelectorProps) {
  return (
    <Card className="space-y-4 p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedId === option.id;
          return (
            <label
              key={option.id}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors",
                "hover:bg-muted",
                isSelected && "border-primary bg-primary/5",
              )}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name={name}
                  value={option.id}
                  checked={isSelected}
                  onChange={() => onChange(option.id)}
                  className="accent-primary size-4"
                />
                <div>
                  <p className="font-medium">{option.name}</p>
                  {option.description && (
                    <p className="text-muted-foreground text-sm">{option.description}</p>
                  )}
                </div>
              </div>
              {option.price && (
                <span className="text-sm font-medium">{option.price}</span>
              )}
            </label>
          );
        })}
      </div>
    </Card>
  );
}
