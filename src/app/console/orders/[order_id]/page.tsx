import { notFound } from "next/navigation";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { OrderDetailTabs } from "@/features/order_management_system/orders/components/order-detail-tabs";

type Props = { params: Promise<{ order_id: string }> };

export default async function OrderDetailPage({ params }: Props) {
  const { order_id } = await params;
  if (!order_id) notFound();

  return (
    <ConsolePageShell
      title={`Commande`}
      subtitle={`Détail et gestion de la commande`}
      back_href="/console/orders"
    >
      <OrderDetailTabs order_id={order_id} />
    </ConsolePageShell>
  );
}

export async function generateMetadata({ params }: Props) {
  const { order_id } = await params;
  return {
    title: `Commande ${order_id} — Le Sucre`,
  };
}