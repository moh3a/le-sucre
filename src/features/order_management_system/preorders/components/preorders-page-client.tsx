"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Hash, Hourglass, PackageCheck, PackageX, ShoppingCart, Timer } from "lucide-react";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { PreordersTable } from "./preorders-table";

export function PreordersPageClient() {
  const [open, setOpen] = useState(false);
  const [sku_id, setSkuId] = useState("");
  const [is_preorder_enabled, setIsPreorderEnabled] = useState(true);
  const [max_preorder_qty, setMaxPreorderQty] = useState("100");

  const utils = trpc.useUtils();

  const { data: stats, isLoading: statsLoading } = trpc.preorders.preorderStats.useQuery();

  const upsert_settings = trpc.preorders.upsertSettings.useMutation({
    onSuccess: () => {
      toast.success("Paramètres de précommande enregistrés");
      setOpen(false);
      void utils.preorders.adminListAllocations.invalidate();
      void utils.preorders.preorderStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <QueryGuard query={{ isLoading: statsLoading }}>
    <ConsolePageShell
      title="Précommandes"
      subtitle="Gestion des précommandes et des allocations"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Configurer une précommande</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Paramètres de précommande</DialogTitle>
              <DialogDescription>
                Activer ou modifier la précommande pour un SKU.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>SKU ID</Label>
                <Input value={sku_id} onChange={(e) => setSkuId(e.target.value)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Précommande activée</Label>
                <Switch
                  checked={is_preorder_enabled}
                  onCheckedChange={setIsPreorderEnabled}
                />
              </div>
              <div className="space-y-2">
                <Label>Quantité max</Label>
                <Input
                  type="number"
                  value={max_preorder_qty}
                  onChange={(e) => setMaxPreorderQty(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                disabled={!sku_id || upsert_settings.isPending}
                onClick={() =>
                  upsert_settings.mutate({
                    sku_id,
                    is_preorder_enabled,
                    allow_backorder: false,
                    max_preorder_qty: Number(max_preorder_qty),
                    deposit_percent: 100,
                    lead_time_days: 14,
                    is_active: true,
                  })
                }
              >
                Enregistrer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
      stats={
        <StatsGrid
          loading={statsLoading}
          items={[
            { label: "Total Allocations", value: stats?.total ?? 0, icon: Hash, color: "default" },
            { label: "En Attente", value: stats?.pending ?? 0, icon: Hourglass, color: "warning" },
            { label: "Confirmées", value: stats?.confirmed ?? 0, icon: ShoppingCart, color: "info" },
            { label: "Finies", value: stats?.fulfilled ?? 0, icon: PackageCheck, color: "success" },
            { label: "Annulées", value: stats?.cancelled ?? 0, icon: PackageX, color: "error" },
            { label: "Qté Active", value: stats?.total_qty_active ?? 0, icon: Timer, color: "default" },
          ]}
        />
      }
    >
      <PreordersTable />
    </ConsolePageShell>
    </QueryGuard>
  );
}
