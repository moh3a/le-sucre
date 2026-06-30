"use client";

import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
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
import { product_status_enum } from "../models/product.dto";
import type { CategoryTreeNode } from "@/features/product_information_management/categories/types";

const product_form_schema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  name_en: z.string().min(1),
  description_en: z.string().optional().nullable(),
  name_ar: z.string().min(1),
  description_ar: z.string().optional().nullable(),
  keywords: z.array(z.string()),
  slug: z.string().optional(),
  status: product_status_enum,
  base_price: z.number().min(0),
  offer_price: z.number().min(0).optional().nullable(),
  category_id: z.string().min(1),
  subcategory_id: z.string().optional().nullable(),
  brand_id: z.string().optional().nullable(),
  sku: z.string().min(1),
});

type ProductFormValues = z.infer<typeof product_form_schema>;

function flatten_categories(
  nodes: CategoryTreeNode[],
  depth = 0,
): Array<{ id: string; label: string }> {
  return nodes.flatMap((node) => [
    { id: node.id, label: `${"—".repeat(depth)} ${node.name}`.trim() },
    ...flatten_categories(node.children ?? [], depth + 1),
  ]);
}

export function ProductForm({ mode }: { mode: "create" | "edit" }) {
  const t = useTranslations("products");
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: tree } = trpc.categories.tree.useQuery();

  const create = trpc.products.create.useMutation({
    onSuccess: (result) => {
      utils.products.adminList.invalidate();
      router.push(`/console/products/${result.product.id}`);
    },
  });

  const upsert_en = trpc.products.upsertTranslation.useMutation();
  const upsert_ar = trpc.products.upsertTranslation.useMutation();

  const default_values: ProductFormValues = {
    name: "",
    description: null,
    name_en: "",
    description_en: null,
    name_ar: "",
    description_ar: null,
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
  });

  const watched_category_id = form.watch("category_id");

  const category_options = useMemo(() => {
    if (!tree) return [];
    return tree.filter((n) => !n.parent_id).map((n) => ({ id: n.id, name: n.name }));
  }, [tree]);

  const subcategory_options = useMemo(() => {
    const parent = tree?.find((n) => n.id === watched_category_id);
    return parent?.children?.map((c) => ({ id: c.id, name: c.name })) ?? [];
  }, [tree, watched_category_id]);

  const data_ready = !!tree;
  const pending = create.isPending || upsert_en.isPending || upsert_ar.isPending;

  async function on_submit(values: ProductFormValues) {
    if (mode === "edit") return;

    const product_category_id = values.subcategory_id || values.category_id;

    const result = await create.mutateAsync({
      name: values.name,
      description: values.description,
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
      upsert_en.mutateAsync({
        product_id: result.product.id,
         locale: "en",
        name: values.name_en,
        description: values.description_en,
      }),
      upsert_ar.mutateAsync({
        product_id: result.product.id,
         locale: "ar",
        name: values.name_ar,
        description: values.description_ar,
      }),
    ]);
  }

  return (
    <QueryGuard mutation={create}>
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
                  <FieldLabel>{t("sku")}</FieldLabel>
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
                  <FieldLabel>{t("name_fr")}</FieldLabel>
                  <Input {...field} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

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
                    <FieldLabel>{t("base_price")}</FieldLabel>
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
                    <FieldLabel>{t("category")}</FieldLabel>
                    {data_ready ? (
                      <Combobox value={field.value} onValueChange={field.onChange}>
                        <ComboboxInput placeholder={t("search_category_placeholder")} showClear />
                        <ComboboxContent>
                          <ComboboxList>
                            {category_options.map((cat) => (
                              <ComboboxItem key={cat.id} value={cat.id}>
                                {cat.name}
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
                        value={field.value ?? ""}
                        onValueChange={(val) => field.onChange(val || null)}
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
                              <ComboboxItem key={sub.id} value={sub.id}>
                                {sub.name}
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

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? t("saving") : t("save")}
              </Button>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </form>
    </QueryGuard>
  );
}
