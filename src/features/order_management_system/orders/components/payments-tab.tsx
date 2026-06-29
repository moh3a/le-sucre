"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useTranslations } from "next-intl";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PAYMENT_LABELS,
  PAYMENT_BADGE,
  PAYMENT_STATUS_OPTIONS,
} from "../constants/order-status";

type PaymentsTabProps = {
  order_id: string;
  payment_status: string;
  payment_provider: string | null;
  payment_reference: string | null;
  grand_total: string;
  on_update: () => void;
};

export function PaymentsTab({
  order_id,
  payment_status,
  payment_provider,
  payment_reference,
  grand_total,
  on_update,
}: PaymentsTabProps) {
  const t = useTranslations("payments");
  const update_payment = trpc.orders.adminUpdatePayment.useMutation({
    onSuccess: () => {
      on_update();
      toast.success(t("payment_updated"));
    },
    onError: (err) => toast.error(t("error_prefix", { message: err.message })),
  });

  const [pay_status, set_pay_status] = useState("");
  const [pay_provider, set_pay_provider] = useState("");
  const [pay_reference, set_pay_reference] = useState("");

  function init_payment_form() {
    set_pay_status(payment_status);
    set_pay_provider(payment_provider ?? "");
    set_pay_reference(payment_reference ?? "");
  }

  function on_save_payment() {
    update_payment.mutate({
      order_id,
      payment_status: pay_status as "pending" | "authorized" | "paid" | "failed" | "refunded",
      payment_provider: pay_provider || null,
      payment_reference: pay_reference || null,
    });
  }

  return (
    <QueryGuard mutation={update_payment}>
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>{t("informations_paiement")}</CardTitle>
          <Button size="sm" variant="outline" onClick={init_payment_form}>
            {t("modifier_paiement")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground w-36">{t("statut")}</span>
            <Badge variant={PAYMENT_BADGE[payment_status] ?? "outline"}>
              {PAYMENT_LABELS[payment_status] ?? payment_status}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground w-36">{t("prestataire")}</span>
            <span>{payment_provider ?? "—"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground w-36">{t("reference")}</span>
            <span className="font-mono text-xs">{payment_reference ?? "—"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground w-36">{t("montant_total")}</span>
            <span className="font-semibold">
              {Number(grand_total).toLocaleString("fr-FR")} DZD
            </span>
          </div>
        </CardContent>
      </Card>

      {pay_status && (
        <Card className="mt-4 border-blue-200">
          <CardHeader>
            <CardTitle>{t("modifier_paiement")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field>
              <FieldLabel>{t("statut")}</FieldLabel>
              <Select value={pay_status} onValueChange={set_pay_status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>{t("prestataire")}</FieldLabel>
              <Input
                value={pay_provider}
                onChange={(e) => set_pay_provider(e.target.value)}
                placeholder={t("provider_placeholder")}
              />
            </Field>
            <Field>
              <FieldLabel>{t("reference")}</FieldLabel>
              <Input
                value={pay_reference}
                onChange={(e) => set_pay_reference(e.target.value)}
                placeholder={t("transaction_id_placeholder")}
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => set_pay_status("")}>
                {t("annuler")}
              </Button>
              <Button
                size="sm"
                onClick={on_save_payment}
                disabled={update_payment.isPending}
              >
                {update_payment.isPending ? t("saving") : t("save")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
    </QueryGuard>
  );
}
