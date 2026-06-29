"use client";

import { trpc } from "@/components/providers/app-providers";

export function OperatorDashboardClient() {
  const { data: slaStats } = trpc.operationsWorkflows.slaStats.useQuery();
  const { data: kpiStats } = trpc.operationsWorkflows.agentKPIDashboard.useQuery({ days: 7 });

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Operator Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Orders Processed (7d)" value={kpiStats?.total_orders_processed ?? 0} color="blue" />
        <StatCard label="Cases Resolved (7d)" value={kpiStats?.total_cases_resolved ?? 0} color="green" />
        <StatCard label="Tasks Completed (7d)" value={kpiStats?.total_tasks_completed ?? 0} color="purple" />
        <StatCard label="SLA Breaches (7d)" value={kpiStats?.total_sla_breaches ?? 0} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border">
          <h2 className="border-b bg-gray-50 px-4 py-2 font-semibold text-sm">My Assigned Orders</h2>
          <div className="p-4 text-sm text-gray-400">Orders assigned to you will appear here.</div>
        </div>

        <div className="rounded-lg border">
          <h2 className="border-b bg-gray-50 px-4 py-2 font-semibold text-sm">Pending Follow-ups</h2>
          <div className="p-4 text-sm text-gray-400">Your scheduled callbacks and follow-ups will appear here.</div>
        </div>
      </div>

      <div className="rounded-lg border">
        <h2 className="border-b bg-gray-50 px-4 py-2 font-semibold text-sm">SLA Status</h2>
        <div className="grid grid-cols-3 gap-4 p-4">
          <div className="text-center">
            <p className="text-xl font-bold text-blue-600">{slaStats?.active ?? 0}</p>
            <p className="text-xs text-gray-500">Active SLAs</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-orange-600">{slaStats?.overdue ?? 0}</p>
            <p className="text-xs text-gray-500">Overdue</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-red-600">{slaStats?.breached ?? 0}</p>
            <p className="text-xs text-gray-500">Breached</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border">
        <h2 className="border-b bg-gray-50 px-4 py-2 font-semibold text-sm">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
          <QuickActionButton href="/console/orders" label="All Orders" />
          <QuickActionButton href="/console/operations/support-cases" label="Support Cases" />
          <QuickActionButton href="/console/operations/follow-ups" label="Follow-ups" />
          <QuickActionButton href="/console/operations/tasks" label="My Tasks" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = { blue: "text-blue-600", green: "text-green-600", purple: "text-purple-600", red: "text-red-600" };
  return (
    <div className="rounded-lg border p-4 text-center">
      <p className={`text-3xl font-bold ${colors[color] ?? "text-gray-900"}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function QuickActionButton({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="rounded-lg border bg-white p-3 text-center text-sm font-medium hover:bg-gray-50 transition">
      {label}
    </a>
  );
}
