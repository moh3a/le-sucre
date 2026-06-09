"use client";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { InvoiceStats } from "./invoice_stats";
import { InvoiceTable } from "./invoice_table";

export function InvoicesPageClient() {
  return (
    <ConsolePageShell
      title="Factures"
      subtitle="Gestion des factures et documents financiers"
      stats={<InvoiceStats />}
    >
      <InvoiceTable />
    </ConsolePageShell>
  );
}
