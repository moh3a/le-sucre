"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Phone } from "lucide-react";

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
import { QueryGuard } from "@/components/query-guard";
import { CustomerCombobox } from "@/features/order_management_system/customers/components/customer-combobox";
import { OrderCombobox } from "@/features/order_management_system/orders/components/order-combobox";
import { UserCombobox } from "@/features/authentication_and_authorization/auth/components/user-combobox";

export function CreateFollowUpDialog() {
  const t = useTranslations("followups");
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [followUpType, setFollowUpType] = useState("follow_up");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");

  const utils = trpc.useUtils();
  const mutation = trpc.operations.customerCreateFollowUp.useMutation({
    onSuccess: () => {
      toast.success(t("follow_up_created"));
      setOpen(false);
      reset();
      utils.operations.customerListMyFollowUps.invalidate();
      utils.operations.customerGetOverdueFollowUps.invalidate();
    },
    onError: (err) => toast.error(`${t("error")}: ${err.message}`),
  });

  function reset() {
    setUserId(null);
    setOrderId(null);
    setFollowUpType("follow_up");
    setTitle("");
    setDescription("");
    setPriority("normal");
    setAssignedTo(null);
    setScheduledAt("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !scheduledAt) {
      toast.error(t("fill_required_fields"));
      return;
    }
    mutation.mutate({
      user_id: userId || null,
      order_id: orderId || null,
      follow_up_type: followUpType as "callback" | "follow_up" | "reminder",
      title,
      description: description || undefined,
      priority: priority as "low" | "normal" | "high" | "urgent",
      assigned_to_user_id: assignedTo || undefined,
      scheduled_at: new Date(scheduledAt).toISOString(),
    });
  }

  return (
    <QueryGuard mutation={mutation}>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Phone className="mr-2 size-4" />
          {t("new_follow_up")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogHeader>
          <DialogTitle>{t("create_follow_up_title")}</DialogTitle>
          <DialogDescription>
            {t("create_follow_up_description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("title")} *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("subject_placeholder")}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("type")}</Label>
              <Select value={followUpType} onValueChange={setFollowUpType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="callback">{t("callback")}</SelectItem>
                  <SelectItem value="follow_up">{t("follow_up")}</SelectItem>
                  <SelectItem value="reminder">{t("reminder_auto")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("priority")}</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t("priority_low")}</SelectItem>
                  <SelectItem value="normal">{t("priority_normal")}</SelectItem>
                  <SelectItem value="high">{t("priority_high")}</SelectItem>
                  <SelectItem value="urgent">{t("priority_urgent")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("client")}</Label>
              <CustomerCombobox
                value={userId}
                onValueChange={setUserId}
                placeholder={t("client_id_placeholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("order")}</Label>
              <OrderCombobox
                value={orderId}
                onValueChange={setOrderId}
                placeholder={t("order_id_placeholder")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("description")}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("notes_placeholder")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("scheduled_at")} *</Label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t("assigned_to")}</Label>
              <UserCombobox
                value={assignedTo}
                onValueChange={setAssignedTo}
                placeholder={t("user_id_placeholder")}
                allowedRoles={["admin", "operator", "moderator"]}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t("creating") : t("create_follow_up")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
