"use client";

import * as React from "react";
import { trpc } from "@/components/providers/app-providers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function AgentKPIClient() {
  const { data: kpi } = trpc.operationsWorkflows.agentKPIDashboard.useQuery({ days: 7 });
  const { data: operators } = trpc.operationsWorkflows.agentLeaderboard.useQuery({ role: "operator", days: 7 });

  const [userId, setUserId] = React.useState("");
  const [searchUserId, setSearchUserId] = React.useState("");
  const { data: agentKpi, isFetching: isAgentFetching } = trpc.operationsWorkflows.agentKPI.useQuery(
    { user_id: searchUserId, days: 30 },
    { enabled: searchUserId.length > 0 },
  );

  function handleSearch() {
    setSearchUserId(userId.trim());
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Agent KPI & Performance</h1>

      {/* Rechercher un agent */}
      <div className="rounded-lg border p-4">
        <h2 className="mb-3 text-sm font-semibold">Rechercher un agent</h2>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Label htmlFor="agent-search" className="mb-1 block text-xs text-gray-500">
              ID de l&apos;agent
            </Label>
            <Input
              id="agent-search"
              placeholder="Saisir l'ID de l'agent..."
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
          <Button onClick={handleSearch} disabled={!userId.trim() || isAgentFetching}>
            Voir
          </Button>
        </div>
      </div>

      {/* Per-user KPI */}
      {searchUserId && agentKpi && (
        <div className="rounded-lg border p-4">
          <h2 className="mb-3 text-sm font-semibold">
            KPI — {searchUserId.slice(0, 16)}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Commandes traitées" value={agentKpi.totals.orders_processed} />
            <StatCard label="Commandes assignées" value={agentKpi.totals.orders_assigned} />
            <StatCard label="Cas résolus" value={agentKpi.totals.cases_resolved} />
            <StatCard label="Tâches complétées" value={agentKpi.totals.tasks_completed} />
          </div>
          {agentKpi.days_covered > 0 && (
            <p className="mt-2 text-xs text-gray-400">
              {agentKpi.days_covered} jour(s) de données · Temps de réponse moyen :{" "}
              {Math.round(agentKpi.avg_response_time_minutes)} min
            </p>
          )}
        </div>
      )}

      {/* Dashboard summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Commandes traitées (7j)" value={kpi?.total_orders_processed ?? 0} />
        <StatCard label="Cas résolus (7j)" value={kpi?.total_cases_resolved ?? 0} />
        <StatCard label="Tâches complétées (7j)" value={kpi?.total_tasks_completed ?? 0} />
        <StatCard label="SLA dépassés (7j)" value={kpi?.total_sla_breaches ?? 0} />
      </div>

      {/* Leaderboard */}
      <div className="rounded-lg border">
        <h2 className="border-b bg-gray-50 px-4 py-2 font-semibold text-sm">Classement des agents</h2>
        <div className="divide-y">
          {operators?.map((op, i) => (
            <div key={op.user_id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span className={`w-6 text-center text-sm font-bold ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-orange-500" : "text-gray-300"}`}>
                  #{i + 1}
                </span>
                <span className="text-sm font-medium">{op.user_id.slice(0, 12)}</span>
              </div>
              <div className="flex gap-4 text-xs">
                <span>{op.orders_processed} cmd</span>
                <span>{op.cases_resolved} cas</span>
                <span>{op.tasks_completed} tâches</span>
                {op.sla_breaches > 0 && <span className="text-red-500">{op.sla_breaches} ⚠</span>}
              </div>
            </div>
          ))}
          {(!operators || operators.length === 0) && <p className="p-4 text-sm text-gray-400">Aucune donnée</p>}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-4 text-center">
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
