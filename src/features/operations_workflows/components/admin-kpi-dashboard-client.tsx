"use client";

import { trpc } from "@/components/providers/app-providers";

export function AdminKPIDashboardClient() {
  const { data: kpi } = trpc.operationsWorkflows.agentKPIDashboard.useQuery({ days: 7 });
  const { data: sla } = trpc.operationsWorkflows.slaStats.useQuery();
  const { data: fraud } = trpc.operationsWorkflows.fraudReviewStats.useQuery();
  const { data: reconciliation } = trpc.operationsWorkflows.reconciliationStats.useQuery();

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Admin KPI Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Orders Processed (7d)" value={kpi?.total_orders_processed ?? 0} sub="across all operators" color="blue" />
        <KPICard label="Cases Resolved (7d)" value={kpi?.total_cases_resolved ?? 0} sub="support cases closed" color="green" />
        <KPICard label="Tasks Completed (7d)" value={kpi?.total_tasks_completed ?? 0} sub="admin tasks done" color="purple" />
        <KPICard label="SLA Breaches (7d)" value={kpi?.total_sla_breaches ?? 0} sub="missed SLAs" color="red" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold text-sm mb-2">SLA Overview</h3>
          <div className="space-y-1 text-sm">
            <p>Active: <span className="font-medium">{sla?.active ?? 0}</span></p>
            <p>Overdue: <span className="font-medium text-orange-600">{sla?.overdue ?? 0}</span></p>
            <p>Breached: <span className="font-medium text-red-600">{sla?.breached ?? 0}</span></p>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="font-semibold text-sm mb-2">Fraud Review</h3>
          <div className="space-y-1 text-sm">
            <p>Pending: <span className="font-medium text-yellow-600">{fraud?.pending ?? 0}</span></p>
            <p>Cleared: <span className="font-medium text-green-600">{fraud?.cleared ?? 0}</span></p>
            <p>Blocked: <span className="font-medium text-red-600">{fraud?.blocked ?? 0}</span></p>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="font-semibold text-sm mb-2">Payment Reconciliation</h3>
          <div className="space-y-1 text-sm">
            <p>Matched: <span className="font-medium text-green-600">{reconciliation?.matched.count ?? 0}</span></p>
            <p>Unmatched: <span className="font-medium text-yellow-600">{reconciliation?.unmatched.count ?? 0}</span></p>
            <p>Discrepancies: <span className="font-medium text-red-600">{reconciliation?.discrepancies ?? 0}</span></p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border">
        <h2 className="border-b bg-gray-50 px-4 py-2 font-semibold text-sm">Agent Leaderboard (7d)</h2>
        <AgentLeaderboardSection />
      </div>

      <div className="rounded-lg border">
        <h2 className="border-b bg-gray-50 px-4 py-2 font-semibold text-sm">Management Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
          <a href="/console/operations/approval-workflows" className="rounded-lg border bg-white p-3 text-center text-sm font-medium hover:bg-gray-50">Approvals</a>
          <a href="/console/operations/sla-definitions" className="rounded-lg border bg-white p-3 text-center text-sm font-medium hover:bg-gray-50">SLA Tracking</a>
          <a href="/console/operations/fraud-reviews" className="rounded-lg border bg-white p-3 text-center text-sm font-medium hover:bg-gray-50">Fraud Queue</a>
          <a href="/console/operations/routing-rules" className="rounded-lg border bg-white p-3 text-center text-sm font-medium hover:bg-gray-50">Routing Rules</a>
          <a href="/console/operations/reconciliation" className="rounded-lg border bg-white p-3 text-center text-sm font-medium hover:bg-gray-50">Reconciliation</a>
          <a href="/console/operations/rma" className="rounded-lg border bg-white p-3 text-center text-sm font-medium hover:bg-gray-50">RMA</a>
          <a href="/console/operations/inventory-transfers" className="rounded-lg border bg-white p-3 text-center text-sm font-medium hover:bg-gray-50">Transfers</a>
          <a href="/console/operations/purchase-orders" className="rounded-lg border bg-white p-3 text-center text-sm font-medium hover:bg-gray-50">Purchase Orders</a>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, sub, color }: { label: string; value: number; sub: string; color: string }) {
  const colors: Record<string, string> = { blue: "text-blue-600", green: "text-green-600", purple: "text-purple-600", red: "text-red-600" };
  return (
    <div className="rounded-lg border p-4">
      <p className={`text-3xl font-bold ${colors[color] ?? ""}`}>{value}</p>
      <p className="text-sm font-medium mt-1">{label}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}

function AgentLeaderboardSection() {
  const { data: operators } = trpc.operationsWorkflows.agentLeaderboard.useQuery({ role: "operator", days: 7 });

  return (
    <div className="divide-y">
      {operators?.map((op, i) => (
        <div key={op.user_id} className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="w-6 text-center text-sm font-bold text-gray-400">#{i + 1}</span>
            <span className="text-sm font-medium">{op.user_id.slice(0, 12)}</span>
          </div>
          <div className="flex gap-4 text-xs text-gray-500">
            <span>{op.orders_processed} orders</span>
            <span>{op.cases_resolved} cases</span>
            <span>{op.tasks_completed} tasks</span>
            {op.sla_breaches > 0 && <span className="text-red-500">{op.sla_breaches} SLA breaches</span>}
          </div>
        </div>
      ))}
      {(!operators || operators.length === 0) && <p className="p-4 text-sm text-gray-400">No operator data yet</p>}
    </div>
  );
}
