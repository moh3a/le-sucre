"use client";

import { useTranslations } from "next-intl";
import {
  Plus,
  Trash,
  Pencil,
  ShieldAlert,
  Monitor,
  Phone,
  Layers,
  Image as ImageIcon,
  ImagePlus,
  Video,
} from "lucide-react";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";

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
import { MediaPickerDialog } from "@/features/media_library/components/media-picker-dialog";
import { BANNER_TYPE, CAMPAIGN_PLACEMENT_PAGES } from "../constants/campaign_types";
import { banner_schema } from "../models/campaign.dto";
import { DeviceTarget } from "../types";

export type BannerRow = z.infer<typeof banner_schema> & {
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
  const t = useTranslations("campaigns");
  const utils = trpc.useUtils();
  const [selectedBanner, setSelectedBanner] = useState<BannerRow | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Mutations
  const add_banner = trpc.campaigns.addBanner.useMutation({
    onSuccess: () => {
      toast.success(t("banner_added"));
      utils.campaigns.byId.invalidate({ id: campaign_id });
      setIsOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const update_banner = trpc.campaigns.updateBanner.useMutation({
    onSuccess: () => {
      toast.success(t("banner_updated"));
      utils.campaigns.byId.invalidate({ id: campaign_id });
      setIsOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const delete_banner = trpc.campaigns.deleteBanner.useMutation({
    onSuccess: () => {
      toast.success(t("banner_deleted"));
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
    if (confirm(t("confirm_delete_banner"))) {
      await delete_banner.mutateAsync({ id });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.image_url && !formState.video_url) {
      toast.error(t("banner_image_video_required"));
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
    <QueryGuard>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>{t("banners_title")}</CardTitle>
          <p className="text-muted-foreground text-sm">
            {t("banners_subtitle")}
          </p>
        </div>
        <Button
          onClick={handleOpenNew}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("add_banner")}
        </Button>
      </CardHeader>
      <CardContent>
        {banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
            <ImageIcon className="text-muted-foreground mb-4 h-10 w-10" />
            <p className="text-muted-foreground font-semibold">{t("no_banners")}</p>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs">
              {t("no_banners_description")}
            </p>
            <Button variant="outline" className="mt-4" onClick={handleOpenNew}>
              {t("create_first_banner")}
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
                        alt={banner.alt_text || t("no_title")}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground flex flex-col items-center p-4 text-xs">
                        <ShieldAlert className="mb-1 h-6 w-6" />
                        <span>{t("no_image_video")}</span>
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
                        {banner.is_active ? t("status_active_label") : t("status_inactive_label")}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-between space-y-2 p-4">
                    <div>
                      <h4 className="truncate text-sm font-semibold">
                        {banner.overlay_content?.fr?.headline || banner.alt_text || t("no_title")}
                      </h4>
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                        {banner.overlay_content?.fr?.body || t("no_description")}
                      </p>
                      <div className="text-muted-foreground mt-3 flex items-center gap-4 border-t pt-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          <span>{t("order_label", { order: banner.sort_order })}</span>
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
                {selectedBanner ? t("edit_banner") : t("add_banner")}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>{t("banner_type_label")}</FieldLabel>
                  <select
                    className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none"
                    value={formState.banner_type}
                    onChange={(e) => setFormState({ ...formState, banner_type: e.target.value })}
                  >
                    <option value={BANNER_TYPE.hero}>{t("banner_type_hero")}</option>
                    <option value={BANNER_TYPE.sidebar}>{t("banner_type_sidebar")}</option>
                    <option value={BANNER_TYPE.popup}>{t("banner_type_popup")}</option>
                    <option value={BANNER_TYPE.inline}>{t("banner_type_inline")}</option>
                    <option value={BANNER_TYPE.countdown_bar}>{t("banner_type_countdown_bar")}</option>
                    <option value={BANNER_TYPE.notification_bar}>{t("banner_type_notification_bar")}</option>
                  </select>
                </Field>

                <Field>
                  <FieldLabel>{t("device_target_label")}</FieldLabel>
                  <select
                    className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none"
                    value={formState.device_target}
                    onChange={(e) =>
                      setFormState({ ...formState, device_target: e.target.value as DeviceTarget })
                    }
                  >
                    <option value="both">{t("device_all")}</option>
                    <option value="desktop">{t("device_desktop")}</option>
                    <option value="mobile">{t("device_mobile")}</option>
                  </select>
                </Field>
              </div>

              <div className="space-y-3">
                <Field>
                  <FieldLabel>{t("desktop_image_label")}</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      value={formState.image_url}
                      onChange={(e) => setFormState({ ...formState, image_url: e.target.value })}
                      placeholder={t("banner_image_desktop_placeholder")}
                      className="flex-1"
                    />
                    <MediaPickerDialog
                      onSelect={(media) =>
                        setFormState({ ...formState, image_url: media.url })
                      }
                      trigger={
                        <Button type="button" variant="outline" size="icon" title={t("choose_from_media")}>
                          <ImagePlus className="size-4" />
                        </Button>
                      }
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel>{t("mobile_image_label")}</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      value={formState.mobile_image_url}
                      onChange={(e) =>
                        setFormState({ ...formState, mobile_image_url: e.target.value })
                      }
                      placeholder={t("banner_image_mobile_placeholder")}
                      className="flex-1"
                    />
                    <MediaPickerDialog
                      onSelect={(media) =>
                        setFormState({ ...formState, mobile_image_url: media.url })
                      }
                      trigger={
                        <Button type="button" variant="outline" size="icon" title={t("choose_from_media")}>
                          <ImagePlus className="size-4" />
                        </Button>
                      }
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel>{t("video_label")}</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      value={formState.video_url}
                      onChange={(e) => setFormState({ ...formState, video_url: e.target.value })}
                      placeholder={t("banner_video_placeholder")}
                      className="flex-1"
                    />
                    <MediaPickerDialog
                      onSelect={(media) =>
                        setFormState({ ...formState, video_url: media.url })
                      }
                      allowed_types={["video"]}
                      trigger={
                        <Button type="button" variant="outline" size="icon" title={t("choose_from_media")}>
                          <Video className="size-4" />
                        </Button>
                      }
                    />
                  </div>
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>{t("alt_text_label")}</FieldLabel>
                  <Input
                    value={formState.alt_text}
                    onChange={(e) => setFormState({ ...formState, alt_text: e.target.value })}
                    placeholder={t("banner_alt_text_placeholder")}
                  />
                </Field>

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
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Field>
                  <FieldLabel>{t("link_url_label")}</FieldLabel>
                  <Input
                    value={formState.link_url}
                    onChange={(e) => setFormState({ ...formState, link_url: e.target.value })}
                    placeholder={t("banner_link_url_placeholder")}
                  />
                </Field>

                <Field>
                  <FieldLabel>{t("link_target_label")}</FieldLabel>
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
                    <option value="_self">{t("link_target_self")}</option>
                    <option value="_blank">{t("link_target_blank")}</option>
                  </select>
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

              {/* Placement settings */}
              <Field>
                <FieldLabel>{t("banner_placement_label")}</FieldLabel>
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
                          className="rounded text-primary"
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
                  {t("overlay_content_label")}
                </FieldLabel>
                <Tabs defaultValue="fr" className="mt-2 w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="fr">{t("locale_fr")}</TabsTrigger>
                    <TabsTrigger value="en">{t("locale_en")}</TabsTrigger>
                    <TabsTrigger value="ar">{t("locale_ar")}</TabsTrigger>
                  </TabsList>

                  {(["fr", "en", "ar"] as const).map((lang) => (
                    <TabsContent key={lang} value={lang} className="space-y-3 pt-2">
                      <div className="grid gap-3 md:grid-cols-2">
                        <Field>
                          <FieldLabel>{t("overlay_headline", { lang: lang.toUpperCase() })}</FieldLabel>
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
                            placeholder={t("banner_overlay_headline_placeholder")}
                          />
                        </Field>

                        <Field>
                          <FieldLabel>{t("overlay_body", { lang: lang.toUpperCase() })}</FieldLabel>
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
                            placeholder={t("banner_overlay_body_placeholder")}
                          />
                        </Field>
                      </div>

                      <Field>
                        <FieldLabel>{t("overlay_cta_label", { lang: lang.toUpperCase() })}</FieldLabel>
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
                          placeholder={t("banner_overlay_cta_placeholder")}
                        />
                      </Field>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              <DialogFooter className="border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {selectedBanner ? t("save") : t("create")}
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
