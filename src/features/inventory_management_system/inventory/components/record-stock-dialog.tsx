"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, PackagePlus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Separator } from "@/components/ui/separator";
import { ProductCombobox } from "@/features/product_information_management/products/components/product-combobox";
import { SkuCombobox } from "@/features/product_information_management/variants/components/sku-combobox";
import { WarehouseCombobox } from "@/features/inventory_management_system/warehouses/components/warehouse-combobox";

type LineItem = {
  id: string;
  product_id: string;
  sku_id: string;
  quantity: number;
};

let next_id = 0;
function make_line(): LineItem {
  return { id: `line-${++next_id}`, product_id: "", sku_id: "", quantity: 1 };
}

export function RecordStockDialog() {
  const t = useTranslations("inventory");
  const [open, setOpen] = React.useState(false);
  const [warehouse_id, setWarehouseId] = React.useState<string | null>(null);
  const [lines, setLines] = React.useState<LineItem[]>(() => [make_line()]);

  const utils = trpc.useUtils();

  const batch_receive = trpc.inventory.batchReceiveStock.useMutation({
    onSuccess: (data) => {
      toast.success(t("batch_stock_recorded", { count: data.received }));
      setOpen(false);
      setWarehouseId(null);
      setLines([make_line()]);
      void utils.inventory.adminListStock.invalidate();
      void utils.inventory.adminStats.invalidate();
      void utils.inventory.listMovements.invalidate();
      void utils.inventory.adminCharts.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function reset_form() {
    setWarehouseId(null);
    setLines([make_line()]);
  }

  function add_line() {
    setLines((prev) => [...prev, make_line()]);
  }

  function remove_line(id: string) {
    setLines((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((l) => l.id !== id);
    });
  }

  function update_line(id: string, patch: Partial<LineItem>) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  const valid_lines = lines.filter((l) => l.sku_id && l.quantity > 0);
  const can_submit = valid_lines.length > 0;

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    if (!can_submit) return;
    batch_receive.mutate({
      ...(warehouse_id ? { warehouse_id } : {}),
      items: valid_lines.map((l) => ({
        sku_id: l.sku_id,
        quantity: l.quantity,
      })),
    });
  }

  return (
    <QueryGuard mutation={batch_receive}>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset_form();
        }}
      >
        <DialogTrigger asChild>
          <Button>
            <Plus />
            {t("record_stock_title")}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("record_stock_title")}</DialogTitle>
            <DialogDescription>{t("record_stock_description")}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handle_submit} className="space-y-5">
            <div className="space-y-2">
              <Label>{t("warehouse_label")} <span className="text-muted-foreground text-xs">({t("optional")})</span></Label>
              <WarehouseCombobox value={warehouse_id} onValueChange={setWarehouseId} />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base">{t("items_label")}</Label>
                <Button type="button" variant="outline" size="sm" onClick={add_line}>
                  <Plus className="mr-1 size-3.5" />
                  {t("add_line")}
                </Button>
              </div>

              <div className="space-y-3">
                {lines.map((line, idx) => (
                  <ReceiveLine
                    key={line.id}
                    line={line}
                    index={idx}
                    can_remove={lines.length > 1}
                    onRemove={() => remove_line(line.id)}
                    onUpdate={(patch) => update_line(line.id, patch)}
                  />
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={!can_submit || batch_receive.isPending}>
                <PackagePlus className="mr-1 size-4" />
                {batch_receive.isPending
                  ? t("receiving")
                  : t("receive_count", { count: valid_lines.length })}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </QueryGuard>
  );
}

function ReceiveLine({
  line,
  index,
  can_remove,
  onRemove,
  onUpdate,
}: {
  line: LineItem;
  index: number;
  can_remove: boolean;
  onRemove: () => void;
  onUpdate: (patch: Partial<LineItem>) => void;
}) {
  const t = useTranslations("inventory");

  return (
    <div className="rounded-lg border p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium">#{index + 1}</span>
        {can_remove && (
          <Button type="button" variant="ghost" size="icon-xs" onClick={onRemove}>
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_100px]">
        <div className="space-y-1">
          <Label className="text-xs">{t("product_label")}</Label>
          <ProductCombobox
            value={line.product_id || null}
            onValueChange={(pid) =>
              onUpdate({ product_id: pid ?? "", sku_id: "", quantity: line.quantity })
            }
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{t("sku_label")}</Label>
          <SkuCombobox
            product_id={line.product_id}
            value={line.sku_id || null}
            onValueChange={(sid) => onUpdate({ sku_id: sid ?? "" })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{t("quantity_label")}</Label>
          <Input
            type="number"
            min="1"
            step="1"
            value={line.quantity}
            onChange={(e) =>
              onUpdate({
                quantity: Math.max(1, parseInt(e.target.value) || 1),
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
