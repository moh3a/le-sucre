"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useTranslations } from "next-intl";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ShipmentPanel } from "@/features/shipping_management_system/components/shipment-panel";

type ShippingTabProps = {
  order_id: string;
  shipping_address: Record<string, string>;
  on_update: () => void;
};

export function ShippingTab({ order_id, shipping_address, on_update }: ShippingTabProps) {
  const t = useTranslations("shipping");
  const update_shipping = trpc.orders.adminUpdateShipping.useMutation({
    onSuccess: () => {
      on_update();
      toast.success(t("shipping_updated"));
    },
    onError: (err) => toast.error(t("error_prefix", { message: err.message })),
  });

  const [ship_full_name, set_ship_full_name] = useState("");
  const [ship_phone, set_ship_phone] = useState("");
  const [ship_line1, set_ship_line1] = useState("");
  const [ship_line2, set_ship_line2] = useState("");
  const [ship_city, set_ship_city] = useState("");
  const [ship_state, set_ship_state] = useState("");
  const [ship_postal, set_ship_postal] = useState("");
  const [ship_country, set_ship_country] = useState("DZ");

  function init_shipping_form() {
    set_ship_full_name(shipping_address.full_name ?? "");
    set_ship_phone(shipping_address.phone ?? "");
    set_ship_line1(shipping_address.line1 ?? "");
    set_ship_line2(shipping_address.line2 ?? "");
    set_ship_city(shipping_address.city ?? "");
    set_ship_state(shipping_address.state ?? "");
    set_ship_postal(shipping_address.postal_code ?? "");
    set_ship_country(shipping_address.country_code ?? "DZ");
  }

  function on_save_shipping() {
    update_shipping.mutate({
      order_id,
      shipping_address: {
        full_name: ship_full_name,
        phone: ship_phone,
        line1: ship_line1,
        line2: ship_line2 || null,
        city: ship_city,
        state: ship_state || null,
        postal_code: ship_postal || null,
        country_code: ship_country,
      },
    });
  }

  return (
    <QueryGuard mutation={update_shipping}>
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>{t("adresse_livraison")}</CardTitle>
          <Button size="sm" variant="outline" onClick={init_shipping_form}>
            {t("modifier_adresse")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p className="font-medium">{shipping_address.full_name}</p>
          <p>{shipping_address.phone}</p>
          <p>{shipping_address.line1}</p>
          {shipping_address.line2 && <p>{shipping_address.line2}</p>}
          <p>
            {shipping_address.city}
            {shipping_address.postal_code ? `, ${shipping_address.postal_code}` : ""}
          </p>
          <p>{shipping_address.country_code}</p>
        </CardContent>
      </Card>

      {ship_full_name !== "" && (
        <Card className="mt-4 border-blue-200">
          <CardHeader>
            <CardTitle>{t("modifier_adresse")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <Field>
                <FieldLabel>{t("nom_complet")}</FieldLabel>
                <Input
                  value={ship_full_name}
                  onChange={(e) => set_ship_full_name(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>{t("telephone")}</FieldLabel>
                <Input
                  value={ship_phone}
                  onChange={(e) => set_ship_phone(e.target.value)}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel>{t("adresse")}</FieldLabel>
              <Input
                value={ship_line1}
                onChange={(e) => set_ship_line1(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>{t("complement_adresse")}</FieldLabel>
              <Input
                value={ship_line2}
                onChange={(e) => set_ship_line2(e.target.value)}
              />
            </Field>
            <div className="grid gap-3 md:grid-cols-3">
              <Field>
                <FieldLabel>{t("ville")}</FieldLabel>
                <Input
                  value={ship_city}
                  onChange={(e) => set_ship_city(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>{t("wilaya_etat")}</FieldLabel>
                <Input
                  value={ship_state}
                  onChange={(e) => set_ship_state(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>{t("code_postal")}</FieldLabel>
                <Input
                  value={ship_postal}
                  onChange={(e) => set_ship_postal(e.target.value)}
                />
              </Field>
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => set_ship_full_name("")}>
                {t("annuler")}
              </Button>
              <Button
                size="sm"
                onClick={on_save_shipping}
                disabled={update_shipping.isPending}
              >
                {update_shipping.isPending ? t("saving") : t("save")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <ShipmentPanel order_id={order_id} />
    </>
    </QueryGuard>
  );
}
