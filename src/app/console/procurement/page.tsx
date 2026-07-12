"use client";

import { Truck, ShoppingCart, CheckCircle } from "lucide-react";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SuppliersListClient, PurchaseOrdersListClient } from "@/features/operations_workflows/components/procurement-client";
import { ReconciliationClient } from "@/features/operations_workflows/components/reconciliation-client";

const TABS = [
  { value: "suppliers", icon: Truck, label: "Fournisseurs" },
  { value: "purchase-orders", icon: ShoppingCart, label: "Bons de commande" },
  { value: "reconciliation", icon: CheckCircle, label: "Réconciliation" },
] as const;

export default function ProcurementPage() {
  return (
    <ConsolePageShell
      title="Approvisionnement"
      subtitle="Gestion des fournisseurs, bons de commande et réconciliation"
    >
      <Tabs defaultValue="suppliers">
        <TabsList>
          {TABS.map(({ value, icon: Icon, label }) => (
            <TabsTrigger key={value} value={value}>
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="suppliers" className="mt-4 space-y-4">
          <SuppliersListClient />
        </TabsContent>

        <TabsContent value="purchase-orders" className="mt-4 space-y-4">
          <PurchaseOrdersListClient />
        </TabsContent>

        <TabsContent value="reconciliation" className="mt-4 space-y-4">
          <ReconciliationClient />
        </TabsContent>
      </Tabs>
    </ConsolePageShell>
  );
}
