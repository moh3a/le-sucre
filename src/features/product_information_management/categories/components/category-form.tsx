"use client";

import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
      onSuccess?.();
    },
  });

  const update_mutation = trpc.categories.update.useMutation({
    onSuccess: async () => {
      await utils.categories.tree.invalidate();
      await utils.categories.list.invalidate();
      onSuccess?.();
    },
  });

  const move_mutation = trpc.categories.move.useMutation({
    onSuccess: async () => {
      await utils.categories.tree.invalidate();
      await utils.categories.list.invalidate();
    },
  });

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(create_category_dto),
    defaultValues: {
      name: "",
      slug: "",
      description: null,
      parent_id: null,
      sort_order: 0,
      is_active: true,
      ...default_values,
    },
  });

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
    <QueryGuard query={tree_query}>
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
              <Input {...field} placeholder="auto" />
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
                  <option value="false">Inactive</option>
                </select>
              </Field>
            )}
          />
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? "…" : t("save")}
        </Button>
      </FieldGroup>
    </form>
    </QueryGuard>
  );
}
