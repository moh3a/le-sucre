"use client";

import Link from "next/link";

export function ModeratorDashboardClient() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Moderator Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">0</p>
          <p className="text-xs text-gray-500 mt-1">Pending Reviews</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-3xl font-bold text-green-600">0</p>
          <p className="text-xs text-gray-500 mt-1">Approved Today</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-3xl font-bold text-red-600">0</p>
          <p className="text-xs text-gray-500 mt-1">Rejected</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">0</p>
          <p className="text-xs text-gray-500 mt-1">Reported Content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border">
          <h2 className="border-b bg-gray-50 px-4 py-2 font-semibold text-sm">Reviews Awaiting Moderation</h2>
          <div className="p-6 text-center text-sm text-gray-400">No pending reviews.</div>
        </div>
        <div className="rounded-lg border">
          <h2 className="border-b bg-gray-50 px-4 py-2 font-semibold text-sm">Recent Actions</h2>
          <div className="p-6 text-center text-sm text-gray-400">Your recent moderation actions will appear here.</div>
        </div>
      </div>

      <div className="rounded-lg border">
        <h2 className="border-b bg-gray-50 px-4 py-2 font-semibold text-sm">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
          <Link href="/console/reviews" className="rounded-lg border bg-white p-3 text-center text-sm font-medium hover:bg-gray-50">Review Queue</Link>
          <Link href="/console/operations/approval-workflows" className="rounded-lg border bg-white p-3 text-center text-sm font-medium hover:bg-gray-50">Approvals</Link>
        </div>
      </div>
    </div>
  );
}
