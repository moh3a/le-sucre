"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AddressData } from "@/components/storefront/types";

interface CheckoutShippingFormProps {
  title: string;
  fields: Record<string, string>;
  values?: Partial<AddressData>;
  onChange?: (field: string, value: string) => void;
}

export function CheckoutShippingForm({
  title,
  fields,
  values,
  onChange,
}: CheckoutShippingFormProps) {
  return (
    <Card className="space-y-4 p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Object.entries(fields).map(([name, placeholder], index) => (
          <Input
            key={name}
            name={name}
            placeholder={placeholder}
            value={values?.[name as keyof AddressData] ?? ""}
            onChange={(e) => onChange?.(name, e.target.value)}
            className={
              // last two fields (phone and address) span full width at specific positions
              index >= Object.entries(fields).length - 2
                ? "sm:col-span-2"
                : undefined
            }
          />
        ))}
      </div>
    </Card>
  );
}
