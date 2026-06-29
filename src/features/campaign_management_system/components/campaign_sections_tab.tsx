"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SECTION_TYPE } from "../constants/campaign_types";
import { Plus, Trash, Pencil, LayoutGrid, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

import { CategoryTreeNode } from "@/features/product_information_management/categories/types";

type SectionConfig = {
  product_ids?: string[];
  category_id?: string;
  brand_id?: string;
  limit?: number;
  video_url?: string;
  countdown_end?: string;
};

type SectionRow = {
  id: string;
  campaign_id: string;
  section_type: string;
  page_slug: string;
  sort_order: number;
  is_active: boolean;
  heading: {
    en?: string;
    fr?: string;
    ar?: string;
  } | null;
  config: SectionConfig;
};

type SectionsTabProps = {
  campaign_id: string;
  sections: SectionRow[];
};

type SectionFormState = {
  section_type: string;
  page_slug: string;
  sort_order: number;
  is_active: boolean;
  heading: {
    fr: string;
    en: string;
    ar: string;
  };
  config: SectionConfig;
};

export function CampaignSectionsTab({ campaign_id, sections }: SectionsTabProps) {
  const t = useTranslations("campaigns");
  const utils = trpc.useUtils();
  const [selectedSection, setSelectedSection] = useState<SectionRow | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // tRPC calls for options
  const { data: products } = trpc.products.list.useQuery({ page: 1, limit: 100 });
  const { data: categoriesTree } = trpc.categories.tree.useQuery();
  const { data: activeBrands } = trpc.brands.active.useQuery();

  const add_section = trpc.campaigns.addSection.useMutation({
    onSuccess: () => {
      toast.success(t("section_added"));
      utils.campaigns.byId.invalidate({ id: campaign_id });
      setIsOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const update_section = trpc.campaigns.updateSection.useMutation({
    onSuccess: () => {
      toast.success(t("section_updated"));
      utils.campaigns.byId.invalidate({ id: campaign_id });
      setIsOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const delete_section = trpc.campaigns.deleteSection.useMutation({
    onSuccess: () => {
      toast.success(t("section_deleted"));
      utils.campaigns.byId.invalidate({ id: campaign_id });
    },
    onError: (err) => toast.error(err.message),
  });

  const [formState, setFormState] = useState<SectionFormState>({
    section_type: "product_grid",
    page_slug: "home",
    sort_order: 0,
    is_active: true,
    heading: { fr: "", en: "", ar: "" },
    config: {},
  });

  const handleOpenNew = () => {
    setSelectedSection(null);
    setFormState({
      section_type: "product_grid",
      page_slug: "home",
      sort_order: sections.length,
      is_active: true,
      heading: { fr: "", en: "", ar: "" },
      config: {
        product_ids: [],
        category_id: "",
        brand_id: "",
        limit: 8,
        video_url: "",
        countdown_end: "",
      },
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (section: SectionRow) => {
    setSelectedSection(section);
    setFormState({
      section_type: section.section_type ?? "product_grid",
      page_slug: section.page_slug ?? "home",
      sort_order: section.sort_order ?? 0,
      is_active: !!section.is_active,
      heading: {
        fr: section.heading?.fr ?? "",
        en: section.heading?.en ?? "",
        ar: section.heading?.ar ?? "",
      },
      config: {
        product_ids: section.config?.product_ids ?? [],
        category_id: section.config?.category_id ?? "",
        brand_id: section.config?.brand_id ?? "",
        limit: section.config?.limit ?? 8,
        video_url: section.config?.video_url ?? "",
        countdown_end: section.config?.countdown_end ?? "",
      },
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("confirm_delete_section"))) {
      await delete_section.mutateAsync({ id });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      section_type: formState.section_type,
      page_slug: formState.page_slug,
      sort_order: Number(formState.sort_order),
      is_active: formState.is_active,
      heading: formState.heading,
      config: formState.config,
    };

    if (selectedSection) {
      await update_section.mutateAsync({
        ...payload,
        id: selectedSection.id,
      });
    } else {
      await add_section.mutateAsync({
        ...payload,
        campaign_id,
      });
    }
  };

  const handleHeadingChange = (lang: "fr" | "en" | "ar", val: string) => {
    setFormState({
      ...formState,
      heading: {
        ...formState.heading,
        [lang]: val,
      },
    });
  };

  const handleConfigChange = <K extends keyof SectionConfig>(key: K, val: SectionConfig[K]) => {
    setFormState({
      ...formState,
      config: {
        ...formState.config,
        [key]: val,
      },
    });
  };

  // Helper to compile flat category options
  const flatten_categories = (
    nodes: CategoryTreeNode[],
    depth = 0,
  ): Array<{ id: string; label: string }> => {
    return nodes.flatMap((node) => [
      { id: node.id, label: `${"—".repeat(depth)} ${node.name}`.trim() },
      ...flatten_categories(node.children ?? [], depth + 1),
    ]);
  };
  const category_options = categoriesTree ? flatten_categories(categoriesTree) : [];

  return (
    <QueryGuard>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>{t("sections_title")}</CardTitle>
          <p className="text-muted-foreground text-sm">
            {t("sections_subtitle")}
          </p>
        </div>
        <Button
          onClick={handleOpenNew}
          className="bg-[#c8d152] text-[#4d4c20] hover:bg-[#c8d152]/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("add_section")}
        </Button>
      </CardHeader>
      <CardContent>
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
            <LayoutGrid className="text-muted-foreground mb-4 h-10 w-10" />
            <p className="text-muted-foreground font-semibold">{t("no_sections")}</p>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs">
              {t("no_sections_description")}
            </p>
            <Button variant="outline" className="mt-4" onClick={handleOpenNew}>
              {t("create_first_section")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sections
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((section) => (
                <div
                  key={section.id}
                  className="hover:bg-muted/30 bg-card flex items-center justify-between rounded-lg border p-4 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-secondary text-secondary-foreground flex h-9 w-9 items-center justify-center rounded-lg">
                      <LayoutGrid className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">
                        {section.heading?.fr || t("section_untitled")}
                      </h4>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {section.section_type}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-[#f9f7be]/60 text-[10px] text-[#4d4c20]"
                        >
                          {t("page_badge", { slug: section.page_slug })}
                        </Badge>
                        <Badge
                          variant={section.is_active ? "default" : "outline"}
                          className="text-[10px]"
                        >
                          {section.is_active ? t("status_active_label") : t("status_inactive_label")}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                      <ArrowUpDown className="h-3 w-3" />
                      {t("order_display", { order: section.sort_order })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(section)}>
                        <Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(section.id)}>
                        <Trash className="text-destructive hover:text-destructive/90 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedSection ? t("edit_section_dialog") : t("add_section_dialog")}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div className="grid gap-4 md:grid-cols-3">
                <Field className="md:col-span-2">
                  <FieldLabel>{t("section_type_label")}</FieldLabel>
                  <select
                    className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none"
                    value={formState.section_type}
                    onChange={(e) => setFormState({ ...formState, section_type: e.target.value })}
                  >
                    <option value={SECTION_TYPE.product_grid}>{t("section_type_product_grid")}</option>
                    <option value={SECTION_TYPE.product_carousel}>{t("section_type_product_carousel")}</option>
                    <option value={SECTION_TYPE.category_showcase}>{t("section_type_category_showcase")}</option>
                    <option value={SECTION_TYPE.brand_showcase}>{t("section_type_brand_showcase")}</option>
                    <option value={SECTION_TYPE.banner_row}>{t("section_type_banner_row")}</option>
                    <option value={SECTION_TYPE.countdown}>{t("section_type_countdown")}</option>
                    <option value={SECTION_TYPE.text_block}>{t("section_type_text_block")}</option>
                    <option value={SECTION_TYPE.video}>{t("section_type_video")}</option>
                  </select>
                </Field>

                <Field>
                  <FieldLabel>{t("page_slug_label")}</FieldLabel>
                  <Input
                    value={formState.page_slug}
                    onChange={(e) => setFormState({ ...formState, page_slug: e.target.value })}
                    placeholder={t("section_page_slug_placeholder")}
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>{t("sort_order_label")}</FieldLabel>
                  <Input
                    type="number"
                    value={formState.sort_order}
                    onChange={(e) =>
                      setFormState({ ...formState, sort_order: Number(e.target.value) })
                    }
                  />
                </Field>

                <Field>
                  <FieldLabel>{t("active_status_label")}</FieldLabel>
                  <select
                    className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none"
                    value={formState.is_active ? "true" : "false"}
                    onChange={(e) =>
                      setFormState({ ...formState, is_active: e.target.value === "true" })
                    }
                  >
                    <option value="true">{t("status_active_label")}</option>
                    <option value="false">{t("status_inactive_label")}</option>
                  </select>
                </Field>
              </div>

              {/* Title Input tabs */}
              <div className="space-y-2">
                <FieldLabel className="text-sm font-semibold">
                  {t("section_heading_label")}
                </FieldLabel>
                <Tabs defaultValue="fr" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="fr">{t("locale_fr")}</TabsTrigger>
                    <TabsTrigger value="en">{t("locale_en")}</TabsTrigger>
                    <TabsTrigger value="ar">{t("locale_ar")}</TabsTrigger>
                  </TabsList>
                  {(["fr", "en", "ar"] as const).map((lang) => (
                    <TabsContent key={lang} value={lang} className="pt-2">
                      <Input
                        value={formState.heading?.[lang] ?? ""}
                        onChange={(e) => handleHeadingChange(lang, e.target.value)}
                        placeholder={t("section_heading_placeholder", { lang })}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              {/* Dynamic configurations based on section type */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="mb-2 text-sm font-semibold">
                  {t("section_config_label")}
                </h4>

                {(formState.section_type === "product_grid" ||
                  formState.section_type === "product_carousel") && (
                  <div className="space-y-4">
                    <Field>
                      <FieldLabel>{t("select_products")}</FieldLabel>
                      <div className="bg-background max-h-[140px] space-y-1 overflow-y-auto rounded-md border p-2">
                        {!products?.items || products.items.length === 0 ? (
                          <p className="text-muted-foreground p-1 text-xs">{t("no_products_found")}</p>
                        ) : (
                          products.items.map((prod) => {
                            const selected =
                              formState.config?.product_ids?.includes(prod.id) ?? false;
                            return (
                              <label
                                key={prod.id}
                                className="hover:bg-muted/40 flex cursor-pointer items-center gap-2 rounded p-1 text-xs"
                              >
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => {
                                    const curr = formState.config?.product_ids ?? [];
                                    const next = selected
                                      ? curr.filter((id: string) => id !== prod.id)
                                      : [...curr, prod.id];
                                    handleConfigChange("product_ids", next);
                                  }}
                                  className="rounded text-[#c8d152]"
                                />
                                <span>{prod.name}</span>
                              </label>
                            );
                          })
                        )}
                      </div>
                    </Field>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field>
                        <FieldLabel>{t("filter_by_category")}</FieldLabel>
                        <select
                          className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none"
                          value={formState.config?.category_id ?? ""}
                          onChange={(e) => handleConfigChange("category_id", e.target.value)}
                        >
                          <option value="">{t("all_categories")}</option>
                          {category_options.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field>
                        <FieldLabel>{t("max_display_limit")}</FieldLabel>
                        <Input
                          type="number"
                          value={formState.config?.limit ?? 8}
                          onChange={(e) => handleConfigChange("limit", Number(e.target.value))}
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {formState.section_type === "category_showcase" && (
                  <Field>
                    <FieldLabel>{t("target_category")}</FieldLabel>
                    <select
                      className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none"
                      value={formState.config?.category_id ?? ""}
                      onChange={(e) => handleConfigChange("category_id", e.target.value)}
                    >
                      <option value="">{t("select_category")}</option>
                      {category_options.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}

                {formState.section_type === "brand_showcase" && (
                  <Field>
                    <FieldLabel>{t("target_brand")}</FieldLabel>
                    <select
                      className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none"
                      value={formState.config?.brand_id ?? ""}
                      onChange={(e) => handleConfigChange("brand_id", e.target.value)}
                    >
                      <option value="">{t("select_brand")}</option>
                      {activeBrands?.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}

                {formState.section_type === "countdown" && (
                  <Field>
                    <FieldLabel>{t("countdown_end_label")}</FieldLabel>
                    <Input
                      type="datetime-local"
                      value={
                        formState.config?.countdown_end
                          ? formState.config.countdown_end.slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        handleConfigChange(
                          "countdown_end",
                          e.target.value ? new Date(e.target.value).toISOString() : "",
                        )
                      }
                    />
                  </Field>
                )}

                {formState.section_type === "video" && (
                  <Field>
                    <FieldLabel>{t("video_url_label")}</FieldLabel>
                    <Input
                      value={formState.config?.video_url ?? ""}
                      onChange={(e) => handleConfigChange("video_url", e.target.value)}
                      placeholder={t("section_video_placeholder")}
                    />
                  </Field>
                )}
              </div>

              <DialogFooter className="border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button type="submit" className="bg-[#c8d152] text-[#4d4c20] hover:bg-[#c8d152]/90">
                  {selectedSection ? t("save") : t("create")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
    </QueryGuard>
  );
}
