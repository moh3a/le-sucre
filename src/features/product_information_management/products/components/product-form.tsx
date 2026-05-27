"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { CategoryTreeNode } from "@/features/product_information_management/categories/types";
import { create_product_dto } from "../models/product.dto";
import { RichTextEditor } from "./rich-text-editor";

type ProductFormValues = z.infer<typeof create_product_dto>;

type ProductFormProps = {
  mode: "create" | "edit";
  product_id?: string;
  default_values?: Partial<ProductFormValues>;
};

export function ProductForm({ mode, product_id, default_values }: ProductFormProps) {
  const t = useTranslations("products");
  const router = useRouter();
  const { data: brands } = trpc.products.brandsActive.useQuery();
  const { data: categories } = trpc.categories.tree.useQuery();

  const create_mutation = trpc.products.create.useMutation({
    onSuccess: (data) => router.push(`/console/products/${data.product.id}`),
  });
  const update_mutation = trpc.products.update.useMutation({
    onSuccess: () => router.push(`/console/products/${product_id}`),
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(create_product_dto),
    defaultValues: {
      name: "",
      sku: "",
      slug: "",
      description: "",
      keywords: "",
      category_id: "",
      brand_id: null,
      base_price: 0,
      offer_price: null,
      currency: "DZD",
      status: "draft",
      is_featured: false,
      metadata: {},
      seo_title: "",
      seo_description: "",
      ...default_values,
    },
  });

  function flatten_categories(
    nodes: CategoryTreeNode[],
    depth = 0,
  ): Array<{ id: string; label: string }> {
    return nodes.flatMap((node) => [
      { id: node.id, label: `${"—".repeat(depth)} ${node.name}`.trim() },
      ...flatten_categories(node.children ?? [], depth + 1),
    ]);
  }

  const category_options = categories ? flatten_categories(categories) : [];

  async function on_submit(values: ProductFormValues) {
    if (mode === "create") {
      await create_mutation.mutateAsync(values);
      return;
    }
    if (!product_id) return;
    await update_mutation.mutateAsync({ ...values, id: product_id });
  }

  const pending = create_mutation.isPending || update_mutation.isPending;

  return (
    <form className="space-y-8" onSubmit={form.handleSubmit(on_submit)}>
      <FieldGroup>
        <h2 className="font-heading text-lg font-semibold">{t("section_general")}</h2>

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

        <div className="grid gap-4 md:grid-cols-2">
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
            name="slug"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("slug")}</FieldLabel>
                <Input {...field} placeholder="auto" />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>

        <Controller
          name="description"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>{t("description")}</FieldLabel>
              <RichTextEditor value={field.value ?? ""} onChange={field.onChange} />
            </Field>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="category_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("category")}</FieldLabel>
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={field.value}
                  onChange={field.onChange}
                >
                  <option value="">{t("select_category")}</option>
                  {category_options.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            name="brand_id"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("brand")}</FieldLabel>
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                >
                  <option value="">{t("no_brand")}</option>
                  {brands?.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Controller
            name="base_price"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("base_price")}</FieldLabel>
                <Input type="number" step="0.01" {...field} />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            name="offer_price"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("offer_price")}</FieldLabel>
                <Input
                  type="number"
                  step="0.01"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value === "" ? null : Number(e.target.value))
                  }
                />
              </Field>
            )}
          />
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("status")}</FieldLabel>
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={field.value}
                  onChange={field.onChange}
                >
                  <option value="draft">{t("status_draft")}</option>
                  <option value="published">{t("status_published")}</option>
                  <option value="archived">{t("status_archived")}</option>
                </select>
              </Field>
            )}
          />
        </div>
      </FieldGroup>

      <FieldGroup>
        <h2 className="font-heading text-lg font-semibold">{t("section_seo")}</h2>
        <Controller
          name="keywords"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>{t("keywords")}</FieldLabel>
              <Input {...field} value={field.value ?? ""} />
            </Field>
          )}
        />
        <Controller
          name="seo_title"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>{t("seo_title")}</FieldLabel>
              <Input {...field} value={field.value ?? ""} />
            </Field>
          )}
        />
        <Controller
          name="seo_description"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>{t("seo_description")}</FieldLabel>
              <Input {...field} value={field.value ?? ""} />
            </Field>
          )}
        />
      </FieldGroup>

      <Button type="submit" disabled={pending}>
        {pending ? "…" : t("save")}
      </Button>
    </form>
  );
}
