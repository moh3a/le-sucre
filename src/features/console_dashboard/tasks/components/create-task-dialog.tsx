"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Plus } from "lucide-react";

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
import { STAFF_ROLES } from "@/features/authentication_and_authorization/authorization/constants/roles";
import { UserCombobox } from "@/features/authentication_and_authorization/auth/components/user-combobox";
import { OrderCombobox } from "@/features/order_management_system/orders/components/order-combobox";
import { ShippingCombobox } from "@/features/fulfillment_management_system/shipping/components/shipping-combobox";
import { TransactionCombobox } from "@/features/payment_management_system/payment/components/transaction-combobox";
import { ProductCombobox } from "@/features/product_information_management/products/components/product-combobox";
import { CustomerCombobox } from "@/features/order_management_system/customers/components/customer-combobox";
import { CampaignCombobox } from "@/features/marketing/campaign/components/campaign-combobox";
import {
  TASK_TYPES,
  TASK_TYPE_LABEL_KEYS,
  REFERENCE_TYPES,
  REFERENCE_TYPE_LABEL_KEYS,
  type TaskType,
  type ReferenceType,
} from "../constants/task-types";

export function CreateTaskDialog() {
  const t = useTranslations("tasks");
  const [open, setOpen] = useState(false);
  const [taskType, setTaskType] = useState<TaskType>("general");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [referenceType, setReferenceType] = useState<ReferenceType | "">("");
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [priority, setPriority] = useState("normal");
  const [dueAt, setDueAt] = useState("");

  const utils = trpc.useUtils();
  const mutation = trpc.operations.adminTaskCreate.useMutation({
    onSuccess: () => {
      toast.success(t("task_created"));
      setOpen(false);
      reset();
      utils.operations.adminTaskListAll.invalidate();
      utils.operations.adminTaskListMine.invalidate();
      utils.operations.adminTaskDashboard.invalidate();
      utils.operations.adminTaskTeamDashboard.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function reset() {
    setTaskType("general");
    setTitle("");
    setDescription("");
    setReferenceType("");
    setReferenceId(null);
    setAssignedTo(null);
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
      task_type: taskType,
      title,
      description: description || undefined,
      reference_type: referenceType || undefined,
      reference_id: referenceType ? referenceId ?? undefined : undefined,
      assigned_to_user_id: assignedTo ?? undefined,
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
        <DialogContent className="sm:max-w-137.5">
          <DialogHeader>
            <DialogTitle>{t("create_task_title")}</DialogTitle>
            <DialogDescription>{t("create_task_description")}</DialogDescription>
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
                <Select value={taskType} onValueChange={(v) => setTaskType(v as TaskType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(TASK_TYPE_LABEL_KEYS[type])}
                      </SelectItem>
                    ))}
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
            <div className="space-y-2">
              <Label htmlFor="tk_ref_type">{t("reference_type_label")}</Label>
              <Select
                value={referenceType}
                onValueChange={(v) => {
                  setReferenceType(v as ReferenceType | "");
                  setReferenceId(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("none_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {REFERENCE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(REFERENCE_TYPE_LABEL_KEYS[type])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {referenceType && (
              <div className="space-y-2">
                <Label>{t("reference_id_label")}</Label>
                {referenceType === "order" && (
                  <OrderCombobox value={referenceId} onValueChange={setReferenceId} />
                )}
                {referenceType === "shipment" && (
                  <ShippingCombobox value={referenceId} onValueChange={setReferenceId} />
                )}
                {referenceType === "payment" && (
                  <TransactionCombobox value={referenceId} onValueChange={setReferenceId} />
                )}
                {referenceType === "product" && (
                  <ProductCombobox value={referenceId} onValueChange={setReferenceId} />
                )}
                {referenceType === "customer" && (
                  <CustomerCombobox value={referenceId} onValueChange={setReferenceId} />
                )}
                {referenceType === "campaign" && (
                  <CampaignCombobox value={referenceId} onValueChange={setReferenceId} />
                )}
              </div>
            )}
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
                <UserCombobox
                  value={assignedTo}
                  onValueChange={setAssignedTo}
                  allowedRoles={STAFF_ROLES}
                  placeholder={t("assigned_to_placeholder")}
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
