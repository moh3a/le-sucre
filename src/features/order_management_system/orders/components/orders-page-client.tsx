"use client";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { OrderStats } from "./order-stats";
import { OrderTable } from "./order-table";
import { OrderCharts } from "./order-charts";
import { CreateOrderDialog } from "./create-order";

export function OrdersContent() {
  return (
    <>
      <OrderCharts />
      <OrderTable />
    </>
  );
}

export function OrdersPageClient() {
  return (
    <ConsolePageShell
      title="Commandes"
      subtitle="Suivi des commandes clients"
      actions={<CreateOrderDialog />}
    >
      <OrderStats />
      <OrdersContent />
    </ConsolePageShell>
  );
}
