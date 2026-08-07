"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layers, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/components/providers/app-providers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCombobox } from "@/features/product_information_management/products/components/product-combobox";
import { SkuCombobox } from "@/features/product_information_management/variants/components/sku-combobox";

const BUNDLE_TYPE = {
  fixed_price: "fixed_price",
  percent_off: "percent_off",
  buy_x_get_y: "buy_x_get_y",
  cross_sell: "cross_sell",
} as const;

const item_schema = z.object({
  product_id: z.string().optional().nullable(),
  sku_id: z.string().optional().nullable(),
  quantity: z.number().int().min(1),
  is_required: z.boolean(),
});

const form_schema = z.object({
  name: z.string().min(1, "Le nom est requis").max(255),
  bundle_type: z.enum([
    BUNDLE_TYPE.fixed_price,
    BUNDLE_TYPE.percent_off,
    BUNDLE_TYPE.buy_x_get_y,
    BUNDLE_TYPE.cross_sell,
  ]),
  bundle_price: z.number().min(0).optional().or(z.literal("")),
  discount_percent: z.number().min(0).max(100).optional().or(z.literal("")),
  buy_quantity: z.number().int().min(1).optional().or(z.literal("")),
  get_quantity: z.number().int().min(1).optional().or(z.literal("")),
  items: z
    .array(item_schema)
    .min(1, "Ajoutez au moins un article")
    .refine((items) => items.some((i) => i.product_id || i.sku_id), {
      message: "Chaque article doit référencer un produit ou un SKU",
    }),
});

type FormValues = z.infer<typeof form_schema>;

type CreateBundleDialogProps = {
  promotion_id: string;
};

export function CreateBundleDialog({ promotion_id }: CreateBundleDialogProps) {
  const t = useTranslations("promotion_detail");
  const [open, set_open] = useState(false);
  const utils = trpc.useUtils();

  const create_mutation = trpc.promotions.createBundle.useMutation({
    onSuccess: () => {
      toast.success(t("bundle_created"));
      utils.promotions.bundles.invalidate();
      utils.promotions.detailStats.invalidate();
      set_open(false);
      form.reset();
    },
    onError: (err) => toast.error(err.message || t("bundle_create_error")),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(form_schema),
    defaultValues: {
      name: "",
      bundle_type: BUNDLE_TYPE.fixed_price,
      bundle_price: "",
      discount_percent: "",
      buy_quantity: "",
      get_quantity: "",
      items: [{ product_id: "", sku_id: "", quantity: 1, is_required: true }],
    },
  });

  const { control, handleSubmit, formState } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watch_bundle_type = form.watch("bundle_type");
  const is_pending = create_mutation.isPending;

  const on_submit = async (values: FormValues) => {
    await create_mutation.mutateAsync({
      promotion_id,
      name: values.name,
      bundle_type: values.bundle_type,
      bundle_price: values.bundle_price ? Number(values.bundle_price) : undefined,
      discount_percent: values.discount_percent ? Number(values.discount_percent) : undefined,
      buy_quantity: values.buy_quantity ? Number(values.buy_quantity) : undefined,
      get_quantity: values.get_quantity ? Number(values.get_quantity) : undefined,
      items: values.items.map((item) => ({
        product_id: item.product_id || undefined,
        sku_id: item.sku_id || undefined,
        quantity: item.quantity,
        is_required: item.is_required,
      })),
    });
  };

  return (
    <Dialog open={open} onOpenChange={set_open}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          {t("bundle_create_button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            {t("bundle_create_title")}
          </DialogTitle>
          <DialogDescription>{t("bundle_create_description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(on_submit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!formState.errors.name}>
                  <FieldLabel>{t("bundle_name_label")}</FieldLabel>
                  <Input {...field} placeholder={t("bundle_name_placeholder")} />
                  {formState.errors.name && <FieldError errors={[formState.errors.name]} />}
                </Field>
              )}
            />
            <Controller
              name="bundle_type"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("bundle_type_label")}</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={BUNDLE_TYPE.fixed_price}>
                        {t("bundle_type_fixed_price")}
                      </SelectItem>
                      <SelectItem value={BUNDLE_TYPE.percent_off}>
                        {t("bundle_type_percent_off")}
                      </SelectItem>
                      <SelectItem value={BUNDLE_TYPE.buy_x_get_y}>
                        {t("bundle_type_buy_x_get_y")}
                      </SelectItem>
                      <SelectItem value={BUNDLE_TYPE.cross_sell}>
                        {t("bundle_type_cross_sell")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>

          {watch_bundle_type === BUNDLE_TYPE.fixed_price && (
            <Controller
              name="bundle_price"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!formState.errors.bundle_price}>
                  <FieldLabel>{t("bundle_price_label")}</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                  {formState.errors.bundle_price && (
                    <FieldError errors={[formState.errors.bundle_price]} />
                  )}
                </Field>
              )}
            />
          )}

          {watch_bundle_type === BUNDLE_TYPE.percent_off && (
            <Controller
              name="discount_percent"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!formState.errors.discount_percent}>
                  <FieldLabel>{t("bundle_discount_percent_label")}</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                  {formState.errors.discount_percent && (
                    <FieldError errors={[formState.errors.discount_percent]} />
                  )}
                </Field>
              )}
            />
          )}

          {watch_bundle_type === BUNDLE_TYPE.buy_x_get_y && (
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="buy_quantity"
                control={control}
                render={({ field }) => (
                  <Field data-invalid={!!formState.errors.buy_quantity}>
                    <FieldLabel>{t("bundle_buy_quantity_label")}</FieldLabel>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                    {formState.errors.buy_quantity && (
                      <FieldError errors={[formState.errors.buy_quantity]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="get_quantity"
                control={control}
                render={({ field }) => (
                  <Field data-invalid={!!formState.errors.get_quantity}>
                    <FieldLabel>{t("bundle_get_quantity_label")}</FieldLabel>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                    {formState.errors.get_quantity && (
                      <FieldError errors={[formState.errors.get_quantity]} />
                    )}
                  </Field>
                )}
              />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{t("bundle_items_title")}</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ product_id: "", sku_id: "", quantity: 1, is_required: true })}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                {t("bundle_item_add")}
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="bg-muted/50 space-y-3 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-medium">
                    {t("bundle_item_number", { number: String(index + 1) })}
                  </span>
                  <div className="flex items-center gap-2">
                    <Controller
                      name={`items.${index}.is_required`}
                      control={control}
                      render={({ field: req_field }) => (
                        <label className="flex items-center gap-2 text-xs">
                          <Switch
                            checked={req_field.value}
                            onCheckedChange={req_field.onChange}
                            className="h-4 w-8"
                          />
                          {t("bundle_item_required_label")}
                        </label>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={fields.length <= 1}
                      onClick={() => remove(index)}
                      aria-label={t("bundle_item_remove")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <Controller
                    name={`items.${index}.product_id`}
                    control={control}
                    render={({ field: product_field }) => (
                      <Field>
                        <FieldLabel>{t("bundle_item_product_label")}</FieldLabel>
                        <ProductCombobox
                          value={product_field.value ?? null}
                          onValueChange={(value) => {
                            product_field.onChange(value);
                            if (!value) {
                              form.setValue(`items.${index}.sku_id`, "", { shouldValidate: true });
                            }
                          }}
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name={`items.${index}.sku_id`}
                    control={control}
                    render={({ field: sku_field }) => (
                      <Field>
                        <FieldLabel>{t("bundle_item_sku_label")}</FieldLabel>
                        <SkuCombobox
                          product_id={form.watch(`items.${index}.product_id`) ?? ""}
                          value={sku_field.value ?? null}
                          onValueChange={sku_field.onChange}
                        />
                      </Field>
                    )}
                  />
                </div>

                <Controller
                  name={`items.${index}.quantity`}
                  control={control}
                  render={({ field: qty_field }) => (
                    <Field data-invalid={!!formState.errors.items?.[index]?.quantity}>
                      <FieldLabel>{t("bundle_item_quantity_label")}</FieldLabel>
                      <Input
                        type="number"
                        min={1}
                        {...qty_field}
                        onChange={(e) => qty_field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                      />
                      {formState.errors.items?.[index]?.quantity && (
                        <FieldError errors={[formState.errors.items[index].quantity]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            ))}

            {formState.errors.items && (
              <p className="text-sm text-red-600">{formState.errors.items.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => set_open(false)}
              disabled={is_pending}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={is_pending}>
              {is_pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
