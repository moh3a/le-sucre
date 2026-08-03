"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputLabel,
  TagsInputList,
} from "@/components/ui/tags-input";
import { BrandCombobox } from "@/features/product_information_management/brands/components/brand-combobox";
import { CategoryCombobox } from "@/features/product_information_management/categories/components/category-combobox";
import { SubcategoryCombobox } from "@/features/product_information_management/categories/components/subcategory-combobox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { product_status_enum } from "../models/product.dto";
import { apply_server_field_errors } from "../helpers/apply-server-field-errors.helper";

const product_form_schema = z.object({
  name: z.string().min(2, "Au minimum 2 caractères"),
  description: z.string().optional().nullable(),
  name_en: z
    .string()
    .optional()
    .refine((v) => !v || v.length >= 2, "Au minimum 2 caractères"),
  description_en: z.string().optional().nullable(),
  name_ar: z
    .string()
    .optional()
    .refine((v) => !v || v.length >= 2, "Au minimum 2 caractères"),
  description_ar: z.string().optional().nullable(),
  retail_unit_name: z.string().max(128),
  wholesale_unit_name: z.string().max(128),
  wholesale_pieces_per_unit: z.number().int().min(1),
  wholesale_base_price: z.number().min(0).optional().nullable(),
  wholesale_offer_price: z.number().min(0).optional().nullable(),
  keywords: z.array(z.string()),
  slug: z.string().optional(),
  status: product_status_enum,
  base_price: z.number().min(0),
  offer_price: z.number().min(0).optional().nullable(),
  category_id: z.string().min(1, "Requis"),
  subcategory_id: z.string().optional().nullable(),
  brand_id: z.string().optional().nullable(),
  sku: z.string().min(1, "Requis"),
});

type ProductFormValues = z.infer<typeof product_form_schema>;

export function ProductForm({ mode }: { mode: "create" | "edit" }) {
  const t = useTranslations("products");
  const router = useRouter();
  const utils = trpc.useUtils();

  function handle_mutation_error(err: { message?: string; data?: unknown }) {
    const data = (err.data ?? {}) as { fieldErrors?: Record<string, string[]> };
    if (apply_server_field_errors(form, data)) {
      toast.error(t("validation_failed"));
    } else {
      toast.error(err.message ?? t("validation_failed"));
    }
  }

  const create = trpc.products.create.useMutation({
    onSuccess: (result) => {
      utils.products.adminList.invalidate();
      toast.success(t("product_created"));
      router.push(`/console/products/${result.product.id}`);
    },
    onError: handle_mutation_error,
  });

  const upsert_en = trpc.products.upsertTranslation.useMutation({
    onError: handle_mutation_error,
  });
  const upsert_ar = trpc.products.upsertTranslation.useMutation({
    onError: handle_mutation_error,
  });

  const default_values: ProductFormValues = {
    name: "",
    description: null,
    name_en: "",
    description_en: null,
    name_ar: "",
    description_ar: null,
    retail_unit_name: "pièce",
    wholesale_unit_name: "carton",
    wholesale_pieces_per_unit: 1,
    wholesale_base_price: null,
    wholesale_offer_price: null,
    keywords: [],
    slug: "",
    status: "draft",
    base_price: 0,
    offer_price: null,
    category_id: "",
    subcategory_id: null,
    brand_id: null,
    sku: "",
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(product_form_schema),
    defaultValues: default_values,
    mode: "onChange",
  });

  useEffect(() => {
    form.trigger();
  }, [form]);

  const watched_category_id = form.watch("category_id");

  const pending = create.isPending || upsert_en.isPending || upsert_ar.isPending;

  async function on_submit(values: ProductFormValues) {
    if (mode === "edit") return;

    const product_category_id = values.subcategory_id || values.category_id;

    const result = await create.mutateAsync({
      name: values.name,
      description: values.description,
      retail_unit_name: values.retail_unit_name,
      wholesale_unit_name: values.wholesale_unit_name,
      wholesale_pieces_per_unit: values.wholesale_pieces_per_unit,
      wholesale_base_price: values.wholesale_base_price,
      wholesale_offer_price: values.wholesale_offer_price,
      keywords: values.keywords.join(","),
      slug: values.slug || undefined,
      status: values.status,
      base_price: values.base_price,
      offer_price: values.offer_price,
      category_id: product_category_id,
      brand_id: values.brand_id || null,
      sku: values.sku,
      currency: "DZD",
    });

    await Promise.all([
      values.name_en
        ? upsert_en.mutateAsync({
            product_id: result.product.id,
             locale: "en",
            name: values.name_en,
            description: values.description_en,
          })
        : Promise.resolve(),
      values.name_ar
        ? upsert_ar.mutateAsync({
            product_id: result.product.id,
             locale: "ar",
            name: values.name_ar,
            description: values.description_ar,
          })
        : Promise.resolve(),
    ]);
  }

  return (
    <form onSubmit={form.handleSubmit(on_submit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("general")}</CardTitle>
          <CardDescription>{t("general_description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FieldGroup>
            <Controller
              name="sku"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required>{t("sku")}</FieldLabel>
                  <Input {...field} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required>{t("name_fr")}</FieldLabel>
                  <Input {...field} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="retail_unit_name"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("retail_unit_name")}</FieldLabel>
                    <Input
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value || "pièce")}
                      placeholder="pièce"
                    />
                  </Field>
                )}
              />

              <Controller
                name="wholesale_unit_name"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("wholesale_unit_name")}</FieldLabel>
                    <Input
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value || "carton")}
                      placeholder="carton"
                    />
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Controller
                name="wholesale_pieces_per_unit"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{t("wholesale_pieces_per_unit")}</FieldLabel>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(e.target.value === "" ? 1 : parseInt(e.target.value) || 1)
                      }
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                name="wholesale_base_price"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{t("wholesale_base_price")}</FieldLabel>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? null : parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder={t("none_placeholder")}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                name="wholesale_offer_price"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{t("wholesale_offer_price")}</FieldLabel>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? null : parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder={t("none_placeholder")}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t("description_fr")}</FieldLabel>
                  <Textarea
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

              <Collapsible>
              <CollapsibleTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="flex items-center gap-2">
                  <ChevronRight className="size-4" />
                  {t("english")}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-4 border-l-2 pl-4">
                  <Controller
                    name="name_en"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>{t("name_en")}</FieldLabel>
                        <Input {...field} />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                  <Controller
                    name="description_en"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>{t("description_en")}</FieldLabel>
                        <Textarea
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="flex items-center gap-2">
                  <ChevronRight className="size-4" />
                  {t("arabic")}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-4 border-l-2 pl-4">
                  <Controller
                    name="name_ar"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>{t("name_ar")}</FieldLabel>
                        <Input {...field} dir="rtl" />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                  <Controller
                    name="description_ar"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>{t("description_ar")}</FieldLabel>
                        <Textarea
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value || null)}
                          dir="rtl"
                        />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Controller
              name="keywords"
              control={form.control}
              render={({ field }) => {
                const tags = field.value ?? [];
                return (
                  <Field>
                    <FieldLabel className="sr-only">{t("keywords")}</FieldLabel>
                    <TagsInput value={tags} onValueChange={field.onChange} className="w-full">
                      <TagsInputLabel>{t("keywords")}</TagsInputLabel>
                      <TagsInputList>
                        {tags.map((tag: string) => (
                          <TagsInputItem key={tag} value={tag}>
                            {tag}
                          </TagsInputItem>
                        ))}
                        <TagsInputInput placeholder={t("add_keyword_placeholder")} />
                      </TagsInputList>
                    </TagsInput>
                  </Field>
                );
              }}
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
              name="status"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("status")}</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{t("draft")}</SelectItem>
                      <SelectItem value="published">{t("published")}</SelectItem>
                      <SelectItem value="archived">{t("archived")}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="base_price"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel required>{t("base_price")}</FieldLabel>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)
                      }
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                name="offer_price"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{t("offer_price")}</FieldLabel>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? null : parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder={t("none_placeholder")}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="category_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel required>{t("category")}</FieldLabel>
                    <CategoryCombobox
                      value={field.value || null}
                      onValueChange={(val) => field.onChange(val ?? "")}
                      placeholder={t("search_category_placeholder")}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                name="subcategory_id"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("subcategory")}</FieldLabel>
                    <SubcategoryCombobox
                      value={field.value ?? null}
                      onValueChange={(val) => field.onChange(val ?? null)}
                      disabled={!watched_category_id}
                      placeholder={
                        watched_category_id
                          ? t("search_subcategory_placeholder")
                          : t("select_category_first")
                      }
                    />
                  </Field>
                )}
              />
            </div>

            <Controller
              name="brand_id"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("brand")}</FieldLabel>
                  <BrandCombobox
                    value={field.value ?? ""}
                    onValueChange={(val) => field.onChange(val ?? null)}
                  />
                </Field>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={pending || !form.formState.isValid}>
                {pending ? t("saving") : t("save")}
              </Button>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </form>
  );
}
