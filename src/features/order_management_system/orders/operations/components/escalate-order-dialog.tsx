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
import { AlertTriangle } from "lucide-react";
import { QueryGuard } from "@/components/query-guard";

export function EscalateOrderDialog() {
  const t = useTranslations("escalations");
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [assignedTo, setAssignedTo] = useState("");

  const utils = trpc.useUtils();
  const mutation = trpc.operations.orderEscalate.useMutation({
    onSuccess: () => {
      toast.success("Commande escaladée");
      setOpen(false);
      reset();
      utils.operations.orderListEscalations.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function reset() {
    setOrderId("");
    setReason("");
    setDescription("");
    setPriority("normal");
    setAssignedTo("");
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
      priority: priority as "low" | "normal" | "high" | "urgent",
      assigned_to_user_id: assignedTo || undefined,
    });
  }

  return (
    <QueryGuard mutation={mutation}>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <AlertTriangle className="mr-2 size-4" />
          {t("escalate")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("escalate_title")}</DialogTitle>
          <DialogDescription>
            {t("escalate_description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="esc_order_id">{t("order")} *</Label>
            <Input
              id="esc_order_id"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder={t("order_id_placeholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="esc_reason">{t("reason")} *</Label>
            <Select value={reason} onValueChange={setReason} required>
              <SelectTrigger>
                <SelectValue placeholder={t("select_reason_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payment_dispute">Litige paiement</SelectItem>
                <SelectItem value="customer_complaint">Réclamation client</SelectItem>
                <SelectItem value="delivery_issue">Problème livraison</SelectItem>
                <SelectItem value="technical">Technique</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="esc_description">{t("description")}</Label>
            <Textarea
              id="esc_description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("details_placeholder")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="esc_priority">{t("priority")}</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="normal">Normale</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="esc_assigned_to">{t("assigned_to")}</Label>
              <Input
                id="esc_assigned_to"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder={t("user_id_placeholder")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t("escalating") : t("escalate")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
