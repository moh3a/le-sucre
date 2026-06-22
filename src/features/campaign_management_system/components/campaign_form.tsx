"use client";

import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaPickerDialog } from "@/features/media_library/components/media-picker-dialog";
import {
  CAMPAIGN_TYPE,
  CAMPAIGN_STATUS,
} from "@/features/campaign_management_system/constants/campaign_types";
import { slugify } from "@/lib/utils";
import { full_campaign_dto } from "../models/campaign.dto";
import { QueryGuard } from "@/components/query-guard";
import { CategoryTreeNode } from "@/features/product_information_management/categories/types";
import type { MediaDTO } from "@/features/media_library/types";

// Form value schema matching Zod DTO
const form_schema = z.object({
  name: z.string().min(1, "Le nom est requis").max(255),
  slug: z.string().min(1, "Le slug est requis").max(255),
  description: z.string().optional(),
  campaign_type: z.string().min(1, "Le type est requis"),
  status: z.string().min(1, "Le statut est requis"),
  priority: z.number().int().min(1).max(9999),
  starts_at: z.string().optional().or(z.literal("")),
  ends_at: z.string().optional().or(z.literal("")),
  theme: z.object({
    bg_color: z.string().max(32).optional(),
    text_color: z.string().max(32).optional(),
    accent_color: z.string().max(32).optional(),
    overlay_opacity: z.number().min(0).max(1).optional(),
    layout: z.enum(["full_width", "split", "card_grid", "carousel"]).optional(),
    bg_image_url: z.string().max(2048).optional().nullable(),
  }),
  promotion_id: z.string().max(255).optional().nullable(),
  ab_test_group: z.string().max(64).optional().nullable(),
  ab_traffic_split: z.number().int().min(0).max(100).default(100),
  translations: z.array(
    z.object({
      locale: z.enum(["en", "fr", "ar"]),
      title: z.string().max(255).optional().or(z.literal("")),
      subtitle: z.string().max(512).optional().or(z.literal("")),
      cta_label: z.string().max(128).optional().or(z.literal("")),
      cta_url: z.string().optional().or(z.literal("")),
      seo_title: z.string().max(255).optional().or(z.literal("")),
      seo_description: z.string().max(500).optional().or(z.literal("")),
    }),
  ),
  category_ids: z.array(z.string()).default([]),
  brand_ids: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof form_schema>;
type CampaignDto = z.infer<typeof full_campaign_dto>;

type CampaignFormProps = {
  mode: "create" | "edit";
  campaign_id?: string;
  default_values?: CampaignDto;
};

export function CampaignForm({ mode, campaign_id, default_values }: CampaignFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  // Load supporting options
  const { data: promotions } = trpc.promotions.adminList.useQuery({ page: 1, limit: 100 });
  const { data: categoriesTree } = trpc.categories.tree.useQuery();
  const { data: activeBrands } = trpc.brands.active.useQuery();

  const create_mutation = trpc.campaigns.create.useMutation({
    onSuccess: (newCampaign) => {
      toast.success("Campagne créée avec succès");
      utils.campaigns.adminList.invalidate();
      if (newCampaign?.id) router.push(`/console/campaigns/${newCampaign.id}`);
    },
    onError: (err) => {
      toast.error(err.message || "Erreur lors de la création");
    },
  });

  const update_mutation = trpc.campaigns.update.useMutation({
    onSuccess: () => {
      toast.success("Campagne mise à jour");
      utils.campaigns.adminList.invalidate();
      utils.campaigns.byId.invalidate({ id: campaign_id! });
    },
    onError: (err) => {
      toast.error(err.message || "Erreur lors de la mise à jour");
    },
  });

  // Helper to format ISO strings to datetime-local values
  const toLocalDatetime = (isoStr?: string | null) => {
    if (!isoStr) return "";
    try {
      const date = new Date(isoStr);
      // Offset timezone to local
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - offset * 60 * 1000);
      return localDate.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  // Build initial values
  const getInitialValues = (): FormValues => {
    if (!default_values) {
      return {
        name: "",
        slug: "",
        description: "",
        campaign_type: CAMPAIGN_TYPE.homepage,
        status: CAMPAIGN_STATUS.draft,
        priority: 100,
        starts_at: "",
        ends_at: "",
        theme: {
          bg_color: "#ffffff",
          text_color: "#000000",
          accent_color: "#700145",
          overlay_opacity: 0,
          layout: "full_width",
          bg_image_url: null,
        },
        promotion_id: "",
        ab_test_group: "",
        ab_traffic_split: 100,
        translations: [
          {
            locale: "fr",
            title: "",
            subtitle: "",
            cta_label: "",
            cta_url: "",
            seo_title: "",
            seo_description: "",
          },
          {
            locale: "en",
            title: "",
            subtitle: "",
            cta_label: "",
            cta_url: "",
            seo_title: "",
            seo_description: "",
          },
          {
            locale: "ar",
            title: "",
            subtitle: "",
            cta_label: "",
            cta_url: "",
            seo_title: "",
            seo_description: "",
          },
        ],
        category_ids: [],
        brand_ids: [],
      };
    }

    const tMap = new Map((default_values.translations || []).map((t) => [t.locale, t]));
    const translations = ["fr", "en", "ar"].map((loc) => {
      const existing = tMap.get(loc);
      return {
        locale: loc as "en" | "fr" | "ar",
        title: existing?.title ?? "",
        subtitle: existing?.subtitle ?? "",
        cta_label: existing?.cta_label ?? "",
        cta_url: existing?.cta_url ?? "",
        seo_title: existing?.seo_title ?? "",
        seo_description: existing?.seo_description ?? "",
      };
    });

    const category_ids = (default_values.linked_categories || []).map((c) => c.category_id);
    const brand_ids = (default_values.linked_brands || []).map((b) => b.brand_id);

    return {
      name: default_values.name ?? "",
      slug: default_values.slug ?? "",
      description: default_values.description ?? "",
      campaign_type: default_values.campaign_type ?? CAMPAIGN_TYPE.homepage,
      status: default_values.status ?? CAMPAIGN_STATUS.draft,
      priority: default_values.priority ?? 100,
      starts_at: toLocalDatetime(default_values.starts_at),
      ends_at: toLocalDatetime(default_values.ends_at),
      theme: {
        bg_color: default_values.theme?.bg_color ?? "#ffffff",
        text_color: default_values.theme?.text_color ?? "#000000",
        accent_color: default_values.theme?.accent_color ?? "#700145",
        overlay_opacity: default_values.theme?.overlay_opacity ?? 0,
        layout: default_values.theme?.layout ?? "full_width",
        bg_image_url: default_values.theme?.bg_image_url ?? null,
      },
      promotion_id: default_values.promotion_id ?? "",
      ab_test_group: default_values.ab_test_group ?? "",
      ab_traffic_split: default_values.ab_traffic_split ?? 100,
      translations,
      category_ids,
      brand_ids,
    };
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(form_schema),
    defaultValues: getInitialValues(),
  });

  const {
    formState: { errors },
    watch,
    setValue,
  } = form;
  const watchName = watch("name");
  const watchSlug = watch("slug");

  useEffect(() => {
    if (
      mode === "create" &&
      watchName &&
      (!watchSlug || watchSlug === slugify(watchName.slice(0, -1)))
    ) {
      setValue("slug", slugify(watchName), { shouldValidate: true });
    }
  }, [watchName, watchSlug, mode, setValue]);

  // Form submission handler
  const on_submit = async (values: FormValues) => {
    // Map dates to ISO strings with offset
    const starts_at = values.starts_at ? new Date(values.starts_at).toISOString() : undefined;
    const ends_at = values.ends_at ? new Date(values.ends_at).toISOString() : undefined;

    // Filter translations to only include translated content if present, or submit full array
    const translations = values.translations.map((t) => ({
      ...t,
      title: t.title || undefined,
      subtitle: t.subtitle || undefined,
      cta_label: t.cta_label || undefined,
      cta_url: t.cta_url || undefined,
      seo_title: t.seo_title || undefined,
      seo_description: t.seo_description || undefined,
    }));

    const theme = {
      ...values.theme,
      overlay_opacity: values.theme.overlay_opacity ? Number(values.theme.overlay_opacity) : 0,
    };

    const payload = {
      ...values,
      starts_at,
      ends_at,
      theme,
      promotion_id: values.promotion_id || undefined,
      ab_test_group: values.ab_test_group || undefined,
      translations,
    };

    if (mode === "create") {
      await create_mutation.mutateAsync(payload);
    } else {
      if (!campaign_id) return;
      await update_mutation.mutateAsync({
        ...payload,
        id: campaign_id,
      });
    }
  };

  // Helper to flat compile categories tree
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

  const isPending = create_mutation.isPending || update_mutation.isPending;

  return (
    <QueryGuard>
    <form onSubmit={form.handleSubmit(on_submit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: General properties */}
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Configuration de base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <Field data-invalid={!!errors.name}>
                      <FieldLabel>Nom de la campagne</FieldLabel>
                      <Input {...field} placeholder="Ex: Soldes d'été 2026" />
                      {errors.name && <FieldError errors={[errors.name]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="slug"
                  control={form.control}
                  render={({ field }) => (
                    <Field data-invalid={!!errors.slug}>
                      <FieldLabel>Slug</FieldLabel>
                      <Input {...field} placeholder="auto" />
                      {errors.slug && <FieldError errors={[errors.slug]} />}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="description"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Description</FieldLabel>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Description interne de la campagne..."
                      rows={3}
                    />
                  </Field>
                )}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <Controller
                  name="campaign_type"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Type de campagne</FieldLabel>
                      <select
                        className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none"
                        {...field}
                      >
                        <option value={CAMPAIGN_TYPE.homepage}>Page d&apos;accueil</option>
                        <option value={CAMPAIGN_TYPE.seasonal}>Saisonnière</option>
                        <option value={CAMPAIGN_TYPE.flash_sale}>Vente flash</option>
                        <option value={CAMPAIGN_TYPE.targeted}>Ciblée</option>
                        <option value={CAMPAIGN_TYPE.banner}>Bannière simple</option>
                        <option value={CAMPAIGN_TYPE.category}>Catégorie</option>
                        <option value={CAMPAIGN_TYPE.brand}>Marque</option>
                        <option value={CAMPAIGN_TYPE.landing_page}>Landing Page</option>
                      </select>
                    </Field>
                  )}
                />

                <Controller
                  name="status"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Statut</FieldLabel>
                      <select
                        className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none"
                        {...field}
                      >
                        <option value={CAMPAIGN_STATUS.draft}>Brouillon</option>
                        <option value={CAMPAIGN_STATUS.scheduled}>Planifiée</option>
                        <option value={CAMPAIGN_STATUS.active}>Active</option>
                        <option value={CAMPAIGN_STATUS.paused}>En pause</option>
                        <option value={CAMPAIGN_STATUS.ended}>Terminée</option>
                        <option value={CAMPAIGN_STATUS.cancelled}>Annulée</option>
                      </select>
                    </Field>
                  )}
                />

                <Controller
                  name="priority"
                  control={form.control}
                  render={({ field }) => (
                    <Field data-invalid={!!errors.priority}>
                      <FieldLabel>Priorité</FieldLabel>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                      {errors.priority && <FieldError errors={[errors.priority]} />}
                    </Field>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Controller
                  name="starts_at"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Date de début</FieldLabel>
                      <Input type="datetime-local" {...field} />
                    </Field>
                  )}
                />

                <Controller
                  name="ends_at"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Date de fin</FieldLabel>
                      <Input type="datetime-local" {...field} />
                    </Field>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Localization translations */}
          <Card>
            <CardHeader>
              <CardTitle>Textes & Traduction Storefront</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="fr" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="fr">Français</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="ar">العربية (Arabic)</TabsTrigger>
                </TabsList>

                {["fr", "en", "ar"].map((lang, index) => (
                  <TabsContent key={lang} value={lang} className="space-y-4 pt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Controller
                        name={`translations.${index}.title`}
                        control={form.control}
                        render={({ field }) => (
                          <Field>
                            <FieldLabel>Titre affiché ({lang.toUpperCase()})</FieldLabel>
                            <Input {...field} placeholder="Ex: Super Ventes de l'été !" />
                          </Field>
                        )}
                      />

                      <Controller
                        name={`translations.${index}.subtitle`}
                        control={form.control}
                        render={({ field }) => (
                          <Field>
                            <FieldLabel>Sous-titre ({lang.toUpperCase()})</FieldLabel>
                            <Input {...field} placeholder="Ex: Profitez de 50% de réduction..." />
                          </Field>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Controller
                        name={`translations.${index}.cta_label`}
                        control={form.control}
                        render={({ field }) => (
                          <Field>
                            <FieldLabel>Libellé du Bouton (CTA)</FieldLabel>
                            <Input {...field} placeholder="Ex: Acheter maintenant" />
                          </Field>
                        )}
                      />

                      <Controller
                        name={`translations.${index}.cta_url`}
                        control={form.control}
                        render={({ field }) => (
                          <Field>
                            <FieldLabel>URL d&apos;action (CTA)</FieldLabel>
                            <Input {...field} placeholder="/storefront/categories/promotions" />
                          </Field>
                        )}
                      />
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="mb-3 text-sm font-semibold">
                        Référencement SEO ({lang.toUpperCase()})
                      </h4>
                      <div className="space-y-4">
                        <Controller
                          name={`translations.${index}.seo_title`}
                          control={form.control}
                          render={({ field }) => (
                            <Field>
                              <FieldLabel>Titre SEO</FieldLabel>
                              <Input {...field} placeholder="Titre pour les moteurs de recherche" />
                            </Field>
                          )}
                        />

                        <Controller
                          name={`translations.${index}.seo_description`}
                          control={form.control}
                          render={({ field }) => (
                            <Field>
                              <FieldLabel>Description SEO</FieldLabel>
                              <Textarea {...field} placeholder="Méta description" rows={2} />
                            </Field>
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Visual theme & targeting linkage */}
        <div className="space-y-6">
          {/* Design visual theme config */}
          <Card>
            <CardHeader>
              <CardTitle>Thème Visuel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="theme.bg_color"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Arrière-plan</FieldLabel>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          className="h-9 w-9 cursor-pointer rounded-md border"
                          value={field.value || "#ffffff"}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                        <Input className="font-mono text-xs uppercase" {...field} />
                      </div>
                    </Field>
                  )}
                />

                <Controller
                  name="theme.text_color"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Texte</FieldLabel>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          className="h-9 w-9 cursor-pointer rounded-md border"
                          value={field.value || "#000000"}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                        <Input className="font-mono text-xs uppercase" {...field} />
                      </div>
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="theme.accent_color"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Couleur d&apos;accent</FieldLabel>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="h-9 w-9 cursor-pointer rounded-md border"
                        value={field.value || "#700145"}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                      <Input className="font-mono text-xs uppercase" {...field} />
                    </div>
                  </Field>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="theme.overlay_opacity"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Opacité Overlay (0-1)</FieldLabel>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        {...field}
                        value={field.value ?? 0}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </Field>
                  )}
                />

                <Controller
                  name="theme.layout"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Mise en page</FieldLabel>
                      <select
                        className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none"
                        {...field}
                      >
                        <option value="full_width">Pleine largeur</option>
                        <option value="split">Divisée (Split)</option>
                        <option value="card_grid">Grille de cartes</option>
                        <option value="carousel">Carrousel</option>
                      </select>
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="theme.bg_image_url"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Image de fond</FieldLabel>
                    <div className="flex items-center gap-3">
                      <MediaPickerDialog
                        onSelect={(media) => field.onChange(media.url)}
                        trigger={
                          field.value ? (
                            <div className="group relative inline-flex cursor-pointer overflow-hidden rounded-lg border">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={field.value}
                                alt="Fond"
                                className="h-20 w-32 object-cover transition-opacity group-hover:opacity-75"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                                <span className="text-white text-xs opacity-0 transition-opacity group-hover:opacity-100">
                                  Changer
                                </span>
                              </div>
                            </div>
                          ) : (
                            <Button type="button" variant="outline" className="h-20 w-32">
                              <span className="text-xs">Choisir</span>
                            </Button>
                          )
                        }
                      />
                      {field.value && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => field.onChange(null)}
                        >
                          Effacer
                        </Button>
                      )}
                    </div>
                  </Field>
                )}
              />
            </CardContent>
          </Card>

          {/* Linking promotions, categories, and brands */}
          <Card>
            <CardHeader>
              <CardTitle>Liens de Campagne</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Controller
                name="promotion_id"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Promotion Liée</FieldLabel>
                    <select
                      className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    >
                      <option value="">Aucune promotion</option>
                      {promotions?.items?.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (
                          {p.discount_type === "percentage"
                            ? `-${p.discount_value}%`
                            : `-${p.discount_value} DZD`}
                          )
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
              />

              {/* Category Linkage */}
              <Controller
                name="category_ids"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Catégories Associées</FieldLabel>
                    <div className="bg-background max-h-[140px] space-y-1 overflow-y-auto rounded-md border p-2">
                      {category_options.length === 0 ? (
                        <p className="text-muted-foreground p-1 text-xs">
                          Aucune catégorie disponible
                        </p>
                      ) : (
                        category_options.map((opt) => {
                          const checked = field.value.includes(opt.id);
                          return (
                            <label
                              key={opt.id}
                              className="hover:bg-muted/40 flex cursor-pointer items-center gap-2 rounded p-1 text-xs"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  if (checked) {
                                    field.onChange(field.value.filter((id) => id !== opt.id));
                                  } else {
                                    field.onChange([...field.value, opt.id]);
                                  }
                                }}
                                className="border-input rounded text-[#c8d152]"
                              />
                              <span className="truncate">{opt.label}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </Field>
                )}
              />

              {/* Brand Linkage */}
              <Controller
                name="brand_ids"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Marques Associées</FieldLabel>
                    <div className="bg-background max-h-[140px] space-y-1 overflow-y-auto rounded-md border p-2">
                      {!activeBrands || activeBrands.length === 0 ? (
                        <p className="text-muted-foreground p-1 text-xs">
                          Aucune marque disponible
                        </p>
                      ) : (
                        activeBrands.map((brand) => {
                          const checked = field.value.includes(brand.id);
                          return (
                            <label
                              key={brand.id}
                              className="hover:bg-muted/40 flex cursor-pointer items-center gap-2 rounded p-1 text-xs"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  if (checked) {
                                    field.onChange(field.value.filter((id) => id !== brand.id));
                                  } else {
                                    field.onChange([...field.value, brand.id]);
                                  }
                                }}
                                className="border-input rounded text-[#c8d152]"
                              />
                              <span>{brand.name}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </Field>
                )}
              />
            </CardContent>
          </Card>

          {/* A/B Testing details */}
          <Card>
            <CardHeader>
              <CardTitle>Test A/B</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="ab_test_group"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Groupe de test</FieldLabel>
                      <Input {...field} value={field.value ?? ""} placeholder="Ex: test_ete_2026" />
                    </Field>
                  )}
                />

                <Controller
                  name="ab_traffic_split"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Split de trafic (%)</FieldLabel>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </Field>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/console/campaigns")}
          disabled={isPending}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          className="bg-[#c8d152] text-[#4d4c20] hover:bg-[#c8d152]/90"
          disabled={isPending}
        >
          {isPending ? "Enregistrement..." : "Enregistrer la campagne"}
        </Button>
      </div>
    </form>
    </QueryGuard>
  );
}
