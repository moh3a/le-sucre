"use client";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { Users, UserCheck, Clock, Shield } from "lucide-react";
import { trpc } from "@/components/providers/app-providers";
import { UsersTable } from "./users-table";

export function UsersPageClient() {
  const { data: statsData, isLoading: isLoadingStats } = trpc.adminAuth.getStats.useQuery();
  const { data: usersData, isLoading: isLoadingUsers } = trpc.adminAuth.listUsers.useQuery({
    page: 1,
    limit: 1,
  });

  const isLoading = isLoadingStats || isLoadingUsers;
  const totalUsers = statsData?.total ?? usersData?.meta.total_records ?? 0;

  return (
    <ConsolePageShell
      title="Utilisateurs"
      subtitle="Gestion des utilisateurs et des rôles"
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
  );
}
