"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
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
  const [open, set_open] = useState(false);
  const utils = trpc.useUtils();

  const create_mutation = trpc.promotions.create.useMutation({
    onSuccess: () => {
      toast.success("Promotion créée avec succès");
      utils.promotions.adminList.invalidate();
      set_open(false);
      form.reset();
    },
    onError: (err) => {
      toast.error(err.message || "Erreur lors de la création");
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
    <Dialog open={open} onOpenChange={set_open}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Créer une promotion
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouvelle promotion</DialogTitle>
          <DialogDescription>
            Créez une nouvelle campagne de remise, code promo, vente flash ou offre groupée.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(on_submit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!formState.errors.name}>
                  <FieldLabel>Nom</FieldLabel>
                  <Input {...field} placeholder="Ex: Soldes été 2026" />
                  {formState.errors.name && <FieldError errors={[formState.errors.name]} />}
                </Field>
              )}
            />

            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!formState.errors.slug}>
                  <FieldLabel>Slug</FieldLabel>
                  <Input {...field} placeholder="soldes-ete-2026" />
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
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Description interne…"
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
                  <FieldLabel>Type de promotion</FieldLabel>
                  <select className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none" {...field}>
                    <option value={PROMOTION_TYPE.promo_code}>Code promo</option>
                    <option value={PROMOTION_TYPE.automatic}>Remise automatique</option>
                    <option value={PROMOTION_TYPE.flash_sale}>Vente flash</option>
                    <option value={PROMOTION_TYPE.bundle}>Offre groupée</option>
                    <option value={PROMOTION_TYPE.customer}>Client ciblé</option>
                  </select>
                </Field>
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Statut</FieldLabel>
                  <select className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none" {...field}>
                    <option value={PROMOTION_STATUS.draft}>Brouillon</option>
                    <option value={PROMOTION_STATUS.scheduled}>Planifiée</option>
                    <option value={PROMOTION_STATUS.active}>Active</option>
                    <option value={PROMOTION_STATUS.paused}>En pause</option>
                  </select>
                </Field>
              )}
            />

            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!formState.errors.priority}>
                  <FieldLabel>Priorité</FieldLabel>
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
                <FieldLabel>Cumulable avec d&apos;autres promotions</FieldLabel>
              </Field>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              name="starts_at"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Date de début</FieldLabel>
                  <Input type="datetime-local" {...field} />
                </Field>
              )}
            />

            <Controller
              name="ends_at"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Date de fin</FieldLabel>
                  <Input type="datetime-local" {...field} />
                </Field>
              )}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="mb-3 text-sm font-semibold">Règle de remise</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="rule_scope_type"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Applicable sur</FieldLabel>
                    <select className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none" {...field}>
                      <option value={DISCOUNT_SCOPE.cart}>Panier entier</option>
                      <option value={DISCOUNT_SCOPE.category}>Catégorie</option>
                      <option value={DISCOUNT_SCOPE.product}>Produit</option>
                      <option value={DISCOUNT_SCOPE.sku}>SKU</option>
                      <option value={DISCOUNT_SCOPE.customer}>Client</option>
                      <option value={DISCOUNT_SCOPE.shipping}>Livraison</option>
                    </select>
                  </Field>
                )}
              />

              <Controller
                name="rule_discount_type"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Type de remise</FieldLabel>
                    <select className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none" {...field}>
                      <option value={DISCOUNT_TYPE.percent}>Pourcentage</option>
                      <option value={DISCOUNT_TYPE.fixed}>Montant fixe</option>
                      <option value={DISCOUNT_TYPE.free_shipping}>Livraison gratuite</option>
                      <option value={DISCOUNT_TYPE.buy_x_get_y}>Achetez X obtenez Y</option>
                    </select>
                  </Field>
                )}
              />

              <Controller
                name="rule_discount_value"
                control={control}
                render={({ field }) => (
                  <Field data-invalid={!!formState.errors.rule_discount_value}>
                    <FieldLabel>Valeur de la remise</FieldLabel>
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
                    <FieldLabel>Panier minimum</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="Facultatif"
                    />
                  </Field>
                )}
              />

              <Controller
                name="rule_max_discount_amount"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Montant max. de remise</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="Facultatif"
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
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-[#c8d152] text-[#4d4c20] hover:bg-[#c8d152]/90"
              disabled={is_pending}
            >
              {is_pending ? "Création…" : "Créer la promotion"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
