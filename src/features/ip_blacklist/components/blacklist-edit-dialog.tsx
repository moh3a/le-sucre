"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { trpc } from "@/components/providers/app-providers";
import {
  update_blacklist_schema,
  type UpdateBlacklistInput,
} from "@/features/ip_blacklist/validators/blacklist.validator";

interface BlacklistEditEntry {
  id: string;
  ip_address: string;
  reason: string | null;
  reason_fr: string | null;
  reason_ar: string | null;
  is_active: boolean;
  expires_at: Date | string | null;
}

interface BlacklistEditDialogProps {
  open: boolean;
  on_open_change: (open: boolean) => void;
  entry: BlacklistEditEntry | null;
}

export function BlacklistEditDialog({ open, on_open_change, entry }: BlacklistEditDialogProps) {
  const t = useTranslations("blacklist");
  const utils = trpc.useUtils();
  const [is_active, setIsActive] = React.useState(true);

  const update_mutation = trpc.blacklist.update.useMutation({
    onSuccess: () => {
      utils.blacklist.list.invalidate();
      utils.blacklist.stats.invalidate();
      toast.success(t("entry_updated"));
      on_open_change(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const form = useForm<UpdateBlacklistInput>({
    resolver: zodResolver(update_blacklist_schema),
    defaultValues: {
      reason: "",
      reason_fr: "",
      reason_ar: "",
      is_active: true,
      expires_at: null,
    },
  });

  React.useEffect(() => {
    if (!entry) return;
    const raf = requestAnimationFrame(() => {
      setIsActive(entry.is_active);
      form.reset({
        reason: entry.reason ?? "",
        reason_fr: entry.reason_fr ?? "",
        reason_ar: entry.reason_ar ?? "",
        is_active: entry.is_active,
        expires_at: entry.expires_at
          ? new Date(entry.expires_at).toISOString().slice(0, 16)
          : null,
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [entry, form]);

  const onSubmit = form.handleSubmit((data) => {
    if (!entry) return;
    update_mutation.mutate({ id: entry.id, data: { ...data, is_active } });
  });

  return (
    <Dialog open={open} onOpenChange={on_open_change}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("edit_entry")}</DialogTitle>
          <DialogDescription>
            {t("edit_entry_description", { ip: entry?.ip_address ?? "" })}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field orientation="responsive">
              <FieldLabel>{t("status")}</FieldLabel>
              <div className="flex items-center gap-2">
                <Switch
                  checked={is_active}
                  onCheckedChange={setIsActive}
                />
                <span className="text-muted-foreground text-sm">
                  {is_active ? t("active") : t("inactive")}
                </span>
              </div>
            </Field>
            <Separator />
            <Field>
              <FieldLabel htmlFor="edit_reason_fr">{t("reason_fr_label")}</FieldLabel>
              <Textarea
                id="edit_reason_fr"
                placeholder="Tentatives de connexion suspectes"
                {...form.register("reason_fr")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit_reason">{t("reason_en_label")}</FieldLabel>
              <Textarea
                id="edit_reason"
                placeholder="Suspicious login attempts"
                {...form.register("reason")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit_reason_ar">{t("reason_ar_label")}</FieldLabel>
              <Textarea
                id="edit_reason_ar"
                placeholder="محاولات تسجيل دخول مشبوهة"
                {...form.register("reason_ar")}
              />
            </Field>
            <Separator />
            <Field>
              <FieldLabel htmlFor="edit_expires_at">{t("expiration_label")}</FieldLabel>
              <Input id="edit_expires_at" type="datetime-local" {...form.register("expires_at")} />
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => on_open_change(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={update_mutation.isPending}>
              {update_mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
