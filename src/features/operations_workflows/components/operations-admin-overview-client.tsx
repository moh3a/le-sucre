"use client";

import { Box, RefreshCw, ShieldCheck, Users, Truck, Scale, FileCheck, Wrench } from "lucide-react";

const sections = [
  { title: "Approval Workflows", href: "/console/operations/approval-workflows", icon: FileCheck, desc: "Pending approvals and requests" },
  { title: "Fraud Reviews", href: "/console/operations/fraud-reviews", icon: ShieldCheck, desc: "Flagged order screening" },
  { title: "SLA Definitions", href: "/console/operations/sla-definitions", icon: Clock, desc: "Service-level agreement tracking" },
  { title: "Routing Rules", href: "/console/operations/routing-rules", icon: ArrowRightCircle, desc: "Order auto-assignment rules" },
  { title: "Suppliers", href: "/console/operations/suppliers", icon: Truck, desc: "Supplier management" },
  { title: "Purchase Orders", href: "/console/operations/purchase-orders", icon: Box, desc: "Procurement and PO tracking" },
  { title: "Inventory Transfers", href: "/console/operations/inventory-transfers", icon: RefreshCw, desc: "Inter-warehouse stock moves" },
  { title: "Reconciliation", href: "/console/operations/reconciliation", icon: Scale, desc: "Payment matching dashboard" },
  { title: "RMA / Returns", href: "/console/operations/rma", icon: Wrench, desc: "Return merchandise authorization" },
  { title: "Agent KPI", href: "/console/operations/agent-kpi", icon: Users, desc: "Performance metrics & leaderboard" },
];

export function OperationsAdminOverviewClient() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Operations Workflows</h1>
      <p className="text-sm text-gray-500">Enterprise operations tools for order processing, procurement, and compliance.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sections.map((s) => (
          <a key={s.title} href={s.href} className="rounded-lg border bg-white p-4 hover:shadow-md transition">
            <div className="flex items-start gap-3">
              <s.icon className="mt-0.5 h-5 w-5 text-gray-600" />
              <div>
                <h3 className="font-semibold text-sm">{s.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function Clock(props: React.SVGProps<SVGSVGElement>) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>; }
function ArrowRightCircle(props: React.SVGProps<SVGSVGElement>) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,16 16,12 12,8"/><line x1="8" y1="12" x2="16" y2="12"/></svg>; }
