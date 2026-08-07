"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2, Zap } from "lucide-react";
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
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { ProductCombobox } from "@/features/product_information_management/products/components/product-combobox";
import { SkuCombobox } from "@/features/product_information_management/variants/components/sku-combobox";

const item_schema = z.object({
  product_id: z.string().min(1, "Le produit est requis"),
  sku_id: z.string().min(1, "Le SKU est requis"),
  flash_price: z.number().min(0, "Le prix doit être positif"),
  max_quantity: z.number().int().min(1, "La quantité doit être ≥ 1"),
});

const form_schema = z.object({
  title: z.string().min(1, "Le titre est requis").max(255),
  starts_at: z.string().min(1, "La date de début est requise"),
  ends_at: z.string().min(1, "La date de fin est requise"),
  max_total_units: z.number().int().min(1).optional().or(z.literal("")),
  items: z.array(item_schema).min(1, "Ajoutez au moins un article"),
});

type FormValues = z.infer<typeof form_schema>;

type CreateFlashSaleDialogProps = {
  promotion_id: string;
};

export function CreateFlashSaleDialog({ promotion_id }: CreateFlashSaleDialogProps) {
  const t = useTranslations("promotion_detail");
  const [open, set_open] = useState(false);
  const utils = trpc.useUtils();

  const create_mutation = trpc.promotions.createFlashSale.useMutation({
    onSuccess: () => {
      toast.success(t("flash_sale_created"));
      utils.promotions.flashSales.invalidate();
      utils.promotions.detailStats.invalidate();
      set_open(false);
      form.reset();
    },
    onError: (err) => toast.error(err.message || t("flash_sale_create_error")),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(form_schema),
    defaultValues: {
      title: "",
      starts_at: "",
      ends_at: "",
      max_total_units: "",
      items: [{ product_id: "", sku_id: "", flash_price: 0, max_quantity: 1 }],
    },
  });

  const { control, handleSubmit, formState } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const is_pending = create_mutation.isPending;

  const on_submit = async (values: FormValues) => {
    await create_mutation.mutateAsync({
      promotion_id,
      title: values.title,
      starts_at: new Date(values.starts_at).toISOString(),
      ends_at: new Date(values.ends_at).toISOString(),
      max_total_units: values.max_total_units ? Number(values.max_total_units) : undefined,
      items: values.items.map((item) => ({
        product_id: item.product_id,
        sku_id: item.sku_id,
        flash_price: item.flash_price,
        max_quantity: item.max_quantity,
      })),
    });
  };

  return (
    <Dialog open={open} onOpenChange={set_open}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          {t("flash_sale_create_button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t("flash_sale_create_title")}
          </DialogTitle>
          <DialogDescription>{t("flash_sale_create_description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(on_submit)} className="space-y-6">
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Field data-invalid={!!formState.errors.title}>
                <FieldLabel>{t("flash_sale_title_label")}</FieldLabel>
                <Input {...field} placeholder={t("flash_sale_title_placeholder")} />
                {formState.errors.title && <FieldError errors={[formState.errors.title]} />}
              </Field>
            )}
          />

          <div className="grid gap-4 md:grid-cols-3">
            <Controller
              name="starts_at"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!formState.errors.starts_at}>
                  <FieldLabel>{t("start_date")}</FieldLabel>
                  <Input type="datetime-local" {...field} />
                  {formState.errors.starts_at && (
                    <FieldError errors={[formState.errors.starts_at]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="ends_at"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!formState.errors.ends_at}>
                  <FieldLabel>{t("end_date")}</FieldLabel>
                  <Input type="datetime-local" {...field} />
                  {formState.errors.ends_at && <FieldError errors={[formState.errors.ends_at]} />}
                </Field>
              )}
            />
            <Controller
              name="max_total_units"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("flash_sale_max_total_units_label")}</FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    value={field.value ?? ""}
                    placeholder={t("optional_placeholder")}
                  />
                </Field>
              )}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{t("flash_sale_items_title")}</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ product_id: "", sku_id: "", flash_price: 0, max_quantity: 1 })}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                {t("flash_sale_item_add")}
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="bg-muted/50 space-y-3 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-medium">
                    {t("flash_sale_item_number", { number: String(index + 1) })}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={fields.length <= 1}
                    onClick={() => remove(index)}
                    aria-label={t("flash_sale_item_remove")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <Controller
                    name={`items.${index}.product_id`}
                    control={control}
                    render={({ field: product_field }) => (
                      <Field data-invalid={!!formState.errors.items?.[index]?.product_id}>
                        <FieldLabel>{t("flash_sale_product_label")}</FieldLabel>
                        <ProductCombobox
                          value={product_field.value}
                          onValueChange={(value) => {
                            product_field.onChange(value);
                            form.setValue(`items.${index}.sku_id`, "", { shouldValidate: true });
                          }}
                        />
                        {formState.errors.items?.[index]?.product_id && (
                          <FieldError errors={[formState.errors.items[index].product_id]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name={`items.${index}.sku_id`}
                    control={control}
                    render={({ field: sku_field }) => (
                      <Field data-invalid={!!formState.errors.items?.[index]?.sku_id}>
                        <FieldLabel>{t("flash_sale_sku_label")}</FieldLabel>
                        <SkuCombobox
                          product_id={form.watch(`items.${index}.product_id`)}
                          value={sku_field.value}
                          onValueChange={sku_field.onChange}
                        />
                        {formState.errors.items?.[index]?.sku_id && (
                          <FieldError errors={[formState.errors.items[index].sku_id]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <Controller
                    name={`items.${index}.flash_price`}
                    control={control}
                    render={({ field: price_field }) => (
                      <Field data-invalid={!!formState.errors.items?.[index]?.flash_price}>
                        <FieldLabel>{t("flash_sale_flash_price_label")}</FieldLabel>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          {...price_field}
                          onChange={(e) => price_field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                        />
                        {formState.errors.items?.[index]?.flash_price && (
                          <FieldError errors={[formState.errors.items[index].flash_price]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name={`items.${index}.max_quantity`}
                    control={control}
                    render={({ field: qty_field }) => (
                      <Field data-invalid={!!formState.errors.items?.[index]?.max_quantity}>
                        <FieldLabel>{t("flash_sale_max_qty_label")}</FieldLabel>
                        <Input
                          type="number"
                          min={1}
                          {...qty_field}
                          onChange={(e) => qty_field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                        />
                        {formState.errors.items?.[index]?.max_quantity && (
                          <FieldError errors={[formState.errors.items[index].max_quantity]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
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
