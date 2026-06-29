"use client";

import * as React from "react";
import { toast } from "sonner";
import { FileText, Receipt, Plus, X } from "lucide-react";

import { useTranslations } from "next-intl";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

type InvoiceExtrasDialogProps = {
  invoice: {
    id: string;
    order_id: string;
  };
  trigger?: React.ReactNode;
};

export function InvoiceExtrasDialog({ invoice, trigger }: InvoiceExtrasDialogProps) {
  const t = useTranslations("invoices");
  const [open, set_open] = React.useState(false);
  const is_mobile = useIsMobile();
  const utils = trpc.useUtils();

  const [refund_items, set_refund_items] = React.useState<
    Array<{ sku_id: string; quantity: number; amount: string }>
  >([]);
  const [refund_notes, set_refund_notes] = React.useState("");

  const [credit_amount, set_credit_amount] = React.useState("");
  const [credit_notes, set_credit_notes] = React.useState("");

  function add_refund_item() {
    set_refund_items((prev) => [...prev, { sku_id: "", quantity: 1, amount: "0.00" }]);
  }

  function remove_refund_item(index: number) {
    set_refund_items((prev) => prev.filter((_, i) => i !== index));
  }

  function update_refund_item(
    index: number,
    field: keyof (typeof refund_items)[number],
    value: string | number,
  ) {
    set_refund_items((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  const refund_mutation = trpc.invoices.generate_refund_invoice.useMutation({
    onSuccess: () => {
      toast.success(t("refund_success"));
      set_open(false);
      reset_refund();
      utils.invoices.list_invoices.invalidate();
      utils.invoices.get_invoice.invalidate({ id: invoice.id });
    },
    onError: (e) => toast.error(e.message),
  });

  const credit_note_mutation = trpc.invoices.generate_credit_note.useMutation({
    onSuccess: () => {
      toast.success(t("credit_note_success"));
      set_open(false);
      reset_credit();
      utils.invoices.list_invoices.invalidate();
      utils.invoices.get_invoice.invalidate({ id: invoice.id });
    },
    onError: (e) => toast.error(e.message),
  });

  function reset_refund() {
    set_refund_items([]);
    set_refund_notes("");
  }

  function reset_credit() {
    set_credit_amount("");
    set_credit_notes("");
  }

  function handle_refund(e: React.FormEvent) {
    e.preventDefault();
    if (refund_items.length === 0 || refund_items.some((i) => !i.sku_id || !i.amount)) {
      toast.error(t("refund_fields_required"));
      return;
    }
    refund_mutation.mutate({
      order_id: invoice.order_id,
      refund_items,
      notes: refund_notes || undefined,
    });
  }

  function handle_credit_note(e: React.FormEvent) {
    e.preventDefault();
    if (!credit_amount) {
      toast.error(t("credit_amount_required"));
      return;
    }
    credit_note_mutation.mutate({
      order_id: invoice.order_id,
      amount: credit_amount,
      notes: credit_notes || undefined,
    });
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={set_open}>
      {trigger ? <ResponsiveDialogTrigger asChild>{trigger}</ResponsiveDialogTrigger> : null}
      <ResponsiveDialogContent className={is_mobile ? "" : "sm:max-w-xl"}>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{t("invoice_actions_title")}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {t("invoice_actions_description")}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <Tabs defaultValue="refund" className="py-2">
          <TabsList className="w-full">
            <TabsTrigger value="refund" className="flex-1">
              <Receipt className="mr-2 size-4" />
              {t("refund_tab")}
            </TabsTrigger>
            <TabsTrigger value="credit" className="flex-1">
              <FileText className="mr-2 size-4" />
              {t("credit_note_tab")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="refund" className="space-y-4 pt-4">
            <form onSubmit={handle_refund} className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">{t("refund_items_label")}</Label>
                  <Button type="button" variant="outline" size="sm" onClick={add_refund_item}>
                    <Plus />
                    {t("add")}
                  </Button>
                </div>
                {refund_items.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    {t("refund_items_empty")}
                  </p>
                )}
                {refund_items.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 rounded-md border p-3">
                    <div className="grid flex-1 grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">{t("sku_id_label")}</Label>
                        <Input
                          value={item.sku_id}
                          onChange={(e) => update_refund_item(index, "sku_id", e.target.value)}
                          placeholder="sku_id"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t("quantity_label")}</Label>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            update_refund_item(index, "quantity", Number(e.target.value))
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t("amount_label")}</Label>
                        <Input
                          value={item.amount}
                          onChange={(e) => update_refund_item(index, "amount", e.target.value)}
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-5 size-7 shrink-0 text-destructive"
                      onClick={() => remove_refund_item(index)}
                    >
                      <X />
                    </Button>
                  </div>
                ))}
              </div>
              <div>
                <Label htmlFor="refund_notes">{t("notes_optional")}</Label>
                <Textarea
                  id="refund_notes"
                  value={refund_notes}
                  onChange={(e) => set_refund_notes(e.target.value)}
                  placeholder={t("refund_notes_placeholder")}
                  rows={2}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={refund_mutation.isPending || refund_items.length === 0}
              >
                <Receipt />
                {t("generate_refund_button")}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="credit" className="space-y-4 pt-4">
            <form onSubmit={handle_credit_note} className="space-y-4">
              <div>
                <Label htmlFor="credit_amount">{t("credit_amount_label")}</Label>
                <Input
                  id="credit_amount"
                  value={credit_amount}
                  onChange={(e) => set_credit_amount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="credit_notes">{t("notes_optional")}</Label>
                <Textarea
                  id="credit_notes"
                  value={credit_notes}
                  onChange={(e) => set_credit_notes(e.target.value)}
                  placeholder={t("credit_notes_placeholder")}
                  rows={2}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={credit_note_mutation.isPending || !credit_amount}
              >
                <FileText />
                {t("generate_credit_note_button")}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
