"use client";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { InvoiceStats } from "./invoice_stats";
import { InvoiceTable } from "./invoice_table";
import { GenerateInvoiceDialog } from "./generate-invoice-dialog";

export function InvoicesPageClient() {
  return (
    <ConsolePageShell
      title="Factures"
      subtitle="Gestion des factures et documents financiers"
      actions={<GenerateInvoiceDialog />}
      stats={<InvoiceStats />}
    >
      <InvoiceTable />
    </ConsolePageShell>
  );
}
