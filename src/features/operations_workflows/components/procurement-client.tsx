"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Send,
  CheckCircle,
  Package,
  Trash2,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { useDataTable } from "@/features/data-table/use-data-table";
import { format_currency } from "@/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────

type SupplierRow = {
  id: string;
  name: string;
  code: string;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  payment_terms?: string | null;
  currency?: string | null;
  status: string;
};

type PORow = {
  id: string;
  po_number: string;
  supplier_id: string;
  warehouse_id?: string | null;
  status: string;
  subtotal: string | number;
  tax: string | number;
  total: string | number;
  notes?: string | null;
  expected_delivery_at?: string | null;
  created_at?: string | Date | null;
};

// ─── PO Status Badge ──────────────────────────────────────────────────────

function PoStatusBadge({ status }: { status: string }) {
  const t = useTranslations("procurement");
  const map: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
      className?: string;
    }
  > = {
    draft: {
      label: t("status_draft"),
      variant: "outline",
    },
    submitted: {
      label: t("status_submitted"),
      variant: "secondary",
    },
    approved: {
      label: t("status_approved"),
      variant: "default",
    },
    received: {
      label: t("status_received"),
      variant: "default",
      className: "bg-green-600 text-white hover:bg-green-600",
    },
    partially_received: {
      label: t("status_partially_received"),
      variant: "default",
      className: "bg-green-600 text-white hover:bg-green-600",
    },
    cancelled: {
      label: t("status_cancelled"),
      variant: "destructive",
    },
  };
  const config = map[status] ?? { label: status, variant: "outline" as const };
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}

// ─── Create / Edit Supplier Dialog ────────────────────────────────────────

const PAYMENT_TERMS_VALUES = [
  "net_15",
  "net_30",
  "net_60",
  "due_on_receipt",
] as const;

function SupplierDialogContent({
  supplier,
  onOpenChange,
}: {
  supplier?: SupplierRow | null;
  onOpenChange: (v: boolean) => void;
}) {
  const t = useTranslations("procurement");
  const is_edit = !!supplier;
  const utils = trpc.useUtils();
  const [name, setName] = useState(supplier?.name ?? "");
  const [code, setCode] = useState(supplier?.code ?? "");
  const [contact_name, setContactName] = useState(
    supplier?.contact_name ?? "",
  );
  const [email, setEmail] = useState(supplier?.email ?? "");
  const [phone, setPhone] = useState(supplier?.phone ?? "");
  const [address, setAddress] = useState(supplier?.address ?? "");
  const [payment_terms, setPaymentTerms] = useState(
    supplier?.payment_terms ?? "net_30",
  );
  const [currency, setCurrency] = useState(supplier?.currency ?? "DZD");

  const create = trpc.operationsWorkflows.supplierCreate.useMutation({
    onSuccess: () => {
      toast.success(t("create_supplier_success"));
      utils.operationsWorkflows.suppliersList.invalidate();
      onOpenChange(false);
      reset();
    },
    onError: (err) => toast.error(err.message),
  });

  const update = trpc.operationsWorkflows.supplierUpdate.useMutation({
    onSuccess: () => {
      toast.success(t("update_supplier_success"));
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
      toast.error(t("fill_required_fields"));
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
    <form onSubmit={handle_submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("name_required")}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>{t("code_required")}</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("contact_label")}</Label>
          <Input value={contact_name} onChange={(e) => setContactName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>{t("email_label")}</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("phone_label")}</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>{t("payment_terms_label")}</Label>
          <Select value={payment_terms} onValueChange={setPaymentTerms}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_TERMS_VALUES.map((pt) => (
                <SelectItem key={pt} value={pt}>
                  {t(pt)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>{t("address_label")}</Label>
        <Textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} />
      </div>
      <div className="space-y-2">
        <Label>{t("currency_label")}</Label>
        <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={is_pending}>
        {is_edit ? t("save_supplier_button") : t("create_supplier_button")}
      </Button>
    </form>
  );
}

export function CreateSupplierDialog() {
  const t = useTranslations("procurement");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 size-4" />
          {t("create_supplier_button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("create_supplier_title")}</DialogTitle>
        </DialogHeader>
        <SupplierDialogContent onOpenChange={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

// ─── Suppliers List (DataTable) ───────────────────────────────────────────

export function SuppliersListClient() {
  const t = useTranslations("procurement");
  const { data, isLoading, error } =
    trpc.operationsWorkflows.suppliersList.useQuery();
  const [edit_supplier, setEditSupplier] = useState<SupplierRow | null>(null);

  const suppliers: SupplierRow[] = useMemo(() => (data as SupplierRow[]) ?? [], [data]);

  const columns = useMemo<ColumnDef<SupplierRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("name")} />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "code",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("code")} />
        ),
      },
      {
        accessorKey: "contact_name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("contact")} />
        ),
        cell: ({ row }) => row.original.contact_name ?? "—",
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("email")} />
        ),
        cell: ({ row }) => row.original.email ?? "—",
      },
      {
        accessorKey: "payment_terms",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            label={t("payment_terms")}
          />
        ),
        cell: ({ row }) => {
          const val = row.original.payment_terms;
          if (!val) return "—";
          return t(val);
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("status")} />
        ),
        cell: ({ row }) => {
          const isActive = row.original.status === "active";
          return (
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? t("status_active") : t("status_inactive")}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("actions")} />
        ),
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditSupplier(row.original)}
          >
            <Pencil className="size-4" />
          </Button>
        ),
      },
    ],
    [t],
  );

  const { table } = useDataTable({
    data: suppliers,
    columns,
    pageCount: 1,
    queryKeys: { page: "supPage", perPage: "supPerPage", sort: "supSort" },
    getRowId: (row) => row.id,
  });

  return (
    <QueryGuard
      query={{ isLoading, error }}
      loadingFallback={<DataTableSkeleton columnCount={7} rowCount={10} />}
    >
      <DataTable table={table}>
        <DataTableAdvancedToolbar table={table}>
          <DataTableSortList table={table} />
        </DataTableAdvancedToolbar>
      </DataTable>

      {edit_supplier && (
        <Dialog
          open={!!edit_supplier}
          onOpenChange={(v) => {
            if (!v) setEditSupplier(null);
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("edit_supplier_title")}</DialogTitle>
            </DialogHeader>
            <SupplierDialogContent
              key={edit_supplier.id}
              supplier={edit_supplier}
              onOpenChange={(v) => {
                if (!v) setEditSupplier(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </QueryGuard>
  );
}

// ─── Create Purchase Order Dialog ─────────────────────────────────────────

export function CreatePurchaseOrderDialog() {
  const t = useTranslations("procurement");
  const utils = trpc.useUtils();
  const { data: suppliers } = trpc.operationsWorkflows.suppliersList.useQuery();
  const [open, setOpen] = useState(false);

  const [supplier_id, setSupplierId] = useState("");
  const [warehouse_id, setWarehouseId] = useState("");
  const [items, setItems] = useState<
    Array<{ product_id: string; quantity: number; unit_cost: number }>
  >([]);
  const [notes, setNotes] = useState("");
  const [expected_delivery_at, setExpectedDeliveryAt] = useState("");

  const create = trpc.operationsWorkflows.purchaseOrderCreate.useMutation({
    onSuccess: () => {
      toast.success(t("create_po_success"));
      utils.operationsWorkflows.purchaseOrdersList.invalidate();
      setOpen(false);
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
    setItems([
      ...items,
      { product_id: "", quantity: 1, unit_cost: 0 },
    ]);
  }

  function remove_item(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function update_item(
    index: number,
    field: string,
    value: string | number,
  ) {
    setItems(
      items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supplier_id) {
      toast.error(t("select_supplier_error"));
      return;
    }
    if (items.length === 0 || items.some((i) => !i.product_id)) {
      toast.error(t("add_items_error"));
      return;
    }
    create.mutate({
      supplier_id,
      warehouse_id: warehouse_id || undefined,
      items: items.map((i) => ({
        product_id: i.product_id,
        quantity: Number(i.quantity),
        unit_cost: Number(i.unit_cost),
      })),
      notes: notes || undefined,
      expected_delivery_at: expected_delivery_at || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 size-4" />
          {t("create_po_button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("create_po_title")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handle_submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("supplier_required")} *</Label>
              <Select value={supplier_id} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("supplier_required")} />
                </SelectTrigger>
                <SelectContent>
                  {(suppliers as SupplierRow[] | undefined)?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("warehouse")}</Label>
              <Input
                value={warehouse_id}
                onChange={(e) => setWarehouseId(e.target.value)}
                placeholder={t("warehouse_id_placeholder")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t("items")}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={add_item}
              >
                <Plus className="mr-1 size-4" />
                {t("add_item")}
              </Button>
            </div>
            {items.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-4 gap-2 items-end"
              >
                <div className="space-y-1">
                  <Label className="text-xs">{t("product_id")}</Label>
                  <Input
                    value={item.product_id}
                    onChange={(e) =>
                      update_item(i, "product_id", e.target.value)
                    }
                    placeholder={t("product_id_placeholder")}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("quantity")}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      update_item(i, "quantity", Number(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("unit_cost")}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unit_cost}
                    onChange={(e) =>
                      update_item(i, "unit_cost", Number(e.target.value))
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove_item(i)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("expected_delivery")}</Label>
              <Input
                type="date"
                value={expected_delivery_at}
                onChange={(e) => setExpectedDeliveryAt(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("notes")}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={create.isPending}>
            {t("create_po_button")}
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
  const t = useTranslations("procurement");
  const utils = trpc.useUtils();
  const { data: po } = trpc.operationsWorkflows.purchaseOrderGet.useQuery(
    { id: po_id },
    { enabled: open },
  );

  const [received_map, setReceivedMap] = useState<Record<string, number>>({});

  const receive =
    trpc.operationsWorkflows.purchaseOrderReceive.useMutation({
      onSuccess: () => {
        toast.success(t("receive_po_success"));
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
      toast.error(t("receive_specify_error"));
      return;
    }
    receive.mutate({ id: po_id, items });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {t("receive_po_title", {
              po_number: po?.po_number ?? "",
            })}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handle_submit} className="space-y-4">
          {po?.items.map((item) => {
            const remaining = item.quantity - item.received_quantity;
            return (
              <div
                key={item.id}
                className="grid grid-cols-3 gap-2 items-end"
              >
                <div className="space-y-1">
                  <Label className="text-xs">{t("product_id")}</Label>
                  <Input
                    value={item.product_id}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("receive_remaining")}</Label>
                  <Input
                    value={remaining}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("receive_quantity")}</Label>
                  <Input
                    type="number"
                    min="0"
                    max={remaining}
                    value={received_map[item.id] ?? ""}
                    onChange={(e) =>
                      setReceivedMap({
                        ...received_map,
                        [item.id]: Number(e.target.value),
                      })
                    }
                    placeholder={t("receive_quantity_placeholder")}
                  />
                </div>
              </div>
            );
          })}
          {(!po || po.items.length === 0) && (
            <p className="text-sm text-muted-foreground">
              {t("receive_empty")}
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={receive.isPending}
          >
            {t("receive_confirm")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Purchase Orders List (DataTable) ─────────────────────────────────────

export function PurchaseOrdersListClient() {
  const t = useTranslations("procurement");
  const { data: pos, isLoading, error } =
    trpc.operationsWorkflows.purchaseOrdersList.useQuery();
  const utils = trpc.useUtils();
  const [receive_po_id, setReceivePoId] = useState<string | null>(null);

  const submit = trpc.operationsWorkflows.purchaseOrderSubmit.useMutation({
    onSuccess: () => {
      toast.success(t("submit_po_success"));
      utils.operationsWorkflows.purchaseOrdersList.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const approve = trpc.operationsWorkflows.purchaseOrderApprove.useMutation({
    onSuccess: () => {
      toast.success(t("approve_po_success"));
      utils.operationsWorkflows.purchaseOrdersList.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const purchase_orders: PORow[] = useMemo(
    () => (pos as PORow[]) ?? [],
    [pos],
  );

  const columns = useMemo<ColumnDef<PORow>[]>(
    () => [
      {
        accessorKey: "po_number",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("po_number")} />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.po_number}</span>
        ),
      },
      {
        accessorKey: "total",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("po_total")} />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary">
            {format_currency(Number(row.original.total))}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("po_status")} />
        ),
        cell: ({ row }) => <PoStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("po_created_at")} />
        ),
        cell: ({ row }) => {
          const d = row.original.created_at;
          if (!d) return "—";
          return new Date(d).toLocaleDateString("fr-FR");
        },
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("po_actions")} />
        ),
        cell: ({ row }) => {
          const po = row.original;
          return (
            <div className="flex items-center gap-1">
              {po.status === "draft" && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={submit.isPending}
                  onClick={() => submit.mutate({ id: po.id })}
                >
                  <Send className="mr-1 size-4" />
                  {t("action_submit")}
                </Button>
              )}
              {po.status === "submitted" && (
                <Button
                  variant="default"
                  size="sm"
                  disabled={approve.isPending}
                  onClick={() => approve.mutate({ id: po.id })}
                >
                  <CheckCircle className="mr-1 size-4" />
                  {t("action_approve")}
                </Button>
              )}
              {(po.status === "approved" ||
                po.status === "partially_received") && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setReceivePoId(po.id)}
                >
                  <Package className="mr-1 size-4" />
                  {t("action_receive")}
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [t, submit, approve],
  );

  const { table } = useDataTable({
    data: purchase_orders,
    columns,
    pageCount: 1,
    queryKeys: {
      page: "poPage",
      perPage: "poPerPage",
      sort: "poSort",
    },
    getRowId: (row) => row.id,
  });

  return (
    <QueryGuard
      query={{ isLoading, error }}
      loadingFallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
    >
      <DataTable table={table}>
        <DataTableAdvancedToolbar table={table}>
          <DataTableSortList table={table} />
        </DataTableAdvancedToolbar>
      </DataTable>

      {receive_po_id && (
        <ReceivePODialog
          key={receive_po_id}
          open={!!receive_po_id}
          onOpenChange={(v) => {
            if (!v) setReceivePoId(null);
          }}
          po_id={receive_po_id}
        />
      )}
    </QueryGuard>
  );
}
