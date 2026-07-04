"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { CookieConsent, CookieCategory } from "@/hooks/use-cookie-consent";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consent: CookieConsent;
  onSave: (categories: Record<CookieCategory, boolean>) => void;
};

const categories: Array<{
  key: CookieCategory;
  required?: boolean;
  titleKey: string;
  descKey: string;
}> = [
  {
    key: "necessary",
    required: true,
    titleKey: "category_necessary",
    descKey: "category_necessary_desc",
  },
  {
    key: "analytics",
    titleKey: "category_analytics",
    descKey: "category_analytics_desc",
  },
  {
    key: "marketing",
    titleKey: "category_marketing",
    descKey: "category_marketing_desc",
  },
];

export function CookiePreferencesDialog({
  open,
  onOpenChange,
  consent,
  onSave,
}: Props) {
  const t = useTranslations("cookie_consent");
  const [prefs, setPrefs] = useState<Record<CookieCategory, boolean>>({
    ...consent.categories,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("preferences_title")}</DialogTitle>
          <DialogDescription>{t("preferences_description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {categories.map((cat) => (
            <div
              key={cat.key}
              className="flex items-start justify-between gap-4 rounded-lg border p-4"
            >
              <div className="space-y-1">
                <Label htmlFor={`cookie-${cat.key}`} className="font-medium">
                  {t(cat.titleKey)}
                </Label>
                <p className="text-muted-foreground text-sm">
                  {t(cat.descKey)}
                </p>
              </div>
              <Switch
                id={`cookie-${cat.key}`}
                checked={prefs[cat.key]}
                disabled={cat.required}
                onCheckedChange={(checked) =>
                  setPrefs((prev) => ({ ...prev, [cat.key]: checked }))
                }
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            onClick={() => {
              onSave(prefs);
              onOpenChange(false);
            }}
          >
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
