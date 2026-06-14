import { notFound } from "next/navigation";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { ShipmentDetailClient } from "@/features/shipping_management_system/components/shipment-detail-client";

type Props = { params: Promise<{ shipment_id: string }> };

export default async function ShipmentDetailPage({ params }: Props) {
  const { shipment_id } = await params;
  if (!shipment_id) notFound();

  return (
    <ConsolePageShell
      title="Expédition"
      subtitle="Détail et suivi de livraison"
      back_href="/console/shipping"
    >
      <ShipmentDetailClient shipment_id={shipment_id} />
    </ConsolePageShell>
  );
}
