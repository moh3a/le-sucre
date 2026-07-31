"use client";

import {
  AlertTriangle,
  BarChart3,
  Boxes,
  History,
  TrendingUpDown,
  Warehouse,
} from "lucide-react";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryStats } from "./inventory-stats";
import { InventoryCharts } from "./inventory-charts";
import { InventoryStockTable } from "./inventory-stock-table";
import { InventoryMovementsTable } from "./inventory-movements-table";
import { InventoryWarehousesSection } from "./inventory-warehouses-section";
import { InventoryForecastTable } from "./inventory-forecast-table";
import { InventoryAlertsTable } from "./inventory-alerts-table";
import { RecordStockDialog } from "./record-stock-dialog";

const TABS = [
  { value: "stock", icon: Boxes, label: "Stock" },
  { value: "movements", icon: History, label: "Mouvements" },
  { value: "warehouses", icon: Warehouse, label: "Entrepôts" },
  { value: "forecast", icon: TrendingUpDown, label: "Prévisions" },
  { value: "alerts", icon: AlertTriangle, label: "Alertes" },
  { value: "charts", icon: BarChart3, label: "Analytiques" },
] as const;

export function InventoryPageClient() {
  return (
    <ConsolePageShell
      title="Inventaire"
      subtitle="Gestion des stocks, entrepôts, mouvements et prévisions"
      actions={<RecordStockDialog />}
      stats={<InventoryStats />}
      tabs={
        <Tabs defaultValue="stock">
          <TabsList>
            {TABS.map(({ value, icon: Icon, label }) => (
              <TabsTrigger key={value} value={value}>
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="stock" className="mt-4 space-y-4">
            <InventoryStockTable />
          </TabsContent>

          <TabsContent value="movements" className="mt-4 space-y-4">
            <InventoryMovementsTable />
          </TabsContent>

          <TabsContent value="warehouses" className="mt-4 space-y-4">
            <InventoryWarehousesSection />
          </TabsContent>

          <TabsContent value="forecast" className="mt-4 space-y-4">
            <InventoryForecastTable />
          </TabsContent>

          <TabsContent value="alerts" className="mt-4 space-y-4">
            <InventoryAlertsTable />
          </TabsContent>

          <TabsContent value="charts" className="mt-4 space-y-4">
            <InventoryCharts />
          </TabsContent>
        </Tabs>
      }
    />
  );
}
