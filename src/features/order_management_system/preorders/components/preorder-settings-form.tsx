"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { trpc } from "@/components/providers/app-providers";

export type PreorderSettingsDefaults = {
  is_preorder_enabled: boolean;
  allow_backorder: boolean;
  max_preorder_qty: number | null;
  estimated_available_at: string | null;
  deposit_percent: number;
  lead_time_days: number;
  is_active: boolean;
} | null;

const settings_form_schema = z.object({
  is_preorder_enabled: z.boolean(),
  allow_backorder: z.boolean(),
  max_preorder_qty: z.string().optional(),
  estimated_available_at: z.string().optional(),
  deposit_percent: z.string().regex(/^\d{1,3}$/),
  lead_time_days: z.string().regex(/^\d{1,3}$/),
  is_active: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settings_form_schema>;

function to_datetime_local(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function PreorderSettingsForm({
  sku_id,
  defaults,
  onSaved,
  submitLabel,
  showSkuField = false,
}: {
  sku_id: string;
  defaults?: PreorderSettingsDefaults;
  onSaved?: () => void;
  submitLabel?: string;
  showSkuField?: boolean;
}) {
  const t = useTranslations("preorders");
  const utils = trpc.useUtils();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settings_form_schema),
    defaultValues: {
      is_preorder_enabled: defaults?.is_preorder_enabled ?? false,
      allow_backorder: defaults?.allow_backorder ?? false,
      max_preorder_qty: defaults?.max_preorder_qty != null ? String(defaults.max_preorder_qty) : "",
      estimated_available_at: to_datetime_local(defaults?.estimated_available_at),
      deposit_percent: String(defaults?.deposit_percent ?? 100),
      lead_time_days: String(defaults?.lead_time_days ?? 14),
      is_active: defaults?.is_active ?? true,
    },
  });

  const upsert_settings = trpc.preorders.upsertSettings.useMutation({
    onSuccess: async () => {
      toast.success(t("settings_saved"));
      await utils.preorders.getSettings.invalidate({ sku_id });
      await utils.preorders.getSettingsByProduct.invalidate();
      await utils.preorders.adminListSettings.invalidate();
      await utils.preorders.adminListAllocations.invalidate();
      await utils.preorders.preorderStats.invalidate();
      onSaved?.();
    },
    onError: (err) => toast.error(err.message),
  });

  const is_preorder_enabled = useWatch({ control: form.control, name: "is_preorder_enabled" });
  const allow_backorder = useWatch({ control: form.control, name: "allow_backorder" });
  const is_active = useWatch({ control: form.control, name: "is_active" });

  async function onSubmit(values: SettingsFormValues) {
    await upsert_settings.mutateAsync({
      sku_id,
      is_preorder_enabled: values.is_preorder_enabled,
      allow_backorder: values.allow_backorder,
      max_preorder_qty: values.max_preorder_qty ? Number(values.max_preorder_qty) : null,
      estimated_available_at: values.estimated_available_at
        ? format(new Date(values.estimated_available_at), "yyyy-MM-dd HH:mm:ss")
        : null,
      deposit_percent: Number(values.deposit_percent),
      lead_time_days: Number(values.lead_time_days),
      is_active: values.is_active,
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {showSkuField && (
        <Field>
          <FieldLabel>{t("sku_id")}</FieldLabel>
          <FieldContent>
            <Input value={sku_id} disabled />
          </FieldContent>
        </Field>
      )}

      <div className="w-full space-y-4">
        <Field orientation="horizontal">
          <div className="w-full">
          <FieldLabel htmlFor="preorder-enabled">{t("preorder_enabled")}</FieldLabel>
          </div>
          <FieldContent>
            <Switch
              id="preorder-enabled"
              checked={is_preorder_enabled}
              onCheckedChange={(v) => form.setValue("is_preorder_enabled", v)}
            />
          </FieldContent>
        </Field>

        <Field orientation="horizontal">
          <div>
            <FieldLabel htmlFor="preorder-backorder">{t("allow_backorder")}</FieldLabel>
            <FieldDescription>{t("allow_backorder_desc")}</FieldDescription>
          </div>
          <FieldContent>
            <Switch
              id="preorder-backorder"
              checked={allow_backorder}
              onCheckedChange={(v) => form.setValue("allow_backorder", v)}
            />
          </FieldContent>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field>
          <FieldLabel htmlFor="preorder-max-qty">{t("max_qty")}</FieldLabel>
          <FieldContent>
            <Input
              id="preorder-max-qty"
              type="number"
              min={1}
              placeholder={t("max_qty_unlimited")}
              {...form.register("max_preorder_qty")}
            />
            <FieldDescription>{t("max_qty_desc")}</FieldDescription>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="preorder-deposit">{t("deposit_percent")}</FieldLabel>
          <FieldContent>
            <Input
              id="preorder-deposit"
              type="number"
              min={0}
              max={100}
              {...form.register("deposit_percent")}
            />
            <FieldError errors={[form.formState.errors.deposit_percent]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="preorder-lead-time">{t("lead_time_days")}</FieldLabel>
          <FieldContent>
            <Input
              id="preorder-lead-time"
              type="number"
              min={1}
              max={365}
              {...form.register("lead_time_days")}
            />
            <FieldError errors={[form.formState.errors.lead_time_days]} />
          </FieldContent>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="preorder-eta">{t("estimated_available_at")}</FieldLabel>
        <FieldContent>
          <Input
            id="preorder-eta"
            type="datetime-local"
            {...form.register("estimated_available_at")}
          />
          <FieldDescription>{t("estimated_available_at_desc")}</FieldDescription>
        </FieldContent>
      </Field>

      <Field orientation="horizontal">
        <div className="w-full">
          <FieldLabel htmlFor="preorder-active">{t("is_active")}</FieldLabel>
        </div>
        <FieldContent>
          <Switch
            id="preorder-active"
            checked={is_active}
            onCheckedChange={(v) => form.setValue("is_active", v)}
          />
        </FieldContent>
      </Field>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={upsert_settings.isPending}>
          {upsert_settings.isPending ? t("updating") : (submitLabel ?? t("save_settings"))}
        </Button>
        {upsert_settings.error && (
          <span className="text-destructive text-sm">{upsert_settings.error.message}</span>
        )}
      </div>
    </form>
  );
}
