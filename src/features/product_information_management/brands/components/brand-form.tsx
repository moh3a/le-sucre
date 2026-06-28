"use client";

import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MediaPickerField } from "@/features/media_library/components/media-picker-field";
import type { MediaDTO } from "@/features/media_library/types";
import { create_brand_dto } from "../models/brand.dto";
import { format } from "date-fns";

type BrandFormValues = z.input<typeof create_brand_dto>;

type BrandFormProps = {
  mode: "create" | "edit";
  brand_id?: string;
  default_values?: Partial<BrandFormValues>;
  onSuccess?: () => void;
  onCreated?: (brand_id: string) => void;
};

export function BrandForm({
  mode,
  brand_id,
  default_values,
  onSuccess,
  onCreated,
}: BrandFormProps) {
  const t = useTranslations("brands");
  const utils = trpc.useUtils();

  const create_mutation = trpc.brands.create.useMutation({
    onSuccess: async (brand) => {
      await utils.brands.list.invalidate();
      await utils.brands.active.invalidate();
      await utils.brands.stats.invalidate();
      if (brand?.id) onCreated?.(brand.id);
      onSuccess?.();
    },
  });

  const update_mutation = trpc.brands.update.useMutation({
    onSuccess: async () => {
      await utils.brands.list.invalidate();
      await utils.brands.active.invalidate();
      await utils.brands.stats.invalidate();
      onSuccess?.();
    },
  });

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(create_brand_dto),
    defaultValues: {
      name: "",
      slug: "",
      description: null,
      website_url: null,
      logo_url: null,
      is_active: true,
      ...default_values,
    },
  });

  const pending = create_mutation.isPending || update_mutation.isPending;

  const logo_url_value = form.watch("logo_url");
  const logo_media_item: MediaDTO | null = logo_url_value
    ? {
        id: "",
        url: logo_url_value,
        alt: null,
        filename: "",
        original_name: "",
        mime_type: "image/*",
        kind: "image",
        size: 0,
        width: null,
        height: null,
        storage_key: "",
        provider: "",
        caption: null,
        metadata: {},
        is_public: true,
        uploaded_by: null,
        created_at: format(new Date(), "yyyy-MM-dd HH:mm"),
        updated_at: format(new Date(), "yyyy-MM-dd HH:mm"),
      }
    : null;

  async function on_submit(values: BrandFormValues) {
    if (mode === "create") {
      await create_mutation.mutateAsync(values);
      form.reset();
      return;
    }
    if (!brand_id) return;
    await update_mutation.mutateAsync({ ...values, id: brand_id });
  }

  return (
    <QueryGuard mutation={{ isPending: pending }}>
    <form className="space-y-6" onSubmit={form.handleSubmit(on_submit)}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t("name")}</FieldLabel>
              <Input {...field} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="slug"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t("slug")}</FieldLabel>
              <Input {...field} placeholder={t("auto_slug_placeholder")} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="description"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>{t("description")}</FieldLabel>
              <Input
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value || null)}
              />
            </Field>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="website_url"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("website_url")}</FieldLabel>
                <Input
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                  placeholder={t("website_url_placeholder")}
                />
              </Field>
            )}
          />

          <Controller
            name="is_active"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("active")}</FieldLabel>
                <select
                  className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                  value={field.value ? "true" : "false"}
                  onChange={(e) => field.onChange(e.target.value === "true")}
                >
                  <option value="true">{t("status_active")}</option>
                  <option value="false">{t("status_inactive")}</option>
                </select>
              </Field>
            )}
          />
        </div>

        <Field>
          <FieldLabel>{t("logo_url")}</FieldLabel>
          <MediaPickerField
            value={logo_url_value}
            media_item={logo_media_item}
            onSelect={(media) => form.setValue("logo_url", media.url)}
            onClear={() => form.setValue("logo_url", null)}
            entity_type="brand"
            field="logo"
          />
        </Field>

        <Button type="submit" disabled={pending}>
          {pending ? "…" : t("save")}
        </Button>
      </FieldGroup>
    </form>
    </QueryGuard>
  );
}
