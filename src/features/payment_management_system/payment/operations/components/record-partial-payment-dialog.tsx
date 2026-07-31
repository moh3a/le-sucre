"use client";

import { useState } from "react";
import { trpc } from "@/components/providers/app-providers";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Banknote } from "lucide-react";
import { QueryGuard } from "@/components/query-guard";
import { useTranslations } from "next-intl";

export function RecordPartialPaymentDialog() {
  const t = useTranslations("payments");
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [paymentNumber, setPaymentNumber] = useState("1");
  const [type, setType] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("DZD");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [notes, setNotes] = useState("");

  const utils = trpc.useUtils();
  const mutation = trpc.operations.paymentRecordPartial.useMutation({
    onSuccess: () => {
      toast.success(t("partial_payment_recorded"));
      setOpen(false);
      reset();
      utils.operations.paymentGetPartialPayments.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function reset() {
    setOrderId("");
    setPaymentNumber("1");
    setType("deposit");
    setAmount("");
    setCurrency("DZD");
    setPaymentMethod("");
    setPaymentReference("");
    setNotes("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId || !amount) {
      toast.error(t("fill_required"));
      return;
    }
    mutation.mutate({
      order_id: orderId,
      payment_number: Number(paymentNumber),
      type: type as "deposit" | "installment" | "balance",
      amount: Number(amount),
      currency,
      payment_method: paymentMethod || undefined,
      payment_reference: paymentReference || undefined,
      notes: notes || undefined,
    });
  }

  return (
    <QueryGuard mutation={mutation}>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Banknote className="mr-2 size-4" />
          {t("partial_payment_button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("record_partial_title")}</DialogTitle>
          <DialogDescription>
            {t("record_partial_desc")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pp_order_id">{t("order")} *</Label>
              <Input
                id="pp_order_id"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder={t("order_id_placeholder")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pp_amount">{t("amount")} *</Label>
              <Input
                id="pp_amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pp_type">{t("type")}</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">{t("type_deposit")}</SelectItem>
                  <SelectItem value="installment">{t("type_installment")}</SelectItem>
                  <SelectItem value="balance">{t("type_balance")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pp_payment_number">{t("payment_number")}</Label>
              <Input
                id="pp_payment_number"
                type="number"
                min="1"
                value={paymentNumber}
                onChange={(e) => setPaymentNumber(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pp_currency">{t("currency")}</Label>
              <Input
                id="pp_currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pp_method">{t("method")}</Label>
              <Input
                id="pp_method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder={t("payment_method_placeholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pp_reference">{t("reference")}</Label>
              <Input
                id="pp_reference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pp_notes">{t("notes")}</Label>
            <Textarea
              id="pp_notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("notes_placeholder")}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
