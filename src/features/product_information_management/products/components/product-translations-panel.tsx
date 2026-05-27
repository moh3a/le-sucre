"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "./rich-text-editor";

const LOCALES = ["en", "ar"] as const;

type ProductTranslationsPanelProps = {
  product_id: string;
  translations: Array<{
    locale: string;
    name: string;
    description: string | null;
    keywords: string | null;
    seo_title: string | null;
    seo_description: string | null;
  }>;
};

export function ProductTranslationsPanel({
  product_id,
  translations,
}: ProductTranslationsPanelProps) {
  const t = useTranslations("products");
  const utils = trpc.useUtils();
  const upsert = trpc.products.upsertTranslation.useMutation({
    onSuccess: () => utils.products.byId.invalidate({ id: product_id }),
  });

  const [forms, set_forms] = useState(() =>
    LOCALES.map((locale) => {
      const existing = translations.find((tr) => tr.locale === locale);
      return {
        locale,
        name: existing?.name ?? "",
        description: existing?.description ?? "",
        keywords: existing?.keywords ?? "",
        seo_title: existing?.seo_title ?? "",
        seo_description: existing?.seo_description ?? "",
      };
    }),
  );

  return (
    <div className="space-y-6">
      {forms.map((form, index) => (
        <FieldGroup key={form.locale} className="rounded-lg border p-4">
          <h3 className="font-heading font-semibold">
            {t("locale")}: {form.locale.toUpperCase()}
          </h3>
          <Field>
            <FieldLabel>{t("name")}</FieldLabel>
            <Input
              value={form.name}
              onChange={(e) => {
                const next = [...forms];
                next[index] = { ...form, name: e.target.value };
                set_forms(next);
              }}
            />
          </Field>
          <Field>
            <FieldLabel>{t("description")}</FieldLabel>
            <RichTextEditor
              value={form.description}
              onChange={(html) => {
                const next = [...forms];
                next[index] = { ...form, description: html };
                set_forms(next);
              }}
            />
          </Field>
          <Button
            type="button"
            onClick={() =>
              upsert.mutate({
                product_id,
                locale: form.locale,
                name: form.name,
                description: form.description,
                keywords: form.keywords,
                seo_title: form.seo_title,
                seo_description: form.seo_description,
              })
            }
            disabled={upsert.isPending}
          >
            {t("save_translation")}
          </Button>
        </FieldGroup>
      ))}
    </div>
  );
}
