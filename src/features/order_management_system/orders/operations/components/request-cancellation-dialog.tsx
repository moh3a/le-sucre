"use client";

import { useTranslations } from "next-intl";
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
import { Ban } from "lucide-react";
import { QueryGuard } from "@/components/query-guard";

export function RequestCancellationDialog() {
  const t = useTranslations("cancellations");
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const utils = trpc.useUtils();
  const mutation = trpc.operations.orderRequestCancellation.useMutation({
    onSuccess: () => {
      toast.success("Demande d'annulation soumise");
      setOpen(false);
      reset();
      utils.operations.orderListCancellationRequests.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function reset() {
    setOrderId("");
    setReason("");
    setDescription("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId || !reason) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    mutation.mutate({
      order_id: orderId,
      reason,
      description: description || undefined,
    });
  }

  return (
    <QueryGuard mutation={mutation}>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Ban className="mr-2 size-4" />
          {t("request_cancellation")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("request_title")}</DialogTitle>
          <DialogDescription>
            {t("request_description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cn_order_id">{t("order")} *</Label>
            <Input
              id="cn_order_id"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder={t("order_id_placeholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cn_reason">{t("reason")} *</Label>
            <Select value={reason} onValueChange={setReason} required>
              <SelectTrigger>
                <SelectValue placeholder={t("select_reason_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer_request">Demande client</SelectItem>
                <SelectItem value="payment_issue">Problème de paiement</SelectItem>
                <SelectItem value="out_of_stock">Rupture de stock</SelectItem>
                <SelectItem value="fraud">Fraude</SelectItem>
                <SelectItem value="duplicate">Doublon</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cn_description">{t("description")}</Label>
            <Textarea
              id="cn_description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("details_placeholder")}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t("sending") : t("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
