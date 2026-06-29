"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { Download, Eye, Loader2, MoreHorizontal, User, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { useTranslations } from "next-intl";

import { QueryGuard } from "@/components/query-guard";
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { useDataTable } from "@/features/data-table/use-data-table";
import { trpc } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

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

function getCartStatus(row: CartRow): string {
  if (row.status === "active") {
    const isOld = new Date(row.updated_at).getTime() < Date.now() - 24 * 60 * 60 * 1000;
    if (isOld && row.item_count > 0) return "abandoned";
  }
  return row.status;
}

function FacetedFilter({
  title,
  options,
  icon: Icon,
  value,
  onChange,
}: {
  title: string;
  options: { label: string; value: string }[];
  icon?: React.ComponentType<{ className?: string }>;
  value?: string;
  onChange: (value: string | null) => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed font-normal">
          {value ? (
            <div
              role="button"
              aria-label={`Clear ${title} filter`}
              tabIndex={0}
              className="focus-visible:ring-ring rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-1 focus-visible:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            >
              <XCircle className="size-4" />
            </div>
          ) : (
            Icon && <Icon className="size-4" />
          )}
          <span className="ml-2">{title}</span>
          {value && (
            <>
              <Separator orientation="vertical" className="mx-0.5 data-[orientation=vertical]:h-4" />
              <span className="ml-1">{options.find((o) => o.value === value)?.label}</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-0">
        <div className="p-2">
          {options.map((option) => (
            <Button
              key={option.value}
              variant={value === option.value ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                onChange(value === option.value ? null : option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function CartsTable() {
  const t = useTranslations("carts");
  const [page] = useQueryState("cartPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("cartPerPage", parseAsInteger.withDefault(20));
  const [search, setSearch] = useQueryState("cartSearch", parseAsString);
  const [status, setStatus] = useQueryState("cartStatus", parseAsString);

  const [selectedCartId, setSelectedCartId] = React.useState<string | null>(null);

  const CART_STATUS_CONFIG: Record<
    string,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    active: { label: t("status_active"), variant: "outline" },
    converted: { label: t("status_converted"), variant: "default" },
    merged: { label: t("status_merged"), variant: "secondary" },
    abandoned: { label: t("status_abandoned"), variant: "destructive" },
  };

  const STATUS_OPTIONS = [
    { label: t("status_active"), value: "active" },
    { label: t("status_abandoned"), value: "abandoned" },
    { label: t("status_converted"), value: "converted" },
    { label: t("status_merged"), value: "merged" },
  ];

  const columns = React.useMemo<ColumnDef<CartRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "id",
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("cart_id_column")} />,
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.id}</span>
        ),
      },
      {
        id: "customer",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("customer_column")} />,
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
                <p className="text-sm font-medium">{t("guest")}</p>
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
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("items_column")} />,
        cell: ({ row }) => <span className="font-semibold">{t("items_count", { count: row.original.item_count })}</span>,
      },
      {
        id: "total_price",
        accessorKey: "total_price",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("total_column")} />,
        cell: ({ row }) => (
          <span className="font-mono font-semibold">
            {Number(row.original.total_price).toLocaleString("fr-FR")} {row.original.currency}
          </span>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("status_column")} />,
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
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("activity_column")} />,
        cell: ({ row }) =>
          format(new Date(row.original.updated_at), "dd MMM yyyy HH:mm", { locale: fr }),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedCartId(row.original.id)}>
                <Eye className="mr-2 h-4 w-4" />
                {t("view_items")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  const { data, isLoading } = trpc.cart.adminList.useQuery({
    page,
    limit: per_page,
    status: status || undefined,
    search: search || undefined,
  });

  const items = (data?.items ?? []) as CartRow[];
  const page_count = data?.meta.total_pages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "cartPage", perPage: "cartPerPage", sort: "cartSort" },
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  return (
    <QueryGuard query={{ isLoading }} loadingFallback={<DataTableSkeleton columnCount={7} rowCount={10} filterCount={2} />}>
    <>
      <DataTable table={table}>
        <DataTableAdvancedToolbar table={table}>
          <Input
            placeholder={t("search_placeholder")}
            value={search || ""}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="max-w-sm"
          />
          <FacetedFilter
            title={t("status_title")}
            options={STATUS_OPTIONS}
            value={status ?? undefined}
            onChange={(val) => setStatus(val)}
          />
          <DataTableSortList table={table} />
        </DataTableAdvancedToolbar>
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <div className="flex items-center gap-2 border-t p-2">
            <Badge variant="outline">
              {t("selected_count", { count: table.getFilteredSelectedRowModel().rows.length })}
            </Badge>
            <Button variant="ghost" size="sm" asChild>
              <a
                href={`/api/admin/carts/export?${new URLSearchParams({
                  ...(search ? { search } : {}),
                  ...(status ? { status } : {}),
                })}`}
                download="carts.csv"
              >
                <Download className="mr-1 h-4 w-4" />
                {t("export")}
              </a>
            </Button>
          </div>
        )}
      </DataTable>

      <CartItemsDialog
        cartId={selectedCartId || ""}
        open={!!selectedCartId}
        onOpenChange={(open) => !open && setSelectedCartId(null)}
      />
    </>
    </QueryGuard>
  );
}

interface CartItemsDialogProps {
  cartId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CartItemsDialog({ cartId, open, onOpenChange }: CartItemsDialogProps) {
  const t = useTranslations("carts");
  const { data, isLoading } = trpc.cart.adminGetById.useQuery(
    { cart_id: cartId },
    { enabled: open && !!cartId },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("cart_items_title")}</DialogTitle>
          <DialogDescription className="font-mono text-xs select-all">
            ID: {cartId}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#c8d152]" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center text-sm">{t("cart_empty")}</div>
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
              <span>{t("subtotal")}</span>
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
