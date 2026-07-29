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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, Truck } from "lucide-react";
import { QueryGuard } from "@/components/query-guard";
import { ShippingCombobox } from "@/features/shipping_management_system/components/shipping-combobox";
import { OrderCombobox } from "@/features/order_management_system/orders/components/order-combobox";

type LogAttemptDialogProps = {
  order_id?: string;
  shipment_id?: string;
};

export function LogAttemptDialog({ order_id, shipment_id }: LogAttemptDialogProps) {
  const t = useTranslations("delivery_attempts");
  const [open, setOpen] = useState(false);
  const [shipmentId, setShipmentId] = useState(shipment_id ?? "");
  const [orderId, setOrderId] = useState(order_id ?? "");
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");
  const [nextAttemptAt, setNextAttemptAt] = useState("");

  const utils = trpc.useUtils();
  const mutation = trpc.operations.deliveryLogAttempt.useMutation({
    onSuccess: () => {
      toast.success(t("attempt_logged"));
      setOpen(false);
      reset();
      utils.operations.deliveryListAttempts.invalidate();
      utils.operations.deliveryGetStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function reset() {
    setShipmentId(shipment_id ?? "");
    setOrderId(order_id ?? "");
    setStatus("");
    setDescription("");
    setNextAttemptAt("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shipmentId || !orderId || !status) {
      toast.error(t("fill_required"));
      return;
    }
    mutation.mutate({
      shipment_id: shipmentId,
      order_id: orderId,
      status: status as
        | "successful"
        | "failed"
        | "customer_unavailable"
        | "wrong_address"
        | "refused"
        | "cancelled",
      description: description || undefined,
      next_attempt_at: nextAttemptAt || undefined,
    });
  }

  return (
    <QueryGuard mutation={mutation}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Truck className="mr-2 size-4" />
            {t("log_attempt")}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>{t("log_delivery_attempt")}</DialogTitle>
            <DialogDescription>{t("log_delivery_attempt_desc")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("shipment")} *</Label>
                <ShippingCombobox
                  value={shipmentId}
                  onValueChange={(v) => setShipmentId(v ?? "")}
                  placeholder={t("shipment_id_placeholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("order")} *</Label>
                <OrderCombobox
                  value={orderId}
                  onValueChange={(v) => setOrderId(v ?? "")}
                  placeholder={t("order_id_placeholder")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">{t("status")} *</Label>
              <Select value={status} onValueChange={setStatus} required>
                <SelectTrigger>
                  <SelectValue placeholder={t("select_status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="successful">{t("delivered")}</SelectItem>
                  <SelectItem value="failed">{t("failed")}</SelectItem>
                  <SelectItem value="customer_unavailable">{t("customer_unavailable")}</SelectItem>
                  <SelectItem value="wrong_address">{t("wrong_address")}</SelectItem>
                  <SelectItem value="refused">{t("refused")}</SelectItem>
                  <SelectItem value="cancelled">{t("cancelled")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t("description")}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("description_placeholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next_attempt_at">{t("next_attempt")}</Label>
              <Input
                id="next_attempt_at"
                type="datetime-local"
                value={nextAttemptAt}
                onChange={(e) => setNextAttemptAt(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("saving")}
                  </>
                ) : (
                  t("save")
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </QueryGuard>
  );
}
