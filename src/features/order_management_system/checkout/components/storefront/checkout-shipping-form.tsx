"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataState } from "@/components/storefront/data-state";

interface CheckoutShippingFormProps {
  title?: string;
  fields?: { name: string; placeholder: string; fullWidth?: boolean }[];
  values?: Record<string, string>;
  isLoading?: boolean;
  error?: unknown;
  onChange?: (name: string, value: string) => void;
}

export function CheckoutShippingForm({
  title = "Adresse de livraison",
  fields = [],
  values,
  isLoading,
  error,
  onChange,
}: CheckoutShippingFormProps) {
  return (
    <DataState
      isLoading={isLoading}
      error={error}
      isEmpty={false}
      loadingState={
        <Card className="p-6 space-y-4">
          <Skeleton className="h-5 w-48" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className={i >= 4 ? "sm:col-span-2 h-10" : "h-10"} />
            ))}
          </div>
        </Card>
      }
    >
      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <Input
              key={field.name}
              name={field.name}
              placeholder={field.placeholder}
              value={values?.[field.name] ?? ""}
              onChange={(e) => onChange?.(field.name, e.target.value)}
              className={field.fullWidth ? "sm:col-span-2" : undefined}
            />
          ))}
        </div>
      </Card>
    </DataState>
  );
}
