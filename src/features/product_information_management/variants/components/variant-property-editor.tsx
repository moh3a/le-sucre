"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ImageIcon, Plus } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { create_property_dto, create_property_value_dto } from "../models/variant.dto";
import { SkuGeneratorPanel } from "./sku-generator-panel";
import { DeletePropertyDialog } from "./delete-property-dialog";

type PropertyFormValues = z.infer<typeof create_property_dto>;
type ValueFormValues = z.infer<typeof create_property_value_dto>;

type VariantPropertyEditorProps = {
  product_id: string;
  on_change?: () => void;
};

export function VariantPropertyEditor({ product_id, on_change }: VariantPropertyEditorProps) {
  const t = useTranslations("variants");
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.variants.getConfig.useQuery({ product_id });

  const invalidate = async () => {
    await utils.variants.getConfig.invalidate({ product_id });
    on_change?.();
  };

  const create_property = trpc.variants.createProperty.useMutation({ onSuccess: invalidate });
  const create_value = trpc.variants.createPropertyValue.useMutation({ onSuccess: invalidate });
  const delete_value = trpc.variants.deletePropertyValue.useMutation({ onSuccess: invalidate });

  const property_form = useForm<PropertyFormValues>({
    resolver: zodResolver(create_property_dto),
    defaultValues: {
      product_id,
      code: "",
      name: "",
      sort_order: 0,
      is_required: true,
    },
  });

  const [value_forms, set_value_forms] = useState<Record<string, ValueFormValues>>({});

  function get_value_defaults(property_id: string): ValueFormValues {
    return (
      value_forms[property_id] ?? {
        property_id,
        code: "",
        label: "",
        sort_order: 0,
        thumbnail_image: null,
        color_hex: null,
      }
    );
  }

  function set_value_field(
    property_id: string,
    field: keyof ValueFormValues,
    value: string | number | null,
  ) {
    set_value_forms((prev) => ({
      ...prev,
      [property_id]: { ...get_value_defaults(property_id), [field]: value },
    }));
  }

  async function on_add_property(values: PropertyFormValues) {
    await create_property.mutateAsync(values);
    property_form.reset({
      product_id,
      code: "",
      name: "",
      sort_order: 0,
      is_required: true,
    });
  }

  async function on_add_value(property_id: string) {
    const values = get_value_defaults(property_id);
    await create_value.mutateAsync(values);
    set_value_forms((prev) => {
      const next = { ...prev };
      delete next[property_id];
      return next;
    });
  }

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">{t("loading")}</p>;
  }

  const properties = data?.properties ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-1">
          <span className="font-heading text-2xl font-semibold">Liste des proprietes</span>
          <Badge variant="secondary">{properties.length}</Badge>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button">{t("add_property")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("add_property")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={property_form.handleSubmit(on_add_property)}>
              <FieldGroup>
                <Field>
                  <FieldLabel>{t("property_code")}</FieldLabel>
                  <Input placeholder="size" {...property_form.register("code")} />
                </Field>
                <Field>
                  <FieldLabel>{t("property_name")}</FieldLabel>
                  <Input placeholder="Taille" {...property_form.register("name")} />
                </Field>
                <Field>
                  <FieldLabel>{t("property_sort")}</FieldLabel>
                  <Input
                    type="number"
                    {...property_form.register("sort_order", { valueAsNumber: true })}
                  />
                </Field>
                <Field className="flex items-end">
                  <Button type="submit" disabled={create_property.isPending}>
                    {t("add_property")}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </DialogContent>
        </Dialog>
        <SkuGeneratorPanel product_id={product_id} on_change={on_change} />
      </div>

      {properties.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t("empty_properties")}</p>
      ) : (
        <ul className="space-y-3">
          {properties.map((property) => (
            <li key={property.id} className="rounded-lg border">
              <Collapsible defaultOpen>
                <div className="flex items-center justify-between gap-2 p-4">
                  <CollapsibleTrigger className="text-left font-medium">
                    {property.name}{" "}
                    <span className="text-muted-foreground font-normal">({property.code})</span>
                  </CollapsibleTrigger>
                  <div className="flex items-center gap-2">
                    {property.is_required && (
                      <Badge variant="secondary">{t("property_required")}</Badge>
                    )}
                    <DeletePropertyDialog
                      property_id={property.id}
                      product_id={product_id}
                      on_change={on_change}
                    />
                  </div>
                </div>

                <CollapsibleContent className="space-y-4 border-t p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {property.values.map((value) => (
                      <div key={value.id}>
                        <Badge variant="outline" className="gap-2 pr-1">
                          {value.color_hex ? (
                            <span
                              className="inline-block h-4 w-4 rounded-full border"
                              style={{ backgroundColor: value.color_hex }}
                              title={value.color_hex}
                            />
                          ) : value.thumbnail_image ? (
                            <img
                              src={value.thumbnail_image}
                              alt=""
                              className="h-4 w-4 rounded object-cover"
                            />
                          ) : null}
                          {value.label}
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-destructive ml-1"
                            onClick={() => delete_value.mutate({ id: value.id })}
                            aria-label={t("delete_value")}
                          >
                            x
                          </button>
                        </Badge>
                      </div>
                    ))}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          type="button"
                          variant="outline"
                          disabled={create_value.isPending}
                        >
                          <Plus />
                          {t("add_value")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>{t("add_value")}</DialogTitle>
                        </DialogHeader>
                        <Field>
                          <FieldLabel>{t("value_code")}</FieldLabel>
                          <Input
                            value={get_value_defaults(property.id).code}
                            onChange={(e) => set_value_field(property.id, "code", e.target.value)}
                            placeholder="xl"
                          />
                        </Field>
                        <Field>
                          <FieldLabel>{t("value_label")}</FieldLabel>
                          <Input
                            value={get_value_defaults(property.id).label}
                            onChange={(e) => set_value_field(property.id, "label", e.target.value)}
                            placeholder="XL"
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Image (URL)</FieldLabel>
                          <Input
                            value={get_value_defaults(property.id).thumbnail_image ?? ""}
                            onChange={(e) =>
                              set_value_field(
                                property.id,
                                "thumbnail_image",
                                e.target.value || null,
                              )
                            }
                            placeholder="https://..."
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Couleur (hex)</FieldLabel>
                          <div className="flex items-center gap-2">
                            <Input
                              value={get_value_defaults(property.id).color_hex ?? ""}
                              onChange={(e) =>
                                set_value_field(property.id, "color_hex", e.target.value || null)
                              }
                              placeholder="#FF0000"
                            />
                            {get_value_defaults(property.id).color_hex && (
                              <span
                                className="inline-block h-8 w-8 flex-shrink-0 rounded border"
                                style={{
                                  backgroundColor:
                                    get_value_defaults(property.id).color_hex ?? undefined,
                                }}
                              />
                            )}
                          </div>
                        </Field>
                        <Field>
                          <FieldLabel>{t("property_sort")}</FieldLabel>
                          <Input
                            type="number"
                            value={get_value_defaults(property.id).sort_order}
                            onChange={(e) =>
                              set_value_field(property.id, "sort_order", Number(e.target.value))
                            }
                          />
                        </Field>
                        <Field className="flex items-end">
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={create_value.isPending}
                            onClick={() => on_add_value(property.id)}
                          >
                            {t("add_value")}
                          </Button>
                        </Field>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
