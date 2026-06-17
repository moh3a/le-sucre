"use client";

import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { product_details_dto, product_status_enum, upsert_translation_dto } from "../../models/product.dto";
import type { CategoryTreeNode } from "@/features/product_information_management/categories/types";

const general_form_schema = z.object({
  name: z.string().min(1, "Requis"),
  description: z.string().optional().nullable(),
  name_en: z.string().min(1, "Requis"),
  description_en: z.string().optional().nullable(),
  name_ar: z.string().min(1, "Requis"),
  description_ar: z.string().optional().nullable(),
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

function flatten_categories(
  nodes: CategoryTreeNode[],
  depth = 0,
): Array<{ id: string; label: string }> {
  return nodes.flatMap((node) => [
    { id: node.id, label: `${"—".repeat(depth)} ${node.name}`.trim() },
    ...flatten_categories(node.children ?? [], depth + 1),
  ]);
}

export function ProductDetailGeneralTab({
  product,
  product_id,
  translations,
}: {
  product_id: string;
  product: z.infer<typeof product_details_dto>;
  translations: Array<z.infer<typeof upsert_translation_dto>>;
}) {
  const utils = trpc.useUtils();

  const { data: tree } = trpc.categories.tree.useQuery();
  const { data: brands_data } = trpc.products.brandsActive.useQuery();

  const update = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.byId.invalidate({ id: product_id });
      utils.products.adminList.invalidate();
    },
  });

  const upsert_en = trpc.products.upsertTranslation.useMutation({
    onSuccess: () => utils.products.byId.invalidate({ id: product_id }),
  });

  const upsert_ar = trpc.products.upsertTranslation.useMutation({
    onSuccess: () => utils.products.byId.invalidate({ id: product_id }),
  });

  const fr_tr = translations.find((tr) => tr.locale === "fr");
  const en_tr = translations.find((tr) => tr.locale === "en");
  const ar_tr = translations.find((tr) => tr.locale === "ar");

  const default_values: GeneralFormValues = useMemo(
    () => ({
      name: fr_tr?.name ?? "",
      description: fr_tr?.description ?? null,
      name_en: en_tr?.name ?? "",
      description_en: en_tr?.description ?? null,
      name_ar: ar_tr?.name ?? "",
      description_ar: ar_tr?.description ?? null,
      keywords: (product.seo_keywords ?? "")
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      slug: product.slug ?? "",
      status: product.status,
      base_price: product.base_price,
      offer_price: product.offer_price ?? null,
      category_id: product.category_id,
      subcategory_id: null,
      brand_id: product.brand_id ?? null,
    }),
    [fr_tr, en_tr, ar_tr, product],
  );

  const form = useForm<GeneralFormValues>({
    resolver: zodResolver(general_form_schema),
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

  const brand_options = useMemo(
    () => brands_data?.map((b) => ({ id: b.id, name: b.name })) ?? [],
    [brands_data],
  );

  const data_ready = !!tree && !!brands_data;

  const pending = update.isPending || upsert_en.isPending || upsert_ar.isPending;

  async function on_submit(values: GeneralFormValues) {
    const product_category_id = values.subcategory_id || values.category_id;

    const p1 = update.mutateAsync({
      id: product_id,
      name: values.name,
      description: values.description,
      keywords: values.keywords.join(","),
      slug: values.slug,
      status: values.status,
      base_price: values.base_price,
      offer_price: values.offer_price,
      category_id: product_category_id,
      brand_id: values.brand_id || null,
    });

    const p2 = upsert_en.mutateAsync({
      product_id,
      locale: "en",
      name: values.name_en,
      description: values.description_en,
    });

    const p3 = upsert_ar.mutateAsync({
      product_id,
      locale: "ar",
      name: values.name_ar,
      description: values.description_ar,
    });

    await Promise.all([p1, p2, p3]);
  }

  return (
    <form onSubmit={form.handleSubmit(on_submit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Général</CardTitle>
          <CardDescription>Gérer les informations principales du produit.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Nom (FR)</FieldLabel>
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
                  <FieldLabel>Description (FR)</FieldLabel>
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
                  Anglais (EN)
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-4 border-l-2 pl-4">
                  <Controller
                    name="name_en"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Nom (EN)</FieldLabel>
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
                        <FieldLabel>Description (EN)</FieldLabel>
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
                  Arabe (AR)
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-4 border-l-2 pl-4">
                  <Controller
                    name="name_ar"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Nom (AR)</FieldLabel>
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
                        <FieldLabel>Description (AR)</FieldLabel>
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
                    <FieldLabel className="sr-only">Mots-clés</FieldLabel>
                    <TagsInput value={tags} onValueChange={field.onChange} className="w-full">
                      <TagsInputLabel>Mots-clés</TagsInputLabel>
                      <TagsInputList>
                        {tags.map((tag) => (
                          <TagsInputItem key={tag} value={tag}>
                            {tag}
                          </TagsInputItem>
                        ))}
                        <TagsInputInput placeholder="Ajouter un mot-clé..." />
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
                  <FieldLabel>Slug</FieldLabel>
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
                  <FieldLabel>Statut</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="published">Publié</SelectItem>
                      <SelectItem value="archived">Archivé</SelectItem>
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
                    <FieldLabel>Prix de base</FieldLabel>
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
                    <FieldLabel>Prix promo</FieldLabel>
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
                      placeholder="—"
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
                    <FieldLabel>Catégorie</FieldLabel>
                    {data_ready ? (
                      <Combobox value={field.value} onValueChange={field.onChange}>
                        <ComboboxInput placeholder="Rechercher une catégorie..." showClear />
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
                    <FieldLabel>Sous-catégorie</FieldLabel>
                    {data_ready ? (
                      <Combobox
                        value={field.value ?? ""}
                        onValueChange={(val) => field.onChange(val || null)}
                      >
                        <ComboboxInput
                          placeholder={
                            watched_category_id
                              ? "Rechercher une sous-catégorie..."
                              : "Sélectionnez d'abord une catégorie"
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
                    <FieldLabel>Marque</FieldLabel>
                    {data_ready ? (
                      <Combobox
                        value={field.value ?? ""}
                        onValueChange={(val) => field.onChange(val || null)}
                      >
                        <ComboboxInput placeholder="Rechercher une marque..." showClear />
                        <ComboboxContent>
                          <ComboboxList>
                            {brand_options.map((brand) => (
                              <ComboboxItem key={brand.id} value={brand.id}>
                                {brand.name}
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

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={pending}>
                {pending ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </form>
  );
}
