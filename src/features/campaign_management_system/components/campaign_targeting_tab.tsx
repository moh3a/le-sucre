"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Plus, Trash, ShieldCheck, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { TARGET_TYPE } from "../constants/campaign_types";
import { full_campaign_dto } from "../models/campaign.dto";

type CampaignDto = z.infer<typeof full_campaign_dto>;

type TargetRule = {
  id?: string;
  target_type: string;
  target_value?: string;
  behavior_rule?: string;
  is_inclusive: boolean;
  config?: Record<string, unknown>;
};

type TargetingTabProps = {
  campaign: CampaignDto;
};

export function CampaignTargetingTab({ campaign }: TargetingTabProps) {
  const t = useTranslations("campaigns");
  const utils = trpc.useUtils();
  const [rules, setRules] = useState<TargetRule[]>(campaign.targets ?? []);

  const update_campaign = trpc.campaigns.update.useMutation({
    onSuccess: () => {
      toast.success("Règles de ciblage enregistrées");
      utils.campaigns.byId.invalidate({ id: campaign.id });
    },
    onError: (err) => {
      toast.error(err.message || "Erreur lors de la mise à jour");
    },
  });

  const handleAddRule = () => {
    setRules([
      ...rules,
      {
        target_type: "all",
        target_value: "",
        behavior_rule: "",
        is_inclusive: true,
        config: {},
      },
    ]);
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleRuleChange = (
    index: number,
    key: keyof TargetRule,
    val: string | boolean | Record<string, unknown> | null | undefined,
  ) => {
    const next = [...rules];
    next[index] = { ...next[index], [key]: val } as TargetRule;
    setRules(next);
  };

  const handleSave = async () => {
    // Validate rules
    for (const rule of rules) {
      if (rule.target_type !== "all" && !rule.target_value && !rule.behavior_rule) {
        toast.error("Veuillez spécifier une valeur ou une règle de comportement");
        return;
      }
    }

    await update_campaign.mutateAsync({
      id: campaign.id,
      name: campaign.name,
      slug: campaign.slug,
      campaign_type: campaign.campaign_type,
      status: campaign.status,
      priority: campaign.priority,
      starts_at: campaign.starts_at ?? undefined,
      ends_at: campaign.ends_at ?? undefined,
      theme: campaign.theme ?? undefined,
      targets: rules,
    });
  };

  return (
    <QueryGuard>
    <Card className="border shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle>{t("targeting_title")}</CardTitle>
          <p className="text-muted-foreground text-sm">
            {t("targeting_subtitle")}
          </p>
        </div>
        <Button onClick={handleAddRule} variant="outline" className="border-dashed">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une règle
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {rules.length === 0 ? (
          <div className="bg-muted/10 flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
            <HelpCircle className="text-muted-foreground mb-3 h-10 w-10" />
            <p className="text-sm font-semibold">{t("no_targeting")}</p>
            <p className="text-muted-foreground mt-1 max-w-sm text-center text-xs">
              {t("no_targeting_description")}
            </p>
          <Button className="mt-4" onClick={handleAddRule}>
              {t("add_targeting_rule")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {rules.map((rule, idx) => (
              <div
                key={idx}
                className="bg-card flex flex-wrap items-center gap-4 rounded-lg border p-4 shadow-sm"
              >
                {/* Inclusive / Exclusive */}
                <div className="w-[120px]">
                  <FieldLabel className="text-xs">Action</FieldLabel>
                  <select
                    className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none"
                    value={rule.is_inclusive ? "true" : "false"}
                    onChange={(e) =>
                      handleRuleChange(idx, "is_inclusive", e.target.value === "true")
                    }
                  >
                    <option value="true">Inclure</option>
                    <option value="false">Exclure</option>
                  </select>
                </div>

                {/* Target Type */}
                <div className="w-[180px]">
                  <FieldLabel className="text-xs">Type de cible</FieldLabel>
                  <select
                    className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none"
                    value={rule.target_type}
                    onChange={(e) => {
                      const nextType = e.target.value;
                      handleRuleChange(idx, "target_type", nextType);
                      handleRuleChange(idx, "target_value", "");
                      handleRuleChange(idx, "behavior_rule", "");
                    }}
                  >
                    <option value={TARGET_TYPE.all}>Tous les utilisateurs</option>
                    <option value={TARGET_TYPE.country}>Pays (Code ISO)</option>
                    <option value={TARGET_TYPE.language}>Langue (Locale)</option>
                    <option value={TARGET_TYPE.customer_group}>Groupe de clients</option>
                    <option value={TARGET_TYPE.new_customer}>Nouveaux clients</option>
                    <option value={TARGET_TYPE.returning_customer}>Anciens clients (Retour)</option>
                    <option value={TARGET_TYPE.behavior}>Comportement d&apos;achat</option>
                  </select>
                </div>

                {/* Target Value/Behavior Rule inputs based on type */}
                <div className="min-w-[200px] flex-1">
                  {rule.target_type === TARGET_TYPE.country && (
                    <Field>
                      <FieldLabel className="text-xs">Code pays (ex: DZ, FR, US)</FieldLabel>
                      <Input
                        value={rule.target_value ?? ""}
                        onChange={(e) =>
                          handleRuleChange(idx, "target_value", e.target.value.toUpperCase())
                        }
                        placeholder="Ex: DZ"
                        maxLength={2}
                      />
                    </Field>
                  )}

                  {rule.target_type === TARGET_TYPE.language && (
                    <Field>
                      <FieldLabel className="text-xs font-semibold">Langue (Locale)</FieldLabel>
                      <select
                        className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none"
                        value={rule.target_value ?? ""}
                        onChange={(e) => handleRuleChange(idx, "target_value", e.target.value)}
                      >
                        <option value="">Sélectionner...</option>
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="ar">العربية (Arabic)</option>
                      </select>
                    </Field>
                  )}

                  {rule.target_type === TARGET_TYPE.customer_group && (
                    <Field>
                      <FieldLabel className="text-xs">
                        Groupe de clients (VIP, Wholesale, etc.)
                      </FieldLabel>
                      <Input
                        value={rule.target_value ?? ""}
                        onChange={(e) => handleRuleChange(idx, "target_value", e.target.value)}
                        placeholder="Ex: vip_members"
                      />
                    </Field>
                  )}

                  {rule.target_type === TARGET_TYPE.behavior && (
                    <div className="grid grid-cols-2 gap-2">
                      <Field>
                        <FieldLabel className="text-xs">Règle de comportement</FieldLabel>
                        <select
                          className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none"
                          value={rule.behavior_rule ?? ""}
                          onChange={(e) => handleRuleChange(idx, "behavior_rule", e.target.value)}
                        >
                          <option value="">Sélectionner...</option>
                          <option value="viewed_product">A visité un produit</option>
                          <option value="purchased_category">A acheté une catégorie</option>
                          <option value="cart_abandoned">A abandonné son panier</option>
                        </select>
                      </Field>
                      <Field>
                        <FieldLabel className="text-xs">
                          Valeur de la règle (ex: ID catégorie)
                        </FieldLabel>
                        <Input
                          value={rule.target_value ?? ""}
                          onChange={(e) => handleRuleChange(idx, "target_value", e.target.value)}
                          placeholder="Ex: category_id"
                        />
                      </Field>
                    </div>
                  )}

                  {(rule.target_type === TARGET_TYPE.all ||
                    rule.target_type === TARGET_TYPE.new_customer ||
                    rule.target_type === TARGET_TYPE.returning_customer) && (
                    <div className="text-muted-foreground pt-6 text-xs">
                      Règle automatique ne requérant aucun paramètre additionnel.
                    </div>
                  )}
                </div>

                <div className="pt-5">
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveRule(idx)}>
                    <Trash className="text-destructive hover:text-destructive/90 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <ShieldCheck className="h-4 w-4 text-[#c8d152]" />
            Le moteur de ciblage valide ces règles en temps réel à l&apos;affichage storefront.
          </span>
          <Button
            onClick={handleSave}
            className="bg-[#c8d152] text-[#4d4c20] hover:bg-[#c8d152]/90"
            disabled={update_campaign.isPending}
          >
            {update_campaign.isPending ? t("saving") : t("save_targets")}
          </Button>
        </div>
      </CardContent>
    </Card>
    </QueryGuard>
  );
}
