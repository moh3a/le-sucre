"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
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
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { BrandCombobox } from "@/features/product_information_management/brands/components/brand-combobox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import {
  product_details_dto,
  product_status_enum,
  upsert_translation_dto,
} from "../../models/product.dto";
import { apply_server_field_errors } from "../../helpers/apply-server-field-errors.helper";

const general_form_schema = z.object({
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
  wholesale_pieces_per_unit: z.number().int().min(1, "Doit être ≥ 1"),
  wholesale_base_price: z.number().min(0).optional().nullable(),
  wholesale_offer_price: z.number().min(0).optional().nullable(),
  keywords: z.array(z.string()),
  slug: z.string().min(1, "Requis"),
  status: product_status_enum,
  base_price: z.number().min(0, "Doit être ≥ 0"),
  offer_price: z.number().min(0, "Doit être ≥ 0").optional().nullable(),
  category_id: z.string().min(1, "Requis"),
  subcategory_id: z.string().optional().nullable(),
  brand_id: z.string().optional().nullable(),
});

type GeneralFormValues = z.infer<typeof general_form_schema>;

// function flatten_categories(
//   nodes: CategoryTreeNode[],
//   depth = 0,
// ): Array<{ id: string; label: string }> {
//   return nodes.flatMap((node) => [
//     { id: node.id, label: `${"—".repeat(depth)} ${node.name}`.trim() },
//     ...flatten_categories(node.children ?? [], depth + 1),
//   ]);
// }

export function ProductDetailGeneralTab({
  product,
  product_id,
  translations,
  units,
}: {
  product_id: string;
  product: z.infer<typeof product_details_dto>;
  translations: Array<z.infer<typeof upsert_translation_dto>>;
  units?: Array<{ channel: string; unit_name: string; pieces_per_unit: number; base_price: string; offer_price: string | null }>;
}) {
  const t = useTranslations("products");
  const utils = trpc.useUtils();

  const { data: tree } = trpc.categories.tree.useQuery();

  function handle_mutation_error(err: { message?: string; data?: unknown }) {
    const data = (err.data ?? {}) as { fieldErrors?: Record<string, string[]> };
    if (apply_server_field_errors(form, data)) {
      toast.error(t("validation_failed"));
    } else {
      toast.error(err.message ?? t("validation_failed"));
    }
  }

  const update = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.byId.invalidate({ id: product_id });
      utils.products.adminList.invalidate();
      toast.success(t("product_updated"));
    },
    onError: handle_mutation_error,
  });

  const upsert_en = trpc.products.upsertTranslation.useMutation({
    onSuccess: () => utils.products.byId.invalidate({ id: product_id }),
    onError: handle_mutation_error,
  });

  const upsert_ar = trpc.products.upsertTranslation.useMutation({
    onSuccess: () => utils.products.byId.invalidate({ id: product_id }),
    onError: handle_mutation_error,
  });

  const fr_tr = translations.find((tr) => tr.locale === "fr");
  const en_tr = translations.find((tr) => tr.locale === "en");
  const ar_tr = translations.find((tr) => tr.locale === "ar");

  const retail_unit = units?.find((u) => u.channel === "retail");
  const wholesale_unit = units?.find((u) => u.channel === "wholesale");

  const default_values: GeneralFormValues = useMemo(
    () => ({
      name: fr_tr?.name ?? "",
      description: fr_tr?.description ?? null,
      name_en: en_tr?.name ?? "",
      description_en: en_tr?.description ?? null,
      name_ar: ar_tr?.name ?? "",
      description_ar: ar_tr?.description ?? null,
      retail_unit_name: retail_unit?.unit_name ?? "pièce",
      wholesale_unit_name: wholesale_unit?.unit_name ?? "carton",
      wholesale_pieces_per_unit: wholesale_unit?.pieces_per_unit ?? 1,
      wholesale_base_price: wholesale_unit?.base_price ? Number(wholesale_unit.base_price) : null,
      wholesale_offer_price: wholesale_unit?.offer_price ? Number(wholesale_unit.offer_price) : null,
      keywords: (product.seo_keywords ?? "")
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      slug: product.slug ?? "",
      status: product.status,
      base_price: retail_unit?.base_price ? Number(retail_unit.base_price) : product.base_price,
      offer_price: retail_unit?.offer_price ? Number(retail_unit.offer_price) : product.offer_price ?? null,
      category_id: product.category_id,
      subcategory_id: product.category_id,
      brand_id: product.brand_id ?? null,
    }),
    [fr_tr, en_tr, ar_tr, product, retail_unit, wholesale_unit],
  );

  const form = useForm<GeneralFormValues>({
    resolver: zodResolver(general_form_schema),
    defaultValues: default_values,
    mode: "onChange",
  });

  useEffect(() => {
    form.trigger();
  }, [form]);

  const watched_category_id = form.watch("category_id");

  const all_categories = useMemo(() => {
    if (!tree) return [];
    return tree.flatMap((n) => [
      { value: n.id, label: n.name, parent_id: n.parent_id ?? null },
      ...(n.children ?? []).map((c) => ({
        value: c.id,
        label: c.name,
        parent_id: c.parent_id ?? n.id,
      })),
    ]);
  }, [tree]);

  const category_options = useMemo(
    () => all_categories.filter((c) => !c.parent_id),
    [all_categories],
  );

  const subcategory_options = useMemo(
    () => all_categories.filter((c) => c.parent_id === watched_category_id),
    [all_categories, watched_category_id],
  );

  function resolve_category(value: string | null) {
    if (!value) return null;
    const match = all_categories.find((c) => c.value === value);
    if (!match) return null;
    if (match.parent_id) {
      return all_categories.find((c) => c.value === match.parent_id) ?? null;
    }
    return match;
  }

  useEffect(() => {
    if (all_categories.length === 0) return;
    const stored = product.category_id;
    const match = all_categories.find((c) => c.value === stored);
    if (match?.parent_id) {
      form.setValue("category_id", match.parent_id, { shouldValidate: true });
      form.setValue("subcategory_id", stored, { shouldValidate: true });
    } else if (stored) {
      form.setValue("category_id", stored, { shouldValidate: true });
      form.setValue("subcategory_id", null, { shouldValidate: true });
    }
  }, [all_categories, form, product.category_id]);

  const data_ready = !!tree;

  const pending = update.isPending || upsert_en.isPending || upsert_ar.isPending;

  async function on_submit(values: GeneralFormValues) {
    const product_category_id = values.subcategory_id || values.category_id;

    const p1 = update.mutateAsync({
      id: product_id,
      name: values.name,
      description: values.description,
      retail_unit_name: values.retail_unit_name,
      wholesale_unit_name: values.wholesale_unit_name,
      wholesale_pieces_per_unit: values.wholesale_pieces_per_unit,
      wholesale_base_price: values.wholesale_base_price,
      wholesale_offer_price: values.wholesale_offer_price,
      keywords: values.keywords.join(","),
      slug: values.slug,
      status: values.status,
      base_price: values.base_price,
      offer_price: values.offer_price,
      category_id: product_category_id,
      brand_id: values.brand_id || null,
    });

    const p2 = values.name_en
      ? upsert_en.mutateAsync({
          product_id,
          locale: "en",
          name: values.name_en,
          description: values.description_en,
        })
      : Promise.resolve();

    const p3 = values.name_ar
      ? upsert_ar.mutateAsync({
          product_id,
          locale: "ar",
          name: values.name_ar,
          description: values.description_ar,
        })
      : Promise.resolve();

    await Promise.all([p1, p2, p3]);
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
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
                          {tags.map((tag) => (
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
                    <FieldLabel required>{t("slug")}</FieldLabel>
                    <Input {...field} />
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
                          field.onChange(
                            e.target.value === "" ? 0 : parseFloat(e.target.value) || 0,
                          )
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
                      {data_ready ? (
                        <Combobox
                          value={resolve_category(field.value)}
                          onValueChange={(item) => field.onChange(item?.value ?? "")}
                        >
                          <ComboboxInput placeholder={t("search_category_placeholder")} showClear />
                          <ComboboxContent>
                            <ComboboxList>
                              {category_options.map((cat) => (
                                <ComboboxItem key={cat.value} value={cat}>
                                  {cat.label}
                                </ComboboxItem>
                              ))}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                      ) : (
                        <Input value={field.value} disabled />
                      )}
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
                      {data_ready ? (
                        <Combobox
                          value={
                            subcategory_options.find((sub) => sub.value === field.value) ?? null
                          }
                          onValueChange={(item) => field.onChange(item?.value ?? null)}
                        >
                          <ComboboxInput
                            placeholder={
                              watched_category_id
                                ? t("search_subcategory_placeholder")
                                : t("select_category_first")
                            }
                            showClear
                            disabled={!watched_category_id}
                          />
                          <ComboboxContent>
                            <ComboboxList>
                              {subcategory_options.map((sub) => (
                                <ComboboxItem key={sub.value} value={sub}>
                                  {sub.label}
                                </ComboboxItem>
                              ))}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                      ) : (
                        <Input value={field.value ?? ""} disabled />
                      )}
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

              <div className="flex justify-end pt-4">
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
