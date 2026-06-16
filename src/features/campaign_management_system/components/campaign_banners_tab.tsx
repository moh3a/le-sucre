"use client";

import {
  Plus,
  Trash,
  Pencil,
  ShieldAlert,
  Monitor,
  Phone,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";

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
import { BANNER_TYPE, CAMPAIGN_PLACEMENT_PAGES } from "../constants/campaign_types";
import { banner_schema } from "../models/campaign.dto";
import { DeviceTarget } from "../types";

type BannerRow = z.infer<typeof banner_schema> & {
  id: string;
  campaign_id: string;
};

type BannersTabProps = {
  campaign_id: string;
  banners: BannerRow[];
};

type BannerFormState = {
  banner_type: string;
  device_target: DeviceTarget;
  image_url: string;
  mobile_image_url: string;
  video_url: string;
  link_url: string;
  link_target: "_self" | "_blank";
  alt_text: string;
  sort_order: number;
  is_active: boolean;
  placement: string[];
  overlay_content?: {
    fr?: { headline?: string; body?: string; cta?: string };
    en?: { headline?: string; body?: string; cta?: string };
    ar?: { headline?: string; body?: string; cta?: string };
  };
};

export function CampaignBannersTab({ campaign_id, banners }: BannersTabProps) {
  const utils = trpc.useUtils();
  const [selectedBanner, setSelectedBanner] = useState<BannerRow | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Mutations
  const add_banner = trpc.campaigns.addBanner.useMutation({
    onSuccess: () => {
      toast.success("Bannière ajoutée");
      utils.campaigns.byId.invalidate({ id: campaign_id });
      setIsOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const update_banner = trpc.campaigns.updateBanner.useMutation({
    onSuccess: () => {
      toast.success("Bannière mise à jour");
      utils.campaigns.byId.invalidate({ id: campaign_id });
      setIsOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const delete_banner = trpc.campaigns.deleteBanner.useMutation({
    onSuccess: () => {
      toast.success("Bannière supprimée");
      utils.campaigns.byId.invalidate({ id: campaign_id });
    },
    onError: (err) => toast.error(err.message),
  });

  const [formState, setFormState] = useState<BannerFormState>({
    banner_type: "hero",
    device_target: "both",
    image_url: "",
    mobile_image_url: "",
    video_url: "",
    link_url: "",
    link_target: "_self",
    alt_text: "",
    sort_order: 0,
    is_active: true,
    placement: ["home"],
    overlay_content: {
      fr: { headline: "", body: "", cta: "" },
      en: { headline: "", body: "", cta: "" },
      ar: { headline: "", body: "", cta: "" },
    },
  });

  const handleOpenNew = () => {
    setSelectedBanner(null);
    setFormState({
      banner_type: "hero",
      device_target: "both",
      image_url: "",
      mobile_image_url: "",
      video_url: "",
      link_url: "",
      link_target: "_self",
      alt_text: "",
      sort_order: banners.length,
      is_active: true,
      placement: ["home"],
      overlay_content: {
        fr: { headline: "", body: "", cta: "" },
        en: { headline: "", body: "", cta: "" },
        ar: { headline: "", body: "", cta: "" },
      },
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (banner: BannerRow) => {
    setSelectedBanner(banner);
    setFormState({
      banner_type: banner.banner_type ?? "hero",
      device_target: (banner.device_target as DeviceTarget) ?? "both",
      image_url: banner.image_url ?? "",
      mobile_image_url: banner.mobile_image_url ?? "",
      video_url: banner.video_url ?? "",
      link_url: banner.link_url ?? "",
      link_target: (banner.link_target as "_self" | "_blank") ?? "_self",
      alt_text: banner.alt_text ?? "",
      sort_order: banner.sort_order ?? 0,
      is_active: !!banner.is_active,
      placement: Array.isArray(banner.placement) ? banner.placement : ["home"],
      overlay_content: banner.overlay_content ?? {
        fr: { headline: "", body: "", cta: "" },
        en: { headline: "", body: "", cta: "" },
        ar: { headline: "", body: "", cta: "" },
      },
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer cette bannière ?")) {
      await delete_banner.mutateAsync({ id });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.image_url && !formState.video_url) {
      toast.error("Veuillez renseigner une image URL ou une vidéo URL");
      return;
    }

    if (selectedBanner) {
      await update_banner.mutateAsync({
        ...formState,
        id: selectedBanner.id,
      });
    } else {
      await add_banner.mutateAsync({
        ...formState,
        campaign_id,
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Bannières Marketing</CardTitle>
          <p className="text-muted-foreground text-sm">
            Bannières visuelles affichées sur les pages storefront de la campagne.
          </p>
        </div>
        <Button
          onClick={handleOpenNew}
          className="bg-[#c8d152] text-[#4d4c20] hover:bg-[#c8d152]/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une bannière
        </Button>
      </CardHeader>
      <CardContent>
        {banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
            <ImageIcon className="text-muted-foreground mb-4 h-10 w-10" />
            <p className="text-muted-foreground font-semibold">Aucune bannière configurée</p>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs">
              Les bannières affichent des images promotionnelles accrocheuses, des messages et des
              boutons CTA.
            </p>
            <Button variant="outline" className="mt-4" onClick={handleOpenNew}>
              Créer la première bannière
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {banners
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((banner) => (
                <Card
                  key={banner.id}
                  className="flex flex-col justify-between overflow-hidden border"
                >
                  <div className="bg-muted relative flex aspect-video items-center justify-center">
                    {banner.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={banner.image_url}
                        alt={banner.alt_text || "Bannière"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground flex flex-col items-center p-4 text-xs">
                        <ShieldAlert className="mb-1 h-6 w-6" />
                        <span>Pas d&apos;image (vidéo uniquement)</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge variant="secondary" className="text-[10px]">
                        {banner.banner_type}
                      </Badge>
                      <Badge
                        variant={banner.is_active ? "default" : "outline"}
                        className="text-[10px]"
                      >
                        {banner.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-between space-y-2 p-4">
                    <div>
                      <h4 className="truncate text-sm font-semibold">
                        {banner.overlay_content?.fr?.headline || banner.alt_text || "Sans titre"}
                      </h4>
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                        {banner.overlay_content?.fr?.body || "Pas de description."}
                      </p>
                      <div className="text-muted-foreground mt-3 flex items-center gap-4 border-t pt-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          <span>Ordre: {banner.sort_order}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {banner.device_target === "desktop" && <Monitor className="h-3 w-3" />}
                          {banner.device_target === "mobile" && <Phone className="h-3 w-3" />}
                          {banner.device_target === "both" && (
                            <>
                              <Monitor className="h-3 w-3" />
                              <Phone className="h-3 w-3" />
                            </>
                          )}
                          <span className="capitalize">{banner.device_target}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2 border-t pt-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(banner)}>
                        <Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id)}>
                        <Trash className="text-destructive hover:text-destructive/90 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedBanner ? "Modifier la bannière" : "Ajouter une bannière"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Type de bannière</FieldLabel>
                  <select
                    className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none"
                    value={formState.banner_type}
                    onChange={(e) => setFormState({ ...formState, banner_type: e.target.value })}
                  >
                    <option value={BANNER_TYPE.hero}>Hero (Grand en-tête)</option>
                    <option value={BANNER_TYPE.sidebar}>Barre latérale</option>
                    <option value={BANNER_TYPE.popup}>Pop-up modal</option>
                    <option value={BANNER_TYPE.inline}>Bannière en ligne</option>
                    <option value={BANNER_TYPE.countdown_bar}>Barre compte à rebours</option>
                    <option value={BANNER_TYPE.notification_bar}>Barre de notification</option>
                  </select>
                </Field>

                <Field>
                  <FieldLabel>Cible appareil</FieldLabel>
                  <select
                    className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none"
                    value={formState.device_target}
                    onChange={(e) =>
                      setFormState({ ...formState, device_target: e.target.value as DeviceTarget })
                    }
                  >
                    <option value="both">Tous les appareils</option>
                    <option value="desktop">Ordinateurs uniquement</option>
                    <option value="mobile">Mobiles uniquement</option>
                  </select>
                </Field>
              </div>

              <div className="space-y-3">
                <Field>
                  <FieldLabel>Image URL (Desktop / Principal)</FieldLabel>
                  <Input
                    value={formState.image_url}
                    onChange={(e) => setFormState({ ...formState, image_url: e.target.value })}
                    placeholder="https://example.com/images/banner.jpg"
                  />
                </Field>

                <Field>
                  <FieldLabel>Image URL (Mobile)</FieldLabel>
                  <Input
                    value={formState.mobile_image_url}
                    onChange={(e) =>
                      setFormState({ ...formState, mobile_image_url: e.target.value })
                    }
                    placeholder="https://example.com/images/banner-mobile.jpg (facultatif)"
                  />
                </Field>

                <Field>
                  <FieldLabel>Vidéo URL</FieldLabel>
                  <Input
                    value={formState.video_url}
                    onChange={(e) => setFormState({ ...formState, video_url: e.target.value })}
                    placeholder="https://example.com/videos/banner.mp4 (facultatif)"
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Texte alternatif (SEO / Accessibilité)</FieldLabel>
                  <Input
                    value={formState.alt_text}
                    onChange={(e) => setFormState({ ...formState, alt_text: e.target.value })}
                    placeholder="Ex: Collection été homme"
                  />
                </Field>

                <Field>
                  <FieldLabel>Ordre d&apos;affichage</FieldLabel>
                  <Input
                    type="number"
                    value={formState.sort_order}
                    onChange={(e) =>
                      setFormState({ ...formState, sort_order: Number(e.target.value) })
                    }
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Field>
                  <FieldLabel>Lien URL</FieldLabel>
                  <Input
                    value={formState.link_url}
                    onChange={(e) => setFormState({ ...formState, link_url: e.target.value })}
                    placeholder="/storefront/products/xyz"
                  />
                </Field>

                <Field>
                  <FieldLabel>Cible du lien</FieldLabel>
                  <select
                    className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none"
                    value={formState.link_target}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        link_target: e.target.value as "_self" | "_blank",
                      })
                    }
                  >
                    <option value="_self">Même onglet (_self)</option>
                    <option value="_blank">Nouvel onglet (_blank)</option>
                  </select>
                </Field>

                <Field>
                  <FieldLabel>Statut actif</FieldLabel>
                  <select
                    className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none"
                    value={formState.is_active ? "true" : "false"}
                    onChange={(e) =>
                      setFormState({ ...formState, is_active: e.target.value === "true" })
                    }
                  >
                    <option value="true">Actif</option>
                    <option value="false">Inactif</option>
                  </select>
                </Field>
              </div>

              {/* Placement settings */}
              <Field>
                <FieldLabel>Emplacement sur le Storefront</FieldLabel>
                <div className="bg-background mt-1 flex flex-wrap gap-3 rounded-md border p-2">
                  {CAMPAIGN_PLACEMENT_PAGES.map((page) => {
                    const checked = formState.placement.includes(page);
                    return (
                      <label
                        key={page}
                        className="flex cursor-pointer items-center gap-1.5 text-xs font-medium"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const newPlacement = checked
                              ? formState.placement.filter((p: string) => p !== page)
                              : [...formState.placement, page];
                            setFormState({ ...formState, placement: newPlacement });
                          }}
                          className="rounded text-[#c8d152]"
                        />
                        <span className="capitalize">{page}</span>
                      </label>
                    );
                  })}
                </div>
              </Field>

              {/* Text overlays */}
              <div className="border-t pt-4">
                <FieldLabel className="text-sm font-bold">
                  Textes superposés (Overlay Content)
                </FieldLabel>
                <Tabs defaultValue="fr" className="mt-2 w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="fr">Français</TabsTrigger>
                    <TabsTrigger value="en">English</TabsTrigger>
                    <TabsTrigger value="ar">العربية</TabsTrigger>
                  </TabsList>

                  {(["fr", "en", "ar"] as const).map((lang) => (
                    <TabsContent key={lang} value={lang} className="space-y-3 pt-2">
                      <div className="grid gap-3 md:grid-cols-2">
                        <Field>
                          <FieldLabel>Titre Principal ({lang.toUpperCase()})</FieldLabel>
                          <Input
                            value={formState.overlay_content?.[lang]?.headline ?? ""}
                            onChange={(e) => {
                              const existing = formState.overlay_content ?? {};
                              setFormState({
                                ...formState,
                                overlay_content: {
                                  ...existing,
                                  [lang]: { ...(existing[lang] ?? {}), headline: e.target.value },
                                },
                              });
                            }}
                            placeholder="Titre superposé sur la bannière"
                          />
                        </Field>

                        <Field>
                          <FieldLabel>Description / Corps ({lang.toUpperCase()})</FieldLabel>
                          <Input
                            value={formState.overlay_content?.[lang]?.body ?? ""}
                            onChange={(e) => {
                              const existing = formState.overlay_content ?? {};
                              setFormState({
                                ...formState,
                                overlay_content: {
                                  ...existing,
                                  [lang]: { ...(existing[lang] ?? {}), body: e.target.value },
                                },
                              });
                            }}
                            placeholder="Description superposée"
                          />
                        </Field>
                      </div>

                      <Field>
                        <FieldLabel>Label Bouton / CTA ({lang.toUpperCase()})</FieldLabel>
                        <Input
                          value={formState.overlay_content?.[lang]?.cta ?? ""}
                          onChange={(e) => {
                            const existing = formState.overlay_content ?? {};
                            setFormState({
                              ...formState,
                              overlay_content: {
                                ...existing,
                                [lang]: { ...(existing[lang] ?? {}), cta: e.target.value },
                              },
                            });
                          }}
                          placeholder="Ex: Acheter"
                        />
                      </Field>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              <DialogFooter className="border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-[#c8d152] text-[#4d4c20] hover:bg-[#c8d152]/90">
                  {selectedBanner ? "Sauvegarder" : "Créer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
