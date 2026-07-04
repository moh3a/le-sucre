"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { DataState } from "@/components/storefront/data-state";
import { cn } from "@/lib/utils";

interface OptionItem {
  id: string;
  name: string;
  description?: string;
  price?: string;
}

interface CheckoutOptionSelectorProps {
  title: string;
  options?: OptionItem[];
  selectedId?: string;
  isLoading?: boolean;
  error?: unknown;
  onChange: (id: string) => void;
  name: string;
}

export function CheckoutOptionSelector({
  title,
  options = [],
  selectedId,
  isLoading,
  error,
  onChange,
  name,
}: CheckoutOptionSelectorProps) {
  return (
    <DataState
      isLoading={isLoading}
      error={error}
      isEmpty={false}
      loadingState={
        <Card className="space-y-4 p-6">
          <Skeleton className="h-5 w-40" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </Card>
      }
    >
      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="space-y-3">
          {options.map((option) => (
            <label
              key={option.id}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors",
                "hover:bg-muted",
                selectedId === option.id && "border-primary bg-primary/5",
              )}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name={name}
                  value={option.id}
                  checked={selectedId === option.id}
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
              {option.price && <span className="text-sm font-medium">{option.price}</span>}
            </label>
          ))}
        </div>
      </Card>
    </DataState>
  );
}
