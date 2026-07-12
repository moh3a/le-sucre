"use client";

import { RotateCcw, ShieldCheck } from "lucide-react";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReturnsContent } from "@/features/order_management_system/return_replacement/components/admin-returns-page-client";
import { RMAContent } from "@/features/operations_workflows/components/rma-client";

const TABS = [
  { value: "returns", icon: RotateCcw, label: "Retours" },
  { value: "rma", icon: ShieldCheck, label: "RMA" },
] as const;

export default function ReturnsPage() {
  return (
    <ConsolePageShell
      title="Retours & RMA"
      subtitle="Gestion des retours clients et autorisations de retour"
    >
      <Tabs defaultValue="returns">
        <TabsList>
          {TABS.map(({ value, icon: Icon, label }) => (
            <TabsTrigger key={value} value={value}>
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="returns" className="mt-4 space-y-4">
          <ReturnsContent />
        </TabsContent>

        <TabsContent value="rma" className="mt-4 space-y-4">
          <RMAContent />
        </TabsContent>
      </Tabs>
    </ConsolePageShell>
  );
}
