"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, CreditCard } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";

export function RecordPaymentDialog() {
  const t = useTranslations("payments");
  const [open, setOpen] = React.useState(false);
  const [order_id, setOrderId] = React.useState("");
  const [provider, setProvider] = React.useState("stripe");
  const [amount, setAmount] = React.useState("");

  const PROVIDERS = [
    { value: "stripe", label: t("provider_stripe") },
    { value: "paypal", label: t("provider_paypal") },
    { value: "chargily", label: t("provider_chargily") },
    { value: "satim", label: t("provider_satim") },
    { value: "cib", label: t("provider_cib") },
    { value: "cod", label: t("provider_cod") },
    { value: "bank_transfer", label: t("provider_bank_transfer") },
  ] as const;

  const utils = trpc.useUtils();

  const process = trpc.payments.adminProcess.useMutation({
    onSuccess: () => {
      toast.success(t("record_success"));
      setOpen(false);
      setOrderId("");
      setProvider("stripe");
      setAmount("");
      void utils.payments.adminList.invalidate();
      void utils.payments.adminStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    process.mutate({
      order_id,
      provider: provider as never,
      amount: Number(amount),
    });
  }

  return (
    <QueryGuard mutation={process}>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          {t("record_button")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("record_title")}</DialogTitle>
          <DialogDescription>
            {t("record_description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handle_submit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("order_id_label")}</Label>
            <Input value={order_id} onChange={(e) => setOrderId(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>{t("amount_dzd_label")}</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{t("payment_method_label")}</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={process.isPending}>
            <CreditCard />
            {t("record_submit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
