"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Ticket } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

const form_schema = z.object({
  code: z
    .string()
    .min(2, "Le code doit contenir au moins 2 caractères")
    .max(64, "Le code est trop long"),
  usage_limit: z.number().int().min(1).optional().or(z.literal("")),
  per_customer_limit: z.number().int().min(1),
});

type FormValues = z.infer<typeof form_schema>;

type PromoCodeFormProps = {
  promotion_id: string;
};

export function PromoCodeForm({ promotion_id }: PromoCodeFormProps) {
  const t = useTranslations("promotions");
  const utils = trpc.useUtils();
  const [error, set_error] = useState<string | null>(null);

  const create_mutation = trpc.promotions.createPromoCode.useMutation({
    onSuccess: () => {
      toast.success(t("promo_code_created"));
      utils.promotions.promoCodes.invalidate();
      utils.promotions.detailStats.invalidate();
      form.reset();
      set_error(null);
    },
    onError: (err) => {
      const message = err.data?.code === "CONFLICT" ? t("promo_code_exists") : t("promo_code_create_failed");
      set_error(err.message || message);
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(form_schema),
    defaultValues: {
      code: "",
      usage_limit: "",
      per_customer_limit: 1,
    },
  });

  const { control, handleSubmit, formState } = form;
  const is_pending = create_mutation.isPending;

  const on_submit = async (values: FormValues) => {
    set_error(null);
    await create_mutation.mutateAsync({
      promotion_id,
      code: values.code,
      usage_limit: values.usage_limit ? Number(values.usage_limit) : null,
      per_customer_limit: values.per_customer_limit ? Number(values.per_customer_limit) : 1,    });
  };

  return (
    <form onSubmit={handleSubmit(on_submit)} className="space-y-4 rounded-lg border p-4">
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <Ticket className="size-4" />
        {t("promo_code_title")}
      </h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <Field data-invalid={!!formState.errors.code}>
              <FieldLabel>{t("promo_code_label")}</FieldLabel>
              <Input
                {...field}
                placeholder="SUMMER10"
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
              />
              {formState.errors.code && <FieldError errors={[formState.errors.code]} />}
            </Field>
          )}
        />
        <Controller
          name="usage_limit"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>{t("promo_global_limit_label")}</FieldLabel>
              <Input
                type="number"
                min={1}
                {...field}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </Field>
          )}
        />
        <Controller
          name="per_customer_limit"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>{t("promo_per_customer_label")}</FieldLabel>
              <Input
                type="number"
                min={1}
                {...field}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </Field>
          )}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={is_pending}>
        {is_pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t("promo_create_button")}
      </Button>
    </form>
  );
}
