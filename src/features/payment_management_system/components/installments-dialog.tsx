"use client";

import * as React from "react";
import { toast } from "sonner";
import { Calendar, CheckCircle, Clock, DollarSign, XCircle } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { formatDate } from "@/lib/utils";

const PROVIDERS = [
  { value: "stripe", label: "Stripe" },
  { value: "paypal", label: "PayPal" },
  { value: "chargily", label: "Chargily" },
  { value: "satim", label: "SATIM" },
  { value: "cib", label: "CIB" },
  { value: "manual", label: "Manuel" },
] as const;

// ─── InstallmentsDialog ─────────────────────────────────────

interface InstallmentsDialogProps {
  orderId?: string;
  trigger?: React.ReactNode;
}

export function InstallmentsDialog({ orderId, trigger }: InstallmentsDialogProps) {
  const t = useTranslations("payments");
  const [open, setOpen] = React.useState(false);
  const [order_id, setOrderId] = React.useState(orderId ?? "");
  const [provider, setProvider] = React.useState("manual");
  const [total_installments, setTotalInstallments] = React.useState("3");

  const utils = trpc.useUtils();

  const create = trpc.payments.adminCreateInstallments.useMutation({
    onSuccess: () => {
      toast.success(t("installment_created"));
      setOpen(false);
      setOrderId(orderId ?? "");
      setProvider("manual");
      setTotalInstallments("3");
      void utils.payments.adminList.invalidate();
      void utils.payments.adminStats.invalidate();
    },
    onError: (err) => toast.error(t("error_prefix", { message: err.message })),
  });

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({
      order_id,
      type: "installment",
      provider: provider as never,
      total_installments: Number(total_installments),
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            {t("installment_button")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("installment_title")}</DialogTitle>
          <DialogDescription>
            {t("installment_description")}
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
          <div className="space-y-2">
            <Label>{t("installment_count")}</Label>
            <Input
              type="number"
              min="2"
              max="12"
              value={total_installments}
              onChange={(e) => setTotalInstallments(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              {t("installment_count_hint")}
            </p>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={create.isPending}
          >
            <Calendar />
            {t("create_installment_button")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── InstallmentsView ───────────────────────────────────────

const INSTALLMENT_STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

interface InstallmentsViewProps {
  orderId: string;
}

export function InstallmentsView({ orderId }: InstallmentsViewProps) {
  const t = useTranslations("payments");
  const { data: installments, isFetching } = trpc.payments.adminInstallments.useQuery(
    { order_id: orderId },
    { enabled: !!orderId },
  );

  const utils = trpc.useUtils();
  const payMutation = trpc.payments.adminPayInstallment.useMutation({
    onSuccess: () => {
      toast.success(t("installment_marked_paid"));
      void utils.payments.adminInstallments.invalidate({ order_id: orderId });
    },
    onError: (err) => toast.error(t("error_prefix", { message: err.message })),
  });

  if (isFetching) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (!installments || installments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        {t("installments_empty")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {installments.map((inst) => (
        <div
          key={inst.id}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {t("installment_number", { number: inst.installment_number, total: inst.total_installments })}
              </span>
              <Badge
                className={INSTALLMENT_STATUS_STYLES[inst.status] ?? ""}
                variant="outline"
              >
                {inst.status === "pending"
                  ? t("installment_pending")
                  : inst.status === "paid"
                    ? t("installment_paid")
                    : inst.status === "overdue"
                      ? t("installment_overdue")
                      : inst.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {new Intl.NumberFormat("fr-DZ", {
                  style: "currency",
                  currency: "DZD",
                }).format(Number(inst.amount))}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(inst.due_at)}
              </span>
              {inst.paid_at && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  {t("installment_paid_on", { date: formatDate(inst.paid_at) })}
                </span>
              )}
            </div>
          </div>
          {inst.status === "pending" && (
            <Button
              size="sm"
              onClick={() =>
                payMutation.mutate({
                  installment_id: inst.id,
                  provider: "manual" as never,
                })
              }
              disabled={payMutation.isPending}
            >
              {t("installment_mark_paid_button")}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
