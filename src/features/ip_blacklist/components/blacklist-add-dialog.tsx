"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import {
  add_to_blacklist_schema,
  type AddToBlacklistInput,
} from "@/features/ip_blacklist/validators/blacklist.validator";

interface BlacklistAddDialogProps {
  open: boolean;
  on_open_change: (open: boolean) => void;
  on_added: () => void;
}

export function BlacklistAddDialog({ open, on_open_change, on_added }: BlacklistAddDialogProps) {
  const t = useTranslations("blacklist");
  const [error, set_error] = useState<string | null>(null);
  const add_mutation = trpc.blacklist.add.useMutation({
    onSuccess: () => {
      form.reset();
      set_error(null);
      on_added();
    },
    onError: (err) => set_error(err.message),
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
    set_error(null);
    add_mutation.mutate(data);
  });

  return (
    <QueryGuard mutation={add_mutation}>
    <Dialog open={open} onOpenChange={on_open_change}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("block_ip")}</DialogTitle>
          <DialogDescription>
            {t("add_ip_description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ip_address">{t("ip_address_label")}</Label>
            <Input id="ip_address" placeholder={t("ip_placeholder")} {...form.register("ip_address")} />
            {form.formState.errors.ip_address && (
              <p className="text-destructive text-sm">{form.formState.errors.ip_address.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason_fr">{t("reason_fr_label")}</Label>
            <Textarea
              id="reason_fr"
              placeholder="Tentatives de connexion suspectes"
              {...form.register("reason_fr")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">{t("reason_en_label")}</Label>
            <Textarea
              id="reason"
              placeholder="Suspicious login attempts"
              {...form.register("reason")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason_ar">{t("reason_ar_label")}</Label>
            <Textarea
              id="reason_ar"
              placeholder="محاولات تسجيل دخول مشبوهة"
              {...form.register("reason_ar")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expires_at">{t("expiration_label")}</Label>
            <Input id="expires_at" type="datetime-local" {...form.register("expires_at")} />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <DialogFooter>
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
    </QueryGuard>
  );
}
