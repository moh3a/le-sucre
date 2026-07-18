"use client";

import { useTranslations } from "next-intl";
import { Shield, Key, BarChart3 } from "lucide-react";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { AuthorizationTable } from "./authorization-table";
import { AuthorizationRoleEditor } from "./authorization-role-editor";

export function AuthorizationPageClient() {
  const t = useTranslations("authorization");
  const { data: stats, isLoading: statsLoading } = trpc.authorization.stats.useQuery();

  return (
    <QueryGuard query={{ isLoading: false }}>
      <ConsolePageShell
        title={t("title")}
        subtitle={t("subtitle")}
        actions={<AuthorizationRoleEditor />}
        stats={
          <StatsGrid
            loading={statsLoading}
            items={[
              { label: t("stat_roles"), value: stats?.total_roles ?? 0, icon: Shield, color: "info" },
              { label: t("stat_permissions"), value: stats?.total_permissions ?? 0, icon: Key, color: "success" },
              { label: t("stat_avg_permissions"), value: stats?.avg_permissions_per_role ?? 0, icon: BarChart3, color: "warning" },
            ]}
          />
        }
      >
        <AuthorizationTable />
      </ConsolePageShell>
    </QueryGuard>
  );
}
