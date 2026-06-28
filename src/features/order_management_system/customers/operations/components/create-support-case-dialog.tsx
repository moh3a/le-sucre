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
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { QueryGuard } from "@/components/query-guard";

export function CreateSupportCaseDialog() {
  const t = useTranslations("support");
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("normal");
  const [assignedTo, setAssignedTo] = useState("");

  const utils = trpc.useUtils();
  const mutation = trpc.operations.customerCreateCase.useMutation({
    onSuccess: () => {
      toast.success(t("case_created"));
      setOpen(false);
      reset();
      utils.operations.customerListCases.invalidate();
    },
    onError: (err) => toast.error(`${t("error")}: ${err.message}`),
  });

  function reset() {
    setUserId("");
    setOrderId("");
    setSubject("");
    setDescription("");
    setCategory("general");
    setPriority("normal");
    setAssignedTo("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject || !description) {
      toast.error(t("fill_required_fields"));
      return;
    }
    mutation.mutate({
      user_id: userId || null,
      order_id: orderId || null,
      subject,
      description,
      category,
      priority: priority as "low" | "normal" | "high" | "urgent",
      assigned_to_user_id: assignedTo || undefined,
    });
  }

  return (
    <QueryGuard mutation={mutation}>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          {t("new_case")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{t("create_case_title")}</DialogTitle>
          <DialogDescription>
            {t("create_case_description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sc_subject">{t("subject")} *</Label>
            <Input
              id="sc_subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("object_placeholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sc_description">{t("description")} *</Label>
            <Textarea
              id="sc_description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("description_placeholder")}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sc_category">{t("category")}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">{t("general")}</SelectItem>
                  <SelectItem value="shipping">{t("shipping")}</SelectItem>
                  <SelectItem value="payment">{t("payment")}</SelectItem>
                  <SelectItem value="product">{t("product")}</SelectItem>
                  <SelectItem value="return">{t("return")}</SelectItem>
                  <SelectItem value="complaint">{t("complaint")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sc_priority">{t("priority")}</Label>
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
            <div className="space-y-2">
              <Label htmlFor="sc_assigned_to">{t("assigned_to")}</Label>
              <Input
                id="sc_assigned_to"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder={t("user_id_placeholder")}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sc_user_id">{t("client")}</Label>
              <Input
                id="sc_user_id"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={t("client_id_placeholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sc_order_id">{t("order")}</Label>
              <Input
                id="sc_order_id"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder={t("order_id_placeholder")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t("creating") : t("create_case")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
