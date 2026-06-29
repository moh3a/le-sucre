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
import { Plus } from "lucide-react";
import { QueryGuard } from "@/components/query-guard";

export function CreateWarrantyClaimDialog() {
  const t = useTranslations("warranty");
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderItemId, setOrderItemId] = useState("");
  const [productId, setProductId] = useState("");
  const [skuId, setSkuId] = useState("");
  const [userId, setUserId] = useState("");
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [technicianUserId, setTechnicianUserId] = useState("");

  const utils = trpc.useUtils();
  const mutation = trpc.operations.warrantyCreate.useMutation({
    onSuccess: () => {
      toast.success(t("claim_created"));
      setOpen(false);
      reset();
      utils.operations.warrantyList.invalidate();
      utils.operations.warrantyStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function reset() {
    setOrderId("");
    setOrderItemId("");
    setProductId("");
    setSkuId("");
    setUserId("");
    setIssueType("");
    setDescription("");
    setTechnicianUserId("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId || !productId || !skuId || !issueType || !description) {
      toast.error(t("fill_required"));
      return;
    }
    mutation.mutate({
      order_id: orderId,
      order_item_id: orderItemId || undefined,
      product_id: productId,
      sku_id: skuId,
      user_id: userId || undefined,
      issue_type: issueType,
      description,
      technician_user_id: technicianUserId || undefined,
    });
  }

  return (
    <QueryGuard mutation={mutation}>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          {t("new_warranty")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{t("create_title")}</DialogTitle>
          <DialogDescription>
            {t("create_description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wc_order_id">{t("order")} *</Label>
              <Input
                id="wc_order_id"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder={t("order_id_placeholder")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wc_order_item_id">{t("order_item")}</Label>
              <Input
                id="wc_order_item_id"
                value={orderItemId}
                onChange={(e) => setOrderItemId(e.target.value)}
                placeholder={t("item_id_placeholder")}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wc_product_id">{t("product")} *</Label>
              <Input
                id="wc_product_id"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder={t("product_id_placeholder")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wc_sku_id">{t("sku")} *</Label>
              <Input
                id="wc_sku_id"
                value={skuId}
                onChange={(e) => setSkuId(e.target.value)}
                placeholder={t("sku_id_placeholder")}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wc_user_id">{t("client")}</Label>
              <Input
                id="wc_user_id"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={t("client_id_placeholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wc_technician">{t("technician")}</Label>
              <Input
                id="wc_technician"
                value={technicianUserId}
                onChange={(e) => setTechnicianUserId(e.target.value)}
                placeholder={t("technician_id_placeholder")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="wc_issue_type">{t("issue_type")} *</Label>
            <Select value={issueType} onValueChange={setIssueType} required>
              <SelectTrigger>
                <SelectValue placeholder={t("select_type_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="defect">{t("issue_defect")}</SelectItem>
                <SelectItem value="damage">{t("issue_damage")}</SelectItem>
                <SelectItem value="malfunction">{t("issue_malfunction")}</SelectItem>
                <SelectItem value="cosmetic">{t("issue_cosmetic")}</SelectItem>
                <SelectItem value="other">{t("issue_other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="wc_description">{t("description")} *</Label>
            <Textarea
              id="wc_description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("description_placeholder")}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t("creating") : t("create_warranty")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
