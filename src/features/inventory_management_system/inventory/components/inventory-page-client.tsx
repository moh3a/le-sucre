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

export function InventoryPageClient() {
  return (
    <ConsolePageShell
      title="Inventaire"
      subtitle="Gestion complète des stocks, entrepôts, mouvements et prévisions"
      actions={<RecordStockDialog />}
      stats={<InventoryStats />}
      tabs={
        <Tabs defaultValue="stock">
          <TabsList>
            <TabsTrigger value="stock">
              <Boxes className="mr-2 h-4 w-4" />
              Stock
            </TabsTrigger>
            <TabsTrigger value="movements">
              <History className="mr-2 h-4 w-4" />
              Mouvements
            </TabsTrigger>
            <TabsTrigger value="warehouses">
              <Warehouse className="mr-2 h-4 w-4" />
              Entrepôts
            </TabsTrigger>
            <TabsTrigger value="forecast">
              <TrendingUpDown className="mr-2 h-4 w-4" />
              Prévisions
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Alertes
            </TabsTrigger>
            <TabsTrigger value="charts">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytiques
            </TabsTrigger>
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
