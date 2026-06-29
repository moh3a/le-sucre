"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function CreateTransferDialog() {
  const [open, setOpen] = useState(false);
  const [source_warehouse_id, setSourceWarehouseId] = useState("");
  const [destination_warehouse_id, setDestinationWarehouseId] = useState("");
  const [reason, setReason] = useState("restock");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([{ product_id: "", quantity: 1 }]);

  const { data: warehouses } = trpc.warehouses.listAllActive.useQuery();

  const utils = trpc.useUtils();

  const create = trpc.operationsWorkflows.inventoryTransferCreate.useMutation({
    onSuccess: () => {
      toast.success("Transfert créé avec succès");
      setOpen(false);
      setSourceWarehouseId("");
      setDestinationWarehouseId("");
      setReason("restock");
      setNotes("");
      setItems([{ product_id: "", quantity: 1 }]);
      void utils.operationsWorkflows.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({
      source_warehouse_id,
      destination_warehouse_id,
      reason,
      notes: notes || undefined,
      items: items.filter((i) => i.product_id.trim()),
    });
  }

  function add_item() {
    setItems([...items, { product_id: "", quantity: 1 }]);
  }

  function remove_item(index: number) {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  }

  function update_item(
    index: number,
    key: "product_id" | "quantity",
    value: string | number,
  ) {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    setItems(updated);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Nouveau transfert
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Créer un transfert de stock</DialogTitle>
          <DialogDescription>
            Transférer des produits entre deux entrepôts.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handle_submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Entrepôt source</Label>
            <Select
              value={source_warehouse_id}
              onValueChange={setSourceWarehouseId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un entrepôt" />
              </SelectTrigger>
              <SelectContent>
                {warehouses?.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Entrepôt destination</Label>
            <Select
              value={destination_warehouse_id}
              onValueChange={setDestinationWarehouseId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un entrepôt" />
              </SelectTrigger>
              <SelectContent>
                {warehouses?.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Raison</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restock">Réapprovisionnement</SelectItem>
                <SelectItem value="relocation">Relocalisation</SelectItem>
                <SelectItem value="damage">Dommage</SelectItem>
                <SelectItem value="return">Retour</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Notes (optionnel)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informations complémentaires..."
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Articles</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={add_item}
              >
                <Plus /> Ajouter
              </Button>
            </div>
            {items.map((item, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">ID Produit</Label>
                  <Input
                    value={item.product_id}
                    onChange={(e) =>
                      update_item(index, "product_id", e.target.value)
                    }
                    placeholder="product_xxx"
                    required
                  />
                </div>
                <div className="w-24 space-y-1">
                  <Label className="text-xs">Quantité</Label>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      update_item(index, "quantity", Number(e.target.value))
                    }
                    required
                  />
                </div>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove_item(index)}
                  >
                    <Trash2 className="size-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={create.isPending}
          >
            Créer le transfert
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function InventoryTransfersClient() {
  const { data: transfers } = trpc.operationsWorkflows.inventoryTransfersList.useQuery();
  const utils = trpc.useUtils();
  const approve = trpc.operationsWorkflows.inventoryTransferApprove.useMutation({ onSuccess: () => utils.invalidate() });
  const ship = trpc.operationsWorkflows.inventoryTransferShip.useMutation({ onSuccess: () => utils.invalidate() });
  const receive = trpc.operationsWorkflows.inventoryTransferReceive.useMutation({ onSuccess: () => utils.invalidate() });
  const cancel = trpc.operationsWorkflows.inventoryTransferCancel.useMutation({ onSuccess: () => utils.invalidate() });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory Transfers</h1>
        <CreateTransferDialog />
      </div>
      <div className="rounded-lg border">
        <h2 className="border-b bg-gray-50 px-4 py-2 font-semibold text-sm">All Transfers ({transfers?.length ?? 0})</h2>
        <div className="divide-y">
          {transfers?.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{t.transfer_number}</p>
                <p className="text-xs text-gray-500">{t.reason} · {t.source_warehouse_id.slice(0, 8)} → {t.destination_warehouse_id.slice(0, 8)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{t.status}</span>
                {t.status === "draft" && <button onClick={() => approve.mutate({ id: t.id })} className="rounded bg-green-600 px-2 py-1 text-xs text-white">Approve</button>}
                {t.status === "approved" && <button onClick={() => ship.mutate({ id: t.id })} className="rounded bg-blue-600 px-2 py-1 text-xs text-white">Ship</button>}
                {t.status === "in_transit" && <button onClick={() => receive.mutate({ id: t.id })} className="rounded bg-purple-600 px-2 py-1 text-xs text-white">Receive</button>}
                {(t.status === "draft" || t.status === "approved") && <button onClick={() => cancel.mutate({ id: t.id })} className="rounded bg-red-600 px-2 py-1 text-xs text-white">Cancel</button>}
              </div>
            </div>
          ))}
          {(!transfers || transfers.length === 0) && <p className="p-4 text-sm text-gray-400">No transfers</p>}
        </div>
      </div>
    </div>
  );
}
