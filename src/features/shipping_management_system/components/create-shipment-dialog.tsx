"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Package } from "lucide-react";

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

const PROVIDERS = ["yalidine", "dhl", "fedex", "ups", "ems"] as const;

export function CreateShipmentDialog() {
  const t = useTranslations("shipping");
  const [open, setOpen] = React.useState(false);
  const [order_id, setOrderId] = React.useState("");
  const [provider, setProvider] = React.useState<string>("yalidine");
  const [weight_kg, setWeightKg] = React.useState("1");

  const utils = trpc.useUtils();

  const create = trpc.shipping.create.useMutation({
    onSuccess: () => {
      toast.success(t("shipment_created"));
      setOpen(false);
      setOrderId("");
      setProvider("yalidine");
      setWeightKg("1");
      void utils.shipping.adminList.invalidate();
      void utils.shipping.adminStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({
      order_id,
      provider: provider as "yalidine" | "dhl" | "fedex" | "ups" | "ems",
      weight_kg: Number(weight_kg),
    });
  }

  return (
    <QueryGuard mutation={create}>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          {t("new_shipment")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("create_shipment_title")}</DialogTitle>
          <DialogDescription>
            {t("create_shipment_desc")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handle_submit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("order_id")}</Label>
            <Input value={order_id} onChange={(e) => setOrderId(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>{t("provider")}</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("weight_kg")}</Label>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              value={weight_kg}
              onChange={(e) => setWeightKg(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={create.isPending}>
            <Package />
            {t("create_shipment_button")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
