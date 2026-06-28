"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
import { toast } from "sonner";
import { Calendar } from "lucide-react";
import { QueryGuard } from "@/components/query-guard";

export function SchedulePublishingDialog() {
  const t = useTranslations("publishing");
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [action, setAction] = useState<"publish" | "unpublish">("publish");
  const [scheduledAt, setScheduledAt] = useState("");

  const utils = trpc.useUtils();
  const mutation = trpc.operations.productSchedulePublish.useMutation({
    onSuccess: () => {
      toast.success(t("scheduled_success"));
      setOpen(false);
      reset();
      utils.operations.productListScheduledActions.invalidate();
      utils.operations.productGetScheduleStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function reset() {
    setProductId("");
    setAction("publish");
    setScheduledAt("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId || !scheduledAt) {
      toast.error(t("fill_required"));
      return;
    }
    mutation.mutate({
      product_id: productId,
      action,
      scheduled_at: new Date(scheduledAt).toISOString(),
    });
  }

  return (
    <QueryGuard mutation={mutation}>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Calendar className="mr-2 size-4" />
          {t("schedule")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{t("dialog_title")}</DialogTitle>
          <DialogDescription>
            {t("dialog_description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ps_product_id">{t("product_label")}</Label>
            <Input
              id="ps_product_id"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder={t("product_id_placeholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ps_action">{t("action_label")}</Label>
            <Select
              value={action}
              onValueChange={(v) => setAction(v as "publish" | "unpublish")}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publish">{t("publish")}</SelectItem>
                <SelectItem value="unpublish">{t("unpublish")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ps_scheduled_at">{t("scheduled_at_label")}</Label>
            <Input
              id="ps_scheduled_at"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t("scheduling") : t("schedule")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
