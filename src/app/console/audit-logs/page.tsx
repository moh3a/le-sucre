import { AuditLogsPageClient } from "@/features/authentication_and_authorization/authorization/components/audit-logs-page-client";

export const metadata = { title: "Journal d'audit" };

export default function AuditLogs() {
  return <AuditLogsPageClient />;
}
