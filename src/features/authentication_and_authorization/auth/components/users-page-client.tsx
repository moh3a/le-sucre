"use client";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { Users, UserCheck, Clock, Shield } from "lucide-react";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { UsersTable } from "./users-table";
import { CreateUserDialog } from "./create-user-dialog";

export function UsersPageClient() {
  const { data: statsData, isLoading: isLoadingStats, error: statsError } = trpc.adminAuth.getStats.useQuery();

  const isLoading = isLoadingStats;
  const totalUsers = statsData?.total ?? 0;

  return (
    <QueryGuard query={{ isLoading: isLoadingStats, error: statsError }}>
      <ConsolePageShell
      title="Utilisateurs"
      subtitle="Gestion des utilisateurs et des rôles"
      actions={<CreateUserDialog />}
      stats={
        <StatsGrid
          loading={isLoading}
          items={[
            {
              label: "Total utilisateurs",
              value: totalUsers,
              icon: Users,
              color: "info",
            },
            {
              label: "Actifs",
              value: statsData?.active ?? 0,
              icon: UserCheck,
              color: "success",
            },
            {
              label: "Nouveaux (30j)",
              value: statsData?.new_30d ?? 0,
              icon: Clock,
              color: "warning",
            },
            {
              label: "Staff",
              value: statsData?.staff ?? 0,
              icon: Shield,
              color: "default",
            },
          ]}
        />
      }
    >
      <UsersTable />
    </ConsolePageShell>
    </QueryGuard>
  );
}
