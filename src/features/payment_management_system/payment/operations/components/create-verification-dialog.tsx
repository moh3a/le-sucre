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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { QueryGuard } from "@/components/query-guard";
import { useTranslations } from "next-intl";

export function CreateVerificationDialog() {
  const t = useTranslations("verifications");
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("DZD");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [notes, setNotes] = useState("");

  const utils = trpc.useUtils();
  const mutation = trpc.operations.paymentCreateVerification.useMutation({
    onSuccess: () => {
      toast.success(t("verification_created"));
      setOpen(false);
      reset();
      utils.operations.paymentListVerifications.invalidate();
      utils.operations.paymentCountPendingVerifications.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function reset() {
    setOrderId("");
    setAmount("");
    setCurrency("DZD");
    setReferenceNumber("");
    setProofUrl("");
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
      amount: Number(amount),
      currency,
      reference_number: referenceNumber || undefined,
      proof_url: proofUrl || undefined,
      notes: notes || undefined,
    });
  }

  return (
    <QueryGuard mutation={mutation}>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          {t("new_verification")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("create_title")}</DialogTitle>
          <DialogDescription>
            {t("create_description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pv_order_id">{t("order")} *</Label>
              <Input
                id="pv_order_id"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder={t("order_id_placeholder")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pv_amount">{t("amount")} *</Label>
              <Input
                id="pv_amount"
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
              <Label htmlFor="pv_currency">{t("currency")}</Label>
              <Input
                id="pv_currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder={t("currency_placeholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pv_reference">{t("reference")}</Label>
              <Input
                id="pv_reference"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder={t("reference_placeholder")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pv_proof">{t("proof_url_label")}</Label>
            <Input
              id="pv_proof"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder={t("url_placeholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pv_notes">{t("notes")}</Label>
            <Textarea
              id="pv_notes"
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
              {mutation.isPending ? t("creating") : t("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
