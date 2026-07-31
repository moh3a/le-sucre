"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Banknote } from "lucide-react";

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
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";

export function CreatePayoutDialog() {
  const t = useTranslations("payouts");
  const [open, setOpen] = React.useState(false);
  const [vendor_id, setVendorId] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [commission_rate, setCommissionRate] = React.useState("0");
  const [description, setDescription] = React.useState("");

  const utils = trpc.useUtils();

  const create = trpc.payments.adminCreatePayout.useMutation({
    onSuccess: () => {
      toast.success(t("create_payout_success"));
      setOpen(false);
      setVendorId("");
      setAmount("");
      setCommissionRate("0");
      setDescription("");
      void utils.payments.adminListPayouts.invalidate();
      void utils.payments.adminPayoutStats.invalidate();
    },
    onError: (err) => toast.error(t("error_prefix", { message: err.message })),
  });

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({
      vendor_id,
      amount: Number(amount),
      commission_rate: Number(commission_rate),
      description: description || undefined,
    });
  }

  return (
    <QueryGuard mutation={create}>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          {t("new_payout_button")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("create_payout_title")}</DialogTitle>
          <DialogDescription>
            {t("create_payout_description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handle_submit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("vendor_id_label")}</Label>
            <Input value={vendor_id} onChange={(e) => setVendorId(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>{t("amount_label")}</Label>
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
            <Label>{t("commission_rate_label")}</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={commission_rate}
              onChange={(e) => setCommissionRate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("description_label")}</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={create.isPending}>
            <Banknote />
            {t("create_payout_button")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
