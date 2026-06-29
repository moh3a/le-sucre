"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Send, CheckCircle, Package, Trash2 } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// ─── PO Status Badge ──────────────────────────────────────────────────────

function PoStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
    draft: { label: "Brouillon", variant: "outline" },
    submitted: { label: "Soumis", variant: "secondary" },
    approved: { label: "Approuvé", variant: "default" },
    received: { label: "Reçu", variant: "default", className: "bg-green-600 text-white hover:bg-green-600" },
    partially_received: { label: "Partiellement reçu", variant: "default", className: "bg-green-600 text-white hover:bg-green-600" },
    cancelled: { label: "Annulé", variant: "destructive" },
  };
  const config = map[status] ?? { label: status, variant: "outline" as const };
  return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
}

// ─── Create / Edit Supplier Dialog ────────────────────────────────────────

const PAYMENT_TERMS = [
  { value: "net_15", label: "Net 15 jours" },
  { value: "net_30", label: "Net 30 jours" },
  { value: "net_60", label: "Net 60 jours" },
  { value: "due_on_receipt", label: "À réception" },
];

function CreateSupplierDialog({
  open,
  onOpenChange,
  supplier,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  supplier?: {
    id: string;
    name: string;
    code: string;
    contact_name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    payment_terms?: string | null;
    currency?: string | null;
  } | null;
}) {
  const is_edit = !!supplier;
  const utils = trpc.useUtils();
  const [name, setName] = useState(supplier?.name ?? "");
  const [code, setCode] = useState(supplier?.code ?? "");
  const [contact_name, setContactName] = useState(supplier?.contact_name ?? "");
  const [email, setEmail] = useState(supplier?.email ?? "");
  const [phone, setPhone] = useState(supplier?.phone ?? "");
  const [address, setAddress] = useState(supplier?.address ?? "");
  const [payment_terms, setPaymentTerms] = useState(supplier?.payment_terms ?? "net_30");
  const [currency, setCurrency] = useState(supplier?.currency ?? "DZD");

  const create = trpc.operationsWorkflows.supplierCreate.useMutation({
    onSuccess: () => {
      toast.success("Fournisseur créé avec succès");
      utils.operationsWorkflows.suppliersList.invalidate();
      onOpenChange(false);
      reset();
    },
    onError: (err) => toast.error(err.message),
  });

  const update = trpc.operationsWorkflows.supplierUpdate.useMutation({
    onSuccess: () => {
      toast.success("Fournisseur mis à jour avec succès");
      utils.operationsWorkflows.suppliersList.invalidate();
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
  });

  function reset() {
    setName("");
    setCode("");
    setContactName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setPaymentTerms("net_30");
    setCurrency("DZD");
  }

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !code) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    if (is_edit) {
      update.mutate({
        id: supplier!.id,
        name,
        code,
        contact_name: contact_name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        payment_terms: payment_terms || undefined,
        currency: currency || undefined,
      });
    } else {
      create.mutate({
        name,
        code,
        contact_name: contact_name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        payment_terms: payment_terms || undefined,
        currency: currency || undefined,
      });
    }
  }

  const is_pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{is_edit ? "Modifier le fournisseur" : "Créer un fournisseur"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handle_submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Code *</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contact</Label>
              <Input value={contact_name} onChange={(e) => setContactName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Conditions de paiement</Label>
              <Select value={payment_terms} onValueChange={setPaymentTerms}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TERMS.map((pt) => (
                    <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Adresse</Label>
            <Textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Devise</Label>
            <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={is_pending}>
            {is_edit ? "Enregistrer" : "Créer le fournisseur"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Suppliers List ───────────────────────────────────────────────────────

export function SuppliersListClient() {
  const { data: suppliers } = trpc.operationsWorkflows.suppliersList.useQuery();
  const [create_open, setCreateOpen] = useState(false);
  const [edit_supplier, setEditSupplier] = useState<{
    id: string;
    name: string;
    code: string;
    contact_name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    payment_terms?: string | null;
    currency?: string | null;
  } | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Fournisseurs ({suppliers?.length ?? 0})</h2>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus /> Créer un fournisseur
        </Button>
      </div>

      <div className="rounded-lg border">
        <div className="divide-y">
          {suppliers?.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex-1">
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-xs text-gray-500">{s.code} · {s.email ?? "—"}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs ${s.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {s.status === "active" ? "Actif" : "Inactif"}
                </span>
                <Button variant="ghost" size="icon" onClick={() => setEditSupplier(s)}>
                  <Pencil />
                </Button>
              </div>
            </div>
          ))}
          {(!suppliers || suppliers.length === 0) && (
            <p className="p-4 text-sm text-gray-400">Aucun fournisseur</p>
          )}
        </div>
      </div>

      <CreateSupplierDialog
        open={create_open}
        onOpenChange={setCreateOpen}
      />

      {edit_supplier && (
        <CreateSupplierDialog
          key={edit_supplier.id}
          open={!!edit_supplier}
          onOpenChange={(v) => { if (!v) setEditSupplier(null); }}
          supplier={edit_supplier}
        />
      )}
    </div>
  );
}

// ─── Create Purchase Order Dialog ─────────────────────────────────────────

function CreatePurchaseOrderDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const utils = trpc.useUtils();
  const { data: suppliers } = trpc.operationsWorkflows.suppliersList.useQuery();

  const [supplier_id, setSupplierId] = useState("");
  const [warehouse_id, setWarehouseId] = useState("");
  const [items, setItems] = useState<Array<{ product_id: string; quantity: number; unit_cost: number }>>([]);
  const [notes, setNotes] = useState("");
  const [expected_delivery_at, setExpectedDeliveryAt] = useState("");

  const create = trpc.operationsWorkflows.purchaseOrderCreate.useMutation({
    onSuccess: () => {
      toast.success("Bon de commande créé avec succès");
      utils.operationsWorkflows.purchaseOrdersList.invalidate();
      onOpenChange(false);
      reset();
    },
    onError: (err) => toast.error(err.message),
  });

  function reset() {
    setSupplierId("");
    setWarehouseId("");
    setItems([]);
    setNotes("");
    setExpectedDeliveryAt("");
  }

  function add_item() {
    const new_item: { product_id: string; quantity: number; unit_cost: number } = { product_id: "", quantity: 1, unit_cost: 0 };
    setItems([...items, new_item]);
  }

  function remove_item(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function update_item(index: number, field: string, value: string | number) {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supplier_id) {
      toast.error("Veuillez sélectionner un fournisseur");
      return;
    }
    if (items.length === 0 || items.some((i) => !i.product_id)) {
      toast.error("Veuillez ajouter au moins un article valide");
      return;
    }
    create.mutate({
      supplier_id,
      warehouse_id: warehouse_id || undefined,
      items: items.map((i) => ({ product_id: i.product_id, quantity: Number(i.quantity), unit_cost: Number(i.unit_cost) })),
      notes: notes || undefined,
      expected_delivery_at: expected_delivery_at || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Créer un bon de commande</DialogTitle>
        </DialogHeader>
        <form onSubmit={handle_submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fournisseur *</Label>
              <Select value={supplier_id} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Entrepôt</Label>
              <Input value={warehouse_id} onChange={(e) => setWarehouseId(e.target.value)} placeholder="ID de l'entrepôt" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Articles</Label>
              <Button type="button" variant="outline" size="sm" onClick={add_item}>
                <Plus /> Ajouter
              </Button>
            </div>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 items-end">
                <div className="space-y-1">
                  <Label className="text-xs">ID Produit</Label>
                  <Input
                    value={item.product_id}
                    onChange={(e) => update_item(i, "product_id", e.target.value)}
                    placeholder="ID produit"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Quantité</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => update_item(i, "quantity", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Coût unitaire</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unit_cost}
                    onChange={(e) => update_item(i, "unit_cost", Number(e.target.value))}
                  />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => remove_item(i)}>
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de livraison prévue</Label>
              <Input type="date" value={expected_delivery_at} onChange={(e) => setExpectedDeliveryAt(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>

          <Button type="submit" className="w-full" disabled={create.isPending}>
            Créer le bon de commande
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Receive PO Dialog ────────────────────────────────────────────────────

function ReceivePODialog({
  open,
  onOpenChange,
  po_id,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  po_id: string;
}) {
  const utils = trpc.useUtils();
  const { data: po } = trpc.operationsWorkflows.purchaseOrderGet.useQuery(
    { id: po_id },
    { enabled: open },
  );

  const [received_map, setReceivedMap] = useState<Record<string, number>>({});

  const receive = trpc.operationsWorkflows.purchaseOrderReceive.useMutation({
    onSuccess: () => {
      toast.success("Bon de commande reçu avec succès");
      utils.operationsWorkflows.purchaseOrdersList.invalidate();
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
  });

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    if (!po) return;
    const items = po.items
      .map((item) => ({
        item_id: item.id,
        received_qty: received_map[item.id] ?? 0,
      }))
      .filter((i) => i.received_qty > 0);
    if (items.length === 0) {
      toast.error("Veuillez spécifier les quantités reçues");
      return;
    }
    receive.mutate({ id: po_id, items });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Recevoir le bon {po?.po_number ?? ""}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handle_submit} className="space-y-4">
          {po?.items.map((item) => {
            const remaining = item.quantity - item.received_quantity;
            return (
              <div key={item.id} className="grid grid-cols-3 gap-2 items-end">
                <div className="space-y-1">
                  <Label className="text-xs">Produit</Label>
                  <Input value={item.product_id} readOnly className="bg-muted" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Restant</Label>
                  <Input value={remaining} readOnly className="bg-muted" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Qté reçue</Label>
                  <Input
                    type="number"
                    min="0"
                    max={remaining}
                    value={received_map[item.id] ?? ""}
                    onChange={(e) =>
                      setReceivedMap({ ...received_map, [item.id]: Number(e.target.value) })
                    }
                    placeholder="Qté"
                  />
                </div>
              </div>
            );
          })}
          {(!po || po.items.length === 0) && (
            <p className="text-sm text-gray-400">Aucun article à recevoir</p>
          )}
          <Button type="submit" className="w-full" disabled={receive.isPending}>
            Confirmer la réception
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Purchase Orders List ─────────────────────────────────────────────────

export function PurchaseOrdersListClient() {
  const { data: pos } = trpc.operationsWorkflows.purchaseOrdersList.useQuery();
  const utils = trpc.useUtils();
  const [create_open, setCreateOpen] = useState(false);
  const [receive_po_id, setReceivePoId] = useState<string | null>(null);

  const submit = trpc.operationsWorkflows.purchaseOrderSubmit.useMutation({
    onSuccess: () => {
      toast.success("Bon de commande soumis avec succès");
      utils.operationsWorkflows.purchaseOrdersList.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const approve = trpc.operationsWorkflows.purchaseOrderApprove.useMutation({
    onSuccess: () => {
      toast.success("Bon de commande approuvé avec succès");
      utils.operationsWorkflows.purchaseOrdersList.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Bons de commande ({pos?.length ?? 0})</h2>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus /> Créer un bon de commande
        </Button>
      </div>

      <div className="rounded-lg border">
        <div className="divide-y">
          {pos?.map((po) => (
            <div key={po.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex-1">
                <p className="text-sm font-medium">{po.po_number}</p>
                <p className="text-xs text-gray-500">
                  {Number(po.total).toLocaleString()} {po.currency}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <PoStatusBadge status={po.status} />
                {po.status === "draft" && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={submit.isPending}
                    onClick={() => submit.mutate({ id: po.id })}
                  >
                    <Send /> Soumettre
                  </Button>
                )}
                {po.status === "submitted" && (
                  <Button
                    variant="default"
                    size="sm"
                    disabled={approve.isPending}
                    onClick={() => approve.mutate({ id: po.id })}
                  >
                    <CheckCircle /> Approuver
                  </Button>
                )}
                {(po.status === "approved" || po.status === "partially_received") && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setReceivePoId(po.id)}
                  >
                    <Package /> Recevoir
                  </Button>
                )}
              </div>
            </div>
          ))}
          {(!pos || pos.length === 0) && (
            <p className="p-4 text-sm text-gray-400">Aucun bon de commande</p>
          )}
        </div>
      </div>

      <CreatePurchaseOrderDialog
        open={create_open}
        onOpenChange={setCreateOpen}
      />

      {receive_po_id && (
        <ReceivePODialog
          key={receive_po_id}
          open={!!receive_po_id}
          onOpenChange={(v) => { if (!v) setReceivePoId(null); }}
          po_id={receive_po_id}
        />
      )}
    </div>
  );
}
