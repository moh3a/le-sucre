"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  PROMOTION_TYPE,
  PROMOTION_STATUS,
  DISCOUNT_SCOPE,
  DISCOUNT_TYPE,
} from "../constants/promotion-types";
import { slugify } from "@/lib/utils";

const form_schema = z.object({
  name: z.string().min(1, "Le nom est requis").max(255),
  slug: z.string().min(1, "Le slug est requis").max(255),
  description: z.string().max(5000).optional(),
  promotion_type: z.enum([
    PROMOTION_TYPE.promo_code,
    PROMOTION_TYPE.automatic,
    PROMOTION_TYPE.flash_sale,
    PROMOTION_TYPE.bundle,
    PROMOTION_TYPE.customer,
  ]),
  status: z.enum([
    PROMOTION_STATUS.draft,
    PROMOTION_STATUS.scheduled,
    PROMOTION_STATUS.active,
    PROMOTION_STATUS.paused,
  ]),
  priority: z.coerce.number().int().min(0).max(9999).default(100),
  is_stackable: z.boolean().default(false),
  starts_at: z.string().optional().or(z.literal("")),
  ends_at: z.string().optional().or(z.literal("")),
  rule_scope_type: z
    .enum([
      DISCOUNT_SCOPE.cart,
      DISCOUNT_SCOPE.category,
      DISCOUNT_SCOPE.product,
      DISCOUNT_SCOPE.sku,
      DISCOUNT_SCOPE.customer,
      DISCOUNT_SCOPE.shipping,
    ])
    .default(DISCOUNT_SCOPE.cart),
  rule_discount_type: z
    .enum([
      DISCOUNT_TYPE.percent,
      DISCOUNT_TYPE.fixed,
      DISCOUNT_TYPE.free_shipping,
      DISCOUNT_TYPE.buy_x_get_y,
    ])
    .default(DISCOUNT_TYPE.percent),
  rule_discount_value: z.coerce.number().min(0).default(10),
  rule_min_subtotal: z.coerce.number().min(0).optional().or(z.literal("")),
  rule_max_discount_amount: z.coerce.number().min(0).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof form_schema>;

export function CreatePromotionDialog() {
  const t = useTranslations("promotions");
  const [open, set_open] = useState(false);
  const utils = trpc.useUtils();

  const create_mutation = trpc.promotions.create.useMutation({
    onSuccess: () => {
      toast.success(t("promotion_created"));
      utils.promotions.adminList.invalidate();
      set_open(false);
      form.reset();
    },
    onError: (err) => {
      toast.error(err.message || t("creation_error"));
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(form_schema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      promotion_type: PROMOTION_TYPE.promo_code,
      status: PROMOTION_STATUS.draft,
      priority: 100,
      is_stackable: false,
      starts_at: "",
      ends_at: "",
      rule_scope_type: DISCOUNT_SCOPE.cart,
      rule_discount_type: DISCOUNT_TYPE.percent,
      rule_discount_value: 10,
      rule_min_subtotal: "",
      rule_max_discount_amount: "",
    },
  });

  const { watch, setValue, control, formState } = form;
  const watch_name = watch("name");
  const watch_slug = watch("slug");
  const is_pending = create_mutation.isPending;

  useEffect(() => {
    if (watch_name && (!watch_slug || watch_slug === slugify(watch_name.slice(0, -1)))) {
      setValue("slug", slugify(watch_name), { shouldValidate: true });
    }
  }, [watch_name, watch_slug, setValue]);

  const on_submit = async (values: FormValues) => {
    const starts_at = values.starts_at ? new Date(values.starts_at).toISOString() : undefined;
    const ends_at = values.ends_at ? new Date(values.ends_at).toISOString() : undefined;

    await create_mutation.mutateAsync({
      name: values.name,
      slug: values.slug,
      description: values.description || undefined,
      promotion_type: values.promotion_type,
      status: values.status,
      priority: values.priority,
      is_stackable: values.is_stackable,
      starts_at,
      ends_at,
      rules: [
        {
          scope_type: values.rule_scope_type,
          discount_type: values.rule_discount_type,
          discount_value: values.rule_discount_value,
          min_subtotal: values.rule_min_subtotal ? Number(values.rule_min_subtotal) : undefined,
          max_discount_amount: values.rule_max_discount_amount
            ? Number(values.rule_max_discount_amount)
            : undefined,
          sort_order: 0,
        },
      ],
    });
  };

  return (
    <QueryGuard mutation={create_mutation}>
    <Dialog open={open} onOpenChange={set_open}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t("create_promotion")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("new_promotion")}</DialogTitle>
          <DialogDescription>
            {t("promotion_description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(on_submit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!formState.errors.name}>
                  <FieldLabel>{t("name")}</FieldLabel>
                  <Input {...field} placeholder={t("name_placeholder")} />
                  {formState.errors.name && <FieldError errors={[formState.errors.name]} />}
                </Field>
              )}
            />

            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!formState.errors.slug}>
                  <FieldLabel>{t("slug")}</FieldLabel>
                  <Input {...field} placeholder={t("slug_placeholder")} />
                  {formState.errors.slug && <FieldError errors={[formState.errors.slug]} />}
                </Field>
              )}
            />
          </div>

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("description")}</FieldLabel>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  placeholder={t("description_placeholder")}
                  rows={3}
                />
              </Field>
            )}
          />

          <div className="grid gap-4 md:grid-cols-3">
            <Controller
              name="promotion_type"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("promotion_type_label")}</FieldLabel>
                  <select className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none" {...field}>
                    <option value={PROMOTION_TYPE.promo_code}>{t("type_promo_code")}</option>
                    <option value={PROMOTION_TYPE.automatic}>{t("type_automatic")}</option>
                    <option value={PROMOTION_TYPE.flash_sale}>{t("type_flash_sale")}</option>
                    <option value={PROMOTION_TYPE.bundle}>{t("type_bundle")}</option>
                    <option value={PROMOTION_TYPE.customer}>{t("type_customer")}</option>
                  </select>
                </Field>
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("status")}</FieldLabel>
                  <select className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none" {...field}>
                    <option value={PROMOTION_STATUS.draft}>{t("status_draft")}</option>
                    <option value={PROMOTION_STATUS.scheduled}>{t("status_scheduled")}</option>
                    <option value={PROMOTION_STATUS.active}>{t("status_active")}</option>
                    <option value={PROMOTION_STATUS.paused}>{t("status_paused")}</option>
                  </select>
                </Field>
              )}
            />

            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!formState.errors.priority}>
                  <FieldLabel>{t("priority")}</FieldLabel>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                  />
                  {formState.errors.priority && <FieldError errors={[formState.errors.priority]} />}
                </Field>
              )}
            />
          </div>

          <Controller
            name="is_stackable"
            control={control}
            render={({ field }) => (
              <Field orientation="horizontal">
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <FieldLabel>{t("stackable_label")}</FieldLabel>
              </Field>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              name="starts_at"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("start_date")}</FieldLabel>
                  <Input type="datetime-local" {...field} />
                </Field>
              )}
            />

            <Controller
              name="ends_at"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("end_date")}</FieldLabel>
                  <Input type="datetime-local" {...field} />
                </Field>
              )}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="mb-3 text-sm font-semibold">{t("discount_rule_title")}</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="rule_scope_type"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("scope_label")}</FieldLabel>
                    <select className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none" {...field}>
                      <option value={DISCOUNT_SCOPE.cart}>{t("scope_cart")}</option>
                      <option value={DISCOUNT_SCOPE.category}>{t("scope_category")}</option>
                      <option value={DISCOUNT_SCOPE.product}>{t("scope_product")}</option>
                      <option value={DISCOUNT_SCOPE.sku}>{t("scope_sku")}</option>
                      <option value={DISCOUNT_SCOPE.customer}>{t("scope_customer")}</option>
                      <option value={DISCOUNT_SCOPE.shipping}>{t("scope_shipping")}</option>
                    </select>
                  </Field>
                )}
              />

              <Controller
                name="rule_discount_type"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("discount_type_label")}</FieldLabel>
                    <select className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none" {...field}>
                      <option value={DISCOUNT_TYPE.percent}>{t("discount_percent")}</option>
                      <option value={DISCOUNT_TYPE.fixed}>{t("discount_fixed")}</option>
                      <option value={DISCOUNT_TYPE.free_shipping}>{t("discount_free_shipping")}</option>
                      <option value={DISCOUNT_TYPE.buy_x_get_y}>{t("discount_buy_x_get_y")}</option>
                    </select>
                  </Field>
                )}
              />

              <Controller
                name="rule_discount_value"
                control={control}
                render={({ field }) => (
                  <Field data-invalid={!!formState.errors.rule_discount_value}>
                    <FieldLabel>{t("discount_value_label")}</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                    {formState.errors.rule_discount_value && (
                      <FieldError errors={[formState.errors.rule_discount_value]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="rule_min_subtotal"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("min_cart_label")}</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder={t("optional_placeholder")}
                    />
                  </Field>
                )}
              />

              <Controller
                name="rule_max_discount_amount"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("max_discount_label")}</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder={t("optional_placeholder")}
                    />
                  </Field>
                )}
              />

            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => { set_open(false); form.reset(); }}
              disabled={is_pending}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={is_pending}
            >
              {is_pending ? t("creating") : t("create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
