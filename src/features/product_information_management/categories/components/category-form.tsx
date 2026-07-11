"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { slugify } from "@/lib/utils";
import type { CategoryTreeNode } from "@/features/product_information_management/categories/types";
import { create_category_dto } from "@/features/product_information_management/categories/models/category.dto";

type CategoryFormValues = z.infer<typeof create_category_dto>;

type CategoryFormProps = {
  mode: "create" | "edit";
  category_id?: string;
  default_values?: Partial<CategoryFormValues>;
  onSuccess?: () => void;
};

function flatten_categories(
  nodes: CategoryTreeNode[],
  depth = 0,
): Array<{ id: string; label: string }> {
  return nodes.flatMap((node) => [
    { id: node.id, label: `${"—".repeat(depth)} ${node.name}`.trim() },
    ...flatten_categories(node.children ?? [], depth + 1),
  ]);
}

export function CategoryForm({ mode, category_id, default_values, onSuccess }: CategoryFormProps) {
  const t = useTranslations("categories");
  const utils = trpc.useUtils();
  const tree_query = trpc.categories.tree.useQuery();
  const { data: tree } = tree_query;

  const create_mutation = trpc.categories.create.useMutation({
    onSuccess: async () => {
      await utils.categories.tree.invalidate();
      await utils.categories.list.invalidate();
      toast.success(t("category_created"));
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });

  const update_mutation = trpc.categories.update.useMutation({
    onSuccess: async () => {
      await utils.categories.tree.invalidate();
      await utils.categories.list.invalidate();
      toast.success(t("category_updated"));
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });

  const move_mutation = trpc.categories.move.useMutation({
    onSuccess: async () => {
      await utils.categories.tree.invalidate();
      await utils.categories.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(create_category_dto),
    defaultValues: {
      name: "",
      slug: null,
      description: null,
      parent_id: null,
      sort_order: 0,
      is_active: true,
      ...default_values,
    },
  });

  const slug_manual = useRef(mode === "edit" && !!default_values?.slug);
  const name_value = form.watch("name");

  useEffect(() => {
    if (slug_manual.current) return;
    form.setValue("slug", name_value ? slugify(name_value) : null, {
      shouldValidate: !!name_value,
    });
  }, [name_value, form]);

  const pending = create_mutation.isPending || update_mutation.isPending || move_mutation.isPending;

  const parent_options = tree
    ? [{ id: "", label: "—" }, ...flatten_categories(tree)]
    : [{ id: "", label: "—" }];

  async function on_submit(values: CategoryFormValues) {
    if (mode === "create") {
      await create_mutation.mutateAsync(values);
      form.reset();
      return;
    }
    if (!category_id) return;

    // update fields
    await update_mutation.mutateAsync({ ...values, id: category_id });

    // if parent changed, move
    const new_parent_id = values.parent_id ?? null;
    await move_mutation.mutateAsync({ id: category_id, new_parent_id });
  }

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(on_submit)}>
      <FieldGroup>
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

          <Controller
            name="slug"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("slug")}</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    value={field.value ?? ""}
                    onChange={(e) => {
                      slug_manual.current = true;
                      field.onChange(e.target.value || null);
                    }}
                    placeholder={t("auto_slug_placeholder")}
                  />
                  {slug_manual.current && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        slug_manual.current = false;
                        const auto = name_value ? slugify(name_value) : null;
                        field.onChange(auto);
                        form.setValue("slug", auto, { shouldValidate: !!auto });
                      }}
                    >
                      Auto
                    </Button>
                  )}
                </div>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name="parent_id"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("parent")}</FieldLabel>
                {tree_query.isLoading ? (
                  <div className="flex h-9 items-center gap-2 rounded-md border px-3">
                    <Spinner className="size-3.5" />
                    <span className="text-muted-foreground text-xs">{t("refreshing")}</span>
                  </div>
                ) : (
                  <select
                    className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  >
                    {parent_options.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("description")}</FieldLabel>
                <Input
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              </Field>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              name="sort_order"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t("sort_order")}</FieldLabel>
                  <Input
                    type="number"
                    value={field.value ?? 0}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="is_active"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("active")}</FieldLabel>
                  <select
                    className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                    value={field.value ? "true" : "false"}
                    onChange={(e) => field.onChange(e.target.value === "true")}
                  >
                    <option value="true">{t("active")}</option>
                    <option value="false">{t("inactive")}</option>
                  </select>
                </Field>
              )}
            />
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? t("saving") : t("save")}
          </Button>
        </FieldGroup>
      </form>
  );
}
