"use client";

import { useTranslations } from "next-intl";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { ShippingStats } from "./shipping-stats";
import { ShippingTable } from "./shipping-table";
import { CreateShipmentDialog } from "./create-shipment-dialog";

export function ShippingContent() {
  const t = useTranslations("shipping");

  return (
    <>
      <ShippingStats />
      <ShippingTable />
    </>
  );
}

export function ShippingPageClient() {
  const t = useTranslations("shipping");

  return (
    <ConsolePageShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={<CreateShipmentDialog />}
    >
      <ShippingContent />
    </ConsolePageShell>
  );
}
