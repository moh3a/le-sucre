import { notFound } from "next/navigation";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { InvoiceDetailClient } from "@/features/billing_and_finance_system/components/invoice_detail_client";

type Props = { params: Promise<{ invoice_id: string }> };

export default async function InvoiceDetailPage({ params }: Props) {
  const { invoice_id } = await params;
  if (!invoice_id) notFound();

  return (
    <ConsolePageShell
      title="Détail de la facture"
      subtitle="Consulter, télécharger et gérer la facture"
    >
      <InvoiceDetailClient id={invoice_id} />
    </ConsolePageShell>
  );
}

export async function generateMetadata({ params }: Props) {
  const { invoice_id } = await params;
  return {
    title: `Facture ${invoice_id} - Le Sucré`,
  };
}
