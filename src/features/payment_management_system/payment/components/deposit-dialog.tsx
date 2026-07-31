"use client";

import * as React from "react";
import { toast } from "sonner";
import { Landmark } from "lucide-react";
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
import { type PaymentProvider, PaymentProviders } from "@/features/payment_management_system/payment/constants/payment-status";

interface DepositDialogProps {
  orderId?: string;
  trigger?: React.ReactNode;
}

export function DepositDialog({ orderId, trigger }: DepositDialogProps) {
  const t = useTranslations("payments");
  const [open, setOpen] = React.useState(false);
  const [order_id, setOrderId] = React.useState(orderId ?? "");
  const [provider, setProvider] = React.useState<PaymentProvider>("manual");
  const [deposit_percentage, setDepositPercentage] = React.useState("50");

  const utils = trpc.useUtils();

  const create = trpc.payments.adminCreateDeposit.useMutation({
    onSuccess: () => {
      toast.success(t("deposit_created"));
      setOpen(false);
      setOrderId(orderId ?? "");
      setProvider("manual");
      setDepositPercentage("50");
      void utils.payments.adminList.invalidate();
      void utils.payments.adminStats.invalidate();
    },
    onError: (err) => toast.error(t("error_prefix", { message: err.message })),
  });

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({
      order_id,
      type: "deposit",
      provider: provider,
      deposit_percentage: Number(deposit_percentage),
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <Landmark className="mr-2 h-4 w-4" />
            {t("create_deposit")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("create_deposit_title")}</DialogTitle>
          <DialogDescription>
            {t("deposit_description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handle_submit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("order_id_label")}</Label>
            <Input
              value={order_id}
              onChange={(e) => setOrderId(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{t("payment_provider_label")}</Label>
            <Select value={provider} onValueChange={setProvider as (value: string) => void}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PaymentProviders.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("deposit_percentage")}</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={deposit_percentage}
              onChange={(e) => setDepositPercentage(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              {t("deposit_calculated_hint")}
            </p>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={create.isPending}
          >
            <Landmark />
            {t("create_deposit_button")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
