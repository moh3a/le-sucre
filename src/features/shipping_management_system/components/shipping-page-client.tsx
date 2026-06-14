"use client";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { ShippingStats } from "./shipping-stats";
import { ShippingTable } from "./shipping-table";

export function ShippingPageClient() {
  return (
    <ConsolePageShell
      title="Livraisons"
      subtitle="Suivi des expéditions et transporteurs"
      stats={<ShippingStats />}
    >
      <ShippingTable />
    </ConsolePageShell>
  );
}
