"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/components/providers/app-providers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { PROMOTION_STATUS } from "../constants/promotion-types";

const edit_form_schema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().max(5000).optional().nullable(),
  status: z.enum([
    PROMOTION_STATUS.draft,
    PROMOTION_STATUS.scheduled,
    PROMOTION_STATUS.active,
    PROMOTION_STATUS.paused,
    PROMOTION_STATUS.expired,
  ]),
  priority: z.coerce.number().int().min(0).max(9999),
  is_stackable: z.boolean(),
  starts_at: z.string().optional().or(z.literal("")),
  ends_at: z.string().optional().or(z.literal("")),
});

type EditFormValues = z.infer<typeof edit_form_schema>;

interface PromotionEditEntry {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  priority: number;
  is_stackable: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

interface PromotionEditDialogProps {
  open: boolean;
  on_open_change: (open: boolean) => void;
  promotion: PromotionEditEntry | null;
}

export function PromotionEditDialog({ open, on_open_change, promotion }: PromotionEditDialogProps) {
  const t = useTranslations("promotion_detail");
  const tp = useTranslations("promotions");
  const utils = trpc.useUtils();
  const [is_stackable, setIsStackable] = React.useState(false);

  const update_mutation = trpc.promotions.update.useMutation({
    onSuccess: () => {
      utils.promotions.byId.invalidate();
      utils.promotions.detailStats.invalidate();
      utils.promotions.adminList.invalidate();
      toast.success(t("edit_success"));
      on_open_change(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const form = useForm<EditFormValues>({
    resolver: zodResolver(edit_form_schema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      status: PROMOTION_STATUS.draft,
      priority: 100,
      is_stackable: false,
      starts_at: "",
      ends_at: "",
    },
  });

  useEffect(() => {
    if (!promotion) return;
    const raf = requestAnimationFrame(() => {
      setIsStackable(promotion.is_stackable);
      form.reset({
        name: promotion.name,
        slug: promotion.slug,
        description: promotion.description ?? "",
        status: promotion.status as EditFormValues["status"],
        priority: promotion.priority,
        is_stackable: promotion.is_stackable,
        starts_at: promotion.starts_at
          ? new Date(promotion.starts_at).toISOString().slice(0, 16)
          : "",
        ends_at: promotion.ends_at
          ? new Date(promotion.ends_at).toISOString().slice(0, 16)
          : "",
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [promotion, form]);

  const onSubmit = form.handleSubmit((data) => {
    if (!promotion) return;
    update_mutation.mutate({
      id: promotion.id,
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      status: data.status,
      priority: data.priority,
      is_stackable,
      starts_at: data.starts_at ? new Date(data.starts_at).toISOString() : null,
      ends_at: data.ends_at ? new Date(data.ends_at).toISOString() : null,
    });
  });

  return (
    <Dialog open={open} onOpenChange={on_open_change}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("edit_title")}</DialogTitle>
          <DialogDescription>{t("edit_description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>{tp("name")}</FieldLabel>
                <Input {...form.register("name")} />
              </Field>
              <Field>
                <FieldLabel>{tp("slug")}</FieldLabel>
                <Input {...form.register("slug")} />
              </Field>
            </div>
            <Field>
              <FieldLabel>{tp("description")}</FieldLabel>
              <Textarea
                {...form.register("description")}
                value={form.watch("description") ?? ""}
                rows={3}
              />
            </Field>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>{tp("status")}</FieldLabel>
                <select
                  className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none"
                  {...form.register("status")}
                >
                  <option value={PROMOTION_STATUS.draft}>{tp("status_draft")}</option>
                  <option value={PROMOTION_STATUS.scheduled}>{tp("status_scheduled")}</option>
                  <option value={PROMOTION_STATUS.active}>{tp("status_active")}</option>
                  <option value={PROMOTION_STATUS.paused}>{tp("status_paused")}</option>
                  <option value={PROMOTION_STATUS.expired}>{tp("status_expired")}</option>
                </select>
              </Field>
              <Field>
                <FieldLabel>{tp("priority")}</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  max={9999}
                  {...form.register("priority", { valueAsNumber: true })}
                />
              </Field>
            </div>
            <Field orientation="horizontal">
              <Switch checked={is_stackable} onCheckedChange={setIsStackable} />
              <FieldLabel>{tp("stackable_label")}</FieldLabel>
            </Field>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>{tp("start_date")}</FieldLabel>
                <Input type="datetime-local" {...form.register("starts_at")} />
              </Field>
              <Field>
                <FieldLabel>{tp("end_date")}</FieldLabel>
                <Input type="datetime-local" {...form.register("ends_at")} />
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => on_open_change(false)}>
              {tp("cancel")}
            </Button>
            <Button type="submit" disabled={update_mutation.isPending}>
              {update_mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tp("edit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
