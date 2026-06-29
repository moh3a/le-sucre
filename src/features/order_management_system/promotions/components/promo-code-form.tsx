"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PromoCodeFormProps = {
  promotion_id: string;
  on_created?: () => void;
};

export function PromoCodeForm({ promotion_id, on_created }: PromoCodeFormProps) {
  const t = useTranslations("promotions");
  const [code, set_code] = useState("");
  const [discount_type, set_discount_type] = useState<"percent" | "fixed">("percent");
  const [discount_value, set_discount_value] = useState("10");
  const [min_subtotal, set_min_subtotal] = useState("");
  const [usage_limit, set_usage_limit] = useState("");
  const [per_customer_limit, set_per_customer_limit] = useState("1");
  const [loading, set_loading] = useState(false);
  const [error, set_error] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    set_loading(true);
    set_error(null);
    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Promo ${code}`,
          slug: code.toLowerCase(),
          promotion_type: "promo_code",
          status: "active",
          rules: [
            {
              scope_type: "cart",
              discount_type,
              discount_value: Number(discount_value),
              min_subtotal: min_subtotal ? Number(min_subtotal) : null,
            },
          ],
        }),
      });
      if (!res.ok) throw new Error(t("promo_create_failed"));

      const promo = await res.json();
      const promo_id = promo?.data?.id ?? promotion_id;

      const code_res = await fetch("/api/trpc/promotions.createPromoCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promotion_id: promo_id,
          code,
          usage_limit: usage_limit ? Number(usage_limit) : null,
          per_customer_limit: Number(per_customer_limit),
        }),
      });

      if (!code_res.ok) throw new Error(t("promo_code_create_failed"));
      set_code("");
      on_created?.();
    } catch (err) {
      set_error(err instanceof Error ? err.message : t("promo_code_error_title"));
    } finally {
      set_loading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border p-4">
      <h3 className="font-heading text-lg">{t("promo_code_title")}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>{t("promo_code_label")}</Label>
          <Input value={code} onChange={(e) => set_code(e.target.value.toUpperCase())} required />
        </div>
        <div>
          <Label>{t("promo_type_label")}</Label>
          <select
            className="w-full rounded-md border px-3 py-2"
            value={discount_type}
            onChange={(e) => set_discount_type(e.target.value as "percent" | "fixed")}
          >
            <option value="percent">{t("promo_type_percent")}</option>
            <option value="fixed">{t("promo_type_fixed")}</option>
          </select>
        </div>
        <div>
          <Label>{t("promo_value_label")}</Label>
          <Input
            type="number"
            min={0}
            value={discount_value}
            onChange={(e) => set_discount_value(e.target.value)}
          />
        </div>
        <div>
          <Label>{t("promo_min_cart_label")}</Label>
          <Input
            type="number"
            min={0}
            value={min_subtotal}
            onChange={(e) => set_min_subtotal(e.target.value)}
          />
        </div>
        <div>
          <Label>{t("promo_global_limit_label")}</Label>
          <Input
            type="number"
            min={1}
            value={usage_limit}
            onChange={(e) => set_usage_limit(e.target.value)}
          />
        </div>
        <div>
          <Label>{t("promo_per_customer_label")}</Label>
          <Input
            type="number"
            min={1}
            value={per_customer_limit}
            onChange={(e) => set_per_customer_limit(e.target.value)}
          />
        </div>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? t("promo_saving") : t("promo_create_button")}
      </Button>
    </form>
  );
}
