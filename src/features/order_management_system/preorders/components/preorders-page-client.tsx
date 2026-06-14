"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { trpc } from "@/components/providers/app-providers";
import { PreordersTable } from "./preorders-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";

export function PreordersPageClient() {
  const [open, setOpen] = useState(false);
  const [sku_id, setSkuId] = useState("");
  const [is_preorder_enabled, setIsPreorderEnabled] = useState(true);
  const [max_preorder_qty, setMaxPreorderQty] = useState("100");
  const upsert_settings = trpc.preorders.upsertSettings.useMutation({
    onSuccess: () => {
      toast.success("Paramètres de précommande enregistrés");
      setOpen(false);
      void utils.preorders.adminListAllocations.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const utils = trpc.useUtils();
  const { data: preorderAllocations, isLoading } = trpc.preorders.adminListAllocations.useQuery({
    page: 1,
    limit: 50,
  });

  const updateEtaMutation = trpc.preorders.updateEstimatedDate.useMutation({
    onSuccess: () => {
      void utils.preorders.adminListAllocations.invalidate();
    },
  });

  const handleUpdateEta = (allocation_id: string, dateStr: string) => {
    updateEtaMutation.mutate({
      allocation_id,
      estimated_available_at: dateStr,
    });
  };

  return (
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
              <DialogDescription>Activer ou modifier la précommande pour un SKU.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>SKU ID</Label>
                <Input value={sku_id} onChange={(e) => setSkuId(e.target.value)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Précommande activée</Label>
                <Switch checked={is_preorder_enabled} onCheckedChange={setIsPreorderEnabled} />
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
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Allocations de Précommande</CardTitle>
            <CardDescription>
              Liste des allocations de produits en précommande rattachées aux commandes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground py-4 text-sm">Chargement des précommandes…</p>
            ) : !preorderAllocations || preorderAllocations.length === 0 ? (
              <p className="text-muted-foreground py-4 text-sm">
                Aucune allocation de précommande active.
              </p>
            ) : (
              <PreordersTable data={preorderAllocations} onUpdateEta={handleUpdateEta} />
            )}
          </CardContent>
        </Card>
      </div>
    </ConsolePageShell>
  );
}
