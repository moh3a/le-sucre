"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, FileText } from "lucide-react";

import { useTranslations } from "next-intl";
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
import { trpc } from "@/components/providers/app-providers";
import { OrderCombobox } from "@/features/order_management_system/orders/components/order-combobox";
import { QueryGuard } from "@/components/query-guard";

export function GenerateInvoiceDialog() {
  const t = useTranslations("invoices");
  const [open, setOpen] = React.useState(false);
  const [order_id, setOrderId] = React.useState("");

  const utils = trpc.useUtils();

  const generate = trpc.invoices.generate_invoice.useMutation({
    onSuccess: () => {
      toast.success(t("generate_success"));
      setOpen(false);
      setOrderId("");
      void utils.invoices.list_invoices.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    if (!order_id) return;
    generate.mutate({ order_id });
  }

  return (
    <QueryGuard mutation={generate}>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          {t("generate_trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("generate_title")}</DialogTitle>
          <DialogDescription>
            {t("generate_description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handle_submit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("order_id_label")}</Label>
            <OrderCombobox value={order_id} onValueChange={(val) => setOrderId(val ?? "")} />
          </div>
          <Button type="submit" className="w-full" disabled={generate.isPending}>
            <FileText />
            {t("generate_button")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
