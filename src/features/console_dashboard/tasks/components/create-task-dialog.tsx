"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
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

export function CreateTaskDialog() {
  const t = useTranslations("tasks");
  const [open, setOpen] = useState(false);
  const [taskType, setTaskType] = useState("general");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [referenceType, setReferenceType] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState("normal");
  const [dueAt, setDueAt] = useState("");

  const utils = trpc.useUtils();
  const mutation = trpc.operations.adminTaskCreate.useMutation({
    onSuccess: () => {
      toast.success(t("task_created"));
      setOpen(false);
      reset();
      utils.operations.adminTaskListAll.invalidate();
      utils.operations.adminTaskDashboard.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function reset() {
    setTaskType("general");
    setTitle("");
    setDescription("");
    setReferenceType("");
    setReferenceId("");
    setAssignedTo("");
    setPriority("normal");
    setDueAt("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) {
      toast.error(t("title_required"));
      return;
    }
    mutation.mutate({
      task_type: taskType as "order_follow_up" | "customer_follow_up" | "inventory_review" | "campaign_review" | "general",
      title,
      description: description || undefined,
      reference_type: referenceType || undefined,
      reference_id: referenceId || undefined,
      assigned_to_user_id: assignedTo || undefined,
      priority: priority as "low" | "normal" | "high" | "urgent",
      due_at: dueAt ? new Date(dueAt).toISOString() : undefined,
    });
  }

  return (
    <QueryGuard mutation={{ isPending: mutation.isPending, error: mutation.error }}>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          {t("new_task")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{t("create_task_title")}</DialogTitle>
          <DialogDescription>
            {t("create_task_description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tk_title">{t("title_label")}</Label>
            <Input
              id="tk_title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("subject_placeholder")}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tk_type">{t("type_label")}</Label>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order_follow_up">{t("type_order_follow_up")}</SelectItem>
                  <SelectItem value="customer_follow_up">{t("type_customer_follow_up")}</SelectItem>
                  <SelectItem value="inventory_review">{t("type_inventory_review")}</SelectItem>
                  <SelectItem value="campaign_review">{t("type_campaign_review")}</SelectItem>
                  <SelectItem value="general">{t("type_general")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tk_priority">{t("priority_label")}</Label>
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
          <div className="space-y-2">
            <Label htmlFor="tk_description">{t("description_label")}</Label>
            <Textarea
              id="tk_description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("description_placeholder")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tk_ref_type">{t("reference_type_label")}</Label>
              <Select value={referenceType} onValueChange={setReferenceType}>
                <SelectTrigger>
                  <SelectValue placeholder={t("none_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order">{t("ref_type_order")}</SelectItem>
                  <SelectItem value="campaign">{t("ref_type_campaign")}</SelectItem>
                  <SelectItem value="product">{t("ref_type_product")}</SelectItem>
                  <SelectItem value="customer">{t("ref_type_customer")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tk_ref_id">{t("reference_id_label")}</Label>
              <Input
                id="tk_ref_id"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                placeholder={t("reference_id_placeholder")}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tk_due_at">{t("due_date_label")}</Label>
              <Input
                id="tk_due_at"
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tk_assigned_to">{t("assigned_to_label")}</Label>
              <Input
                id="tk_assigned_to"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder={t("user_id_placeholder")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("cancel_button")}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t("creating_button") : t("create_button")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      </Dialog>
    </QueryGuard>
  );
}
