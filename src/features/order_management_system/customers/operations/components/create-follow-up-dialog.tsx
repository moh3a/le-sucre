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
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Phone } from "lucide-react";
import { QueryGuard } from "@/components/query-guard";

export function CreateFollowUpDialog() {
  const t = useTranslations("followups");
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [followUpType, setFollowUpType] = useState("follow_up");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [assignedTo, setAssignedTo] = useState("");
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
    setUserId("");
    setOrderId("");
    setFollowUpType("follow_up");
    setTitle("");
    setDescription("");
    setPriority("normal");
    setAssignedTo("");
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
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{t("create_follow_up_title")}</DialogTitle>
          <DialogDescription>
            {t("create_follow_up_description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fu_title">{t("title")} *</Label>
            <Input
              id="fu_title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("subject_placeholder")}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fu_type">{t("type")}</Label>
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
              <Label htmlFor="fu_priority">{t("priority")}</Label>
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
              <Label htmlFor="fu_user_id">{t("client")}</Label>
              <Input
                id="fu_user_id"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={t("client_id_placeholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fu_order_id">{t("order")}</Label>
              <Input
                id="fu_order_id"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder={t("order_id_placeholder")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fu_description">{t("description")}</Label>
            <Textarea
              id="fu_description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("notes_placeholder")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fu_scheduled_at">{t("scheduled_at")} *</Label>
              <Input
                id="fu_scheduled_at"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fu_assigned_to">{t("assigned_to")}</Label>
              <Input
                id="fu_assigned_to"
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
              {mutation.isPending ? t("creating") : t("create_follow_up")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
