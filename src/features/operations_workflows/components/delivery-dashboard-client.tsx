"use client";

import Link from "next/link";

export function DeliveryDashboardClient() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Delivery Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-lg border p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">0</p>
          <p className="text-xs text-gray-500 mt-1">Assigned Today</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-3xl font-bold text-green-600">0</p>
          <p className="text-xs text-gray-500 mt-1">Delivered</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-3xl font-bold text-red-600">0</p>
          <p className="text-xs text-gray-500 mt-1">Failed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border">
          <h2 className="border-b bg-gray-50 px-4 py-2 font-semibold text-sm">Today&apos;s Deliveries</h2>
          <div className="p-6 text-center text-sm text-gray-400">No deliveries assigned today.</div>
        </div>

        <div className="rounded-lg border">
          <h2 className="border-b bg-gray-50 px-4 py-2 font-semibold text-sm">Pending Returns</h2>
          <div className="p-6 text-center text-sm text-gray-400">No pending returns.</div>
        </div>
      </div>

      <div className="rounded-lg border">
        <h2 className="border-b bg-gray-50 px-4 py-2 font-semibold text-sm">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
          <Link href="/console/shipping" className="rounded-lg border bg-white p-3 text-center text-sm font-medium hover:bg-gray-50">View Shipments</Link>
          <Link href="/console/operations/delivery" className="rounded-lg border bg-white p-3 text-center text-sm font-medium hover:bg-gray-50">Delivery Tracking</Link>
          <Link href="/console/operations/rma" className="rounded-lg border bg-white p-3 text-center text-sm font-medium hover:bg-gray-50">RMA Returns</Link>
        </div>
      </div>
    </div>
  );
}
