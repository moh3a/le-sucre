"use client";

import { useTranslations } from "next-intl";
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { trpc } from "@/components/providers/app-providers";
import {
  add_to_blacklist_schema,
  type AddToBlacklistInput,
} from "@/features/ip_blacklist/validators/blacklist.validator";

interface BlacklistAddDialogProps {
  open: boolean;
  on_open_change: (open: boolean) => void;
}

export function BlacklistAddDialog({ open, on_open_change }: BlacklistAddDialogProps) {
  const t = useTranslations("blacklist");
  const utils = trpc.useUtils();

  const add_mutation = trpc.blacklist.add.useMutation({
    onSuccess: () => {
      utils.blacklist.list.invalidate();
      utils.blacklist.stats.invalidate();
      toast.success(t("ip_blocked"));
      form.reset();
      on_open_change(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const form = useForm<AddToBlacklistInput>({
    resolver: zodResolver(add_to_blacklist_schema),
    defaultValues: {
      ip_address: "",
      reason: "",
      reason_fr: "",
      reason_ar: "",
      expires_at: null,
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    add_mutation.mutate(data);
  });

  return (
    <Dialog open={open} onOpenChange={on_open_change}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("block_ip")}</DialogTitle>
          <DialogDescription>
            {t("add_ip_description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="ip_address">{t("ip_address_label")} *</FieldLabel>
              <Input
                id="ip_address"
                placeholder={t("ip_placeholder")}
                {...form.register("ip_address")}
              />
              <FieldError errors={form.formState.errors.ip_address ? [form.formState.errors.ip_address] : undefined} />
            </Field>
            <Separator />
            <Field>
              <FieldLabel htmlFor="reason_fr">{t("reason_fr_label")}</FieldLabel>
              <Textarea
                id="reason_fr"
                placeholder="Tentatives de connexion suspectes"
                {...form.register("reason_fr")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="reason">{t("reason_en_label")}</FieldLabel>
              <Textarea
                id="reason"
                placeholder="Suspicious login attempts"
                {...form.register("reason")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="reason_ar">{t("reason_ar_label")}</FieldLabel>
              <Textarea
                id="reason_ar"
                placeholder="محاولات تسجيل دخول مشبوهة"
                {...form.register("reason_ar")}
              />
            </Field>
            <Separator />
            <Field>
              <FieldLabel htmlFor="expires_at">{t("expiration_label")}</FieldLabel>
              <Input id="expires_at" type="datetime-local" {...form.register("expires_at")} />
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => on_open_change(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={add_mutation.isPending}>
              {add_mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("block_button")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
