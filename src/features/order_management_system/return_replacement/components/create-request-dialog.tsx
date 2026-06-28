"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeftRight, PackageX, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
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
import { Textarea } from "@/components/ui/textarea";
import type { OrderItemInfo } from "./types";

type CreateRequestDialogProps = {
  order_id: string;
  items: OrderItemInfo[];
  type: string;
  on_created: () => void;
};

export function CreateRequestDialog({
  order_id,
  items,
  type,
  on_created,
}: CreateRequestDialogProps) {
  const t = useTranslations("orders");
  const [open, set_open] = useState(false);
  const [reason, set_reason] = useState("");
  const [note, set_note] = useState("");

  const create_mutation = trpc.returns.adminCreate.useMutation({
    onSuccess: () => {
      toast.success(t("request_created"));
      set_open(false);
      on_created();
    },
    onError: (err) => toast.error(`${t("error")}: ${err.message}`),
  });

  function handle_submit() {
    if (!reason.trim()) {
      toast.error(t("please_enter_reason"));
      return;
    }
    create_mutation.mutate({
      order_id,
      type: type as "return" | "replacement" | "failed_delivery",
      reason,
      customer_note: note || undefined,
      items: items.map((i) => ({
        sku_id: i.sku_id,
        product_name: i.product_name,
        sku_code: i.sku_code,
        quantity: i.quantity,
        unit_price: i.unit_price,
      })),
    });
  }

  const button_label = type === "failed_delivery" ? t("failed_delivery") : type === "return" ? t("return") : t("replacement");

  const button_icon =
    type === "failed_delivery"
      ? <PackageX className="h-3 w-3" />
      : type === "return"
        ? <RotateCcw className="h-3 w-3" />
        : <ArrowLeftRight className="h-3 w-3" />;

  return (
    <QueryGuard mutation={create_mutation}>
    <Dialog open={open} onOpenChange={set_open}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant={type === "failed_delivery" ? "destructive" : "outline"}
          className="gap-1"
        >
          {button_icon}
          {button_label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "return"
              ? t("new_return_request")
              : type === "replacement"
                ? t("new_replacement_request")
                : t("new_failed_delivery_request")}
          </DialogTitle>
          <DialogDescription>
            {type === "return"
              ? t("return_description")
              : type === "replacement"
                ? t("replacement_description")
                : t("failed_delivery_description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border text-sm">
            <table className="w-full text-xs">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">{t("product")}</th>
                  <th className="px-3 py-2 text-left font-medium">{t("sku")}</th>
                  <th className="px-3 py-2 text-right font-medium">{t("qty")}</th>
                  <th className="px-3 py-2 text-right font-medium">{t("price")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2 font-medium">{item.product_name}</td>
                    <td className="px-3 py-2 font-mono">{item.sku_code}</td>
                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">
                      {Number(item.unit_price).toLocaleString("fr-FR")} DZD
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("reason")} *</label>
            <Textarea
              placeholder={t("return_reason_placeholder")}
              value={reason}
              onChange={(e) => set_reason(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("internal_note_optional")}</label>
            <Textarea
              placeholder={t("team_note_placeholder")}
              value={note}
              onChange={(e) => set_note(e.target.value)}
              className="min-h-[60px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => set_open(false)}>
            {t("cancel")}
          </Button>
          <Button
            onClick={handle_submit}
            disabled={create_mutation.isPending || !reason.trim()}
          >
            {create_mutation.isPending ? t("creating") : t("create_request")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
