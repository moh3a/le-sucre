"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { Eye, Loader2, Search, User, Clipboard, Check } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { useDataTable } from "@/features/data-table/use-data-table";
import { estimate_page_count } from "@/lib/console-table";
import { trpc } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CartRow = {
  id: string;
  user_id: string | null;
  guest_token: string | null;
  status: string;
  currency: string;
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  customer_email: string | null;
  item_count: number;
  total_price: string;
};

const CART_STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  active: { label: "Actif", variant: "outline" },
  converted: { label: "Converti", variant: "default" },
  merged: { label: "Fusionné", variant: "secondary" },
  abandoned: { label: "Abandonné", variant: "destructive" },
};

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Tous les statuts" },
  { value: "active", label: "Actif uniquement" },
  { value: "abandoned", label: "Abandonné uniquement" },
  { value: "converted", label: "Converti uniquement" },
  { value: "merged", label: "Fusionné uniquement" },
];

const getCartStatus = (row: CartRow): string => {
  if (row.status === "active") {
    const isOld = new Date(row.updated_at).getTime() < Date.now() - 24 * 60 * 60 * 1000;
    if (isOld && row.item_count > 0) return "abandoned";
  }
  return row.status;
};

export function CartsTable() {
  const [page, setPage] = useQueryState("cartPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("cartPerPage", parseAsInteger.withDefault(20));
  const [status, setStatus] = useQueryState("cartStatus", parseAsString.withDefault("all"));
  const [search, setSearch] = useQueryState("cartSearch", parseAsString.withDefault(""));

  const [selectedCartId, setSelectedCartId] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (id: string) => {
    void navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const columns = React.useMemo<ColumnDef<CartRow>[]>(
    () => [
      {
        id: "id",
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Panier ID" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="max-w-[80px] truncate">{row.original.id}</span>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-muted h-5 w-5"
              onClick={() => handleCopy(row.original.id)}
            >
              {copiedId === row.original.id ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Clipboard className="text-muted-foreground h-3 w-3" />
              )}
            </Button>
          </div>
        ),
      },
      {
        id: "customer",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Client / Session" />,
        cell: ({ row }) => {
          const name = row.original.customer_name;
          const email = row.original.customer_email;
          const guestToken = row.original.guest_token;

          if (name) {
            return (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c8d152]/20 text-[#4d4c20]">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-muted-foreground text-xs">{email}</p>
                </div>
              </div>
            );
          }

          return (
            <div className="text-muted-foreground flex items-center gap-2">
              <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                <User className="text-muted-foreground h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Visiteur</p>
                {guestToken && (
                  <p className="font-mono text-[10px]">Guest: {guestToken.slice(0, 8)}...</p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: "item_count",
        accessorKey: "item_count",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Articles" />,
        cell: ({ row }) => <span className="font-semibold">{row.original.item_count} art.</span>,
      },
      {
        id: "total_price",
        accessorKey: "total_price",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Total" />,
        cell: ({ row }) => (
          <span className="font-mono font-semibold">
            {Number(row.original.total_price).toLocaleString("fr-FR")} {row.original.currency}
          </span>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Statut" />,
        cell: ({ row }) => {
          const displayStatus = getCartStatus(row.original);
          const cfg = CART_STATUS_CONFIG[displayStatus] ?? {
            label: displayStatus,
            variant: "outline",
          };
          return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
        },
      },
      {
        id: "updated_at",
        accessorKey: "updated_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Activité" />,
        cell: ({ row }) =>
          format(new Date(row.original.updated_at), "dd MMM yyyy HH:mm", { locale: fr }),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end">
            <Button variant="ghost" size="icon" onClick={() => setSelectedCartId(row.original.id)}>
              <Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [copiedId],
  );

  const { data, isLoading } = trpc.cart.adminList.useQuery({
    page,
    limit: per_page,
    status: status === "all" ? undefined : status,
    search: search || undefined,
  });

  const items = (data?.items ?? []) as CartRow[];
  const totalRecords = data?.meta.total_records ?? 0;

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: estimate_page_count(page, per_page, totalRecords),
    queryKeys: { page: "cartPage", perPage: "cartPerPage" },
    getRowId: (row) => row.id,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative min-w-[200px] flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Rechercher par ID, client, guest token..."
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select
              value={status}
              onValueChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <DataTableSkeleton columnCount={7} rowCount={10} />
          ) : (
            <DataTable table={table} />
          )}
        </CardContent>
      </Card>

      <CartItemsDialog
        cartId={selectedCartId || ""}
        open={!!selectedCartId}
        onOpenChange={(open) => !open && setSelectedCartId(null)}
      />
    </div>
  );
}

interface CartItemsDialogProps {
  cartId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CartItemsDialog({ cartId, open, onOpenChange }: CartItemsDialogProps) {
  const { data, isLoading } = trpc.cart.byId.useQuery(
    { cart_id: cartId },
    { enabled: open && !!cartId },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Articles du Panier</DialogTitle>
          <DialogDescription className="font-mono text-xs select-all">
            ID: {cartId}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#c8d152]" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center text-sm">Ce panier est vide.</div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="max-h-[280px] divide-y overflow-y-auto pr-1">
              {data.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 py-2.5 text-sm">
                  <div>
                    <p className="font-semibold">{item.product_name}</p>
                    <p className="text-muted-foreground font-mono text-xs">
                      Qte: {item.quantity} &times; {Number(item.unit_price).toLocaleString("fr-FR")}{" "}
                      {item.currency}
                    </p>
                  </div>
                  <div className="pt-1 text-right font-semibold whitespace-nowrap">
                    {Number(item.line_total).toLocaleString("fr-FR")} {item.currency}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between border-t pt-4 text-base font-bold">
              <span>Sous-total</span>
              <span className="font-mono">
                {Number(data.subtotal).toLocaleString("fr-FR")} {data.currency}
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
