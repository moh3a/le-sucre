"use client";

import { useState } from "react";
import { trpc } from "@/components/providers/app-providers";

export function FraudReviewsClient() {
  const utils = trpc.useUtils();
  const { data: pending } = trpc.operationsWorkflows.fraudReviewsList.useQuery({ status: "pending" });
  const { data: stats } = trpc.operationsWorkflows.fraudReviewStats.useQuery();
  const review = trpc.operationsWorkflows.fraudReview.useMutation({ onSuccess: () => utils.invalidate() });

  const [orderId, setOrderId] = useState("");

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fraud Reviews</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold">{stats?.pending ?? 0}</p>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats?.cleared ?? 0}</p>
          <p className="text-xs text-gray-500">Cleared</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{stats?.blocked ?? 0}</p>
          <p className="text-xs text-gray-500">Blocked</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{stats?.manual_review ?? 0}</p>
          <p className="text-xs text-gray-500">Manual Review</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input placeholder="Order ID to screen" value={orderId} onChange={(e) => setOrderId(e.target.value)} className="rounded border px-3 py-2 text-sm flex-1" />
        <button
          onClick={() => { trpc.operationsWorkflows.fraudScreenOrder.useMutation().mutate({ order_id: orderId }); setOrderId(""); }}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Screen Order
        </button>
      </div>

      <div className="rounded-lg border">
        <h2 className="border-b bg-gray-50 px-4 py-2 font-semibold text-sm">Pending Reviews ({pending?.length ?? 0})</h2>
        <div className="divide-y">
          {pending?.map((fr) => (
            <div key={fr.id} className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Order {fr.order_id.slice(0, 12)}</p>
                  <p className="text-xs text-gray-500">Risk Score: {fr.risk_score} · {(fr.flags as any[])?.length ?? 0} flags</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${fr.risk_score >= 70 ? "bg-red-100 text-red-700" : fr.risk_score >= 40 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                  {fr.risk_score}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => review.mutate({ id: fr.id, decision: "approved", decision_reason: "Looks legitimate" })} className="rounded bg-green-600 px-3 py-1 text-xs text-white">Approve</button>
                <button onClick={() => review.mutate({ id: fr.id, decision: "rejected", decision_reason: "Suspicious activity" })} className="rounded bg-red-600 px-3 py-1 text-xs text-white">Reject</button>
                <button onClick={() => review.mutate({ id: fr.id, decision: "review", decision_reason: "Needs manual review" })} className="rounded bg-orange-600 px-3 py-1 text-xs text-white">Manual Review</button>
              </div>
              {(fr.flags as any[])?.map((flag: any, i: number) => (
                <p key={i} className="text-xs text-gray-400">· {flag.rule}: {flag.reason}</p>
              ))}
            </div>
          ))}
          {(!pending || pending.length === 0) && <p className="p-4 text-sm text-gray-400">No pending fraud reviews</p>}
        </div>
      </div>
    </div>
  );
}
