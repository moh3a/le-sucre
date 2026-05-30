"use client";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { OrderStats } from "./order-stats";
import { OrderTable } from "./order-table";

export function OrdersPageClient() {
  return (
    <ConsolePageShell
      title="Commandes"
      subtitle="Suivi des commandes clients"
      stats={<OrderStats />}
    >
      <OrderTable />
    </ConsolePageShell>
  );
}
