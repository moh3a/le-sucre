"use client";

import { useState } from "react";

interface OrderStatusEvent {
  status: string;
  timestamp: string;
  note?: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_ORDER = ["pending_payment", "paid", "processing", "shipped", "delivered"];

export function CustomerOrderTracking({ orderId, events: initialEvents }: { orderId: string; events?: OrderStatusEvent[] }) {
  const [orderNumber] = useState(orderId.slice(0, 8).toUpperCase());

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="text-lg font-semibold mb-1">Order #{orderNumber}</h2>
      <p className="text-sm text-gray-500 mb-6">Track your order status below</p>

      <div className="relative">
        {STATUS_ORDER.map((status, i) => {
          const event = initialEvents?.find((e) => e.status === status);
          const isReached = !!event;
          const isLast = i === STATUS_ORDER.length - 1;

          return (
            <div key={status} className="flex items-start gap-4 pb-6 relative">
              <div className="flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full border-2 ${isReached ? "bg-green-500 border-green-500" : "bg-white border-gray-300"}`} />
                {!isLast && <div className={`w-0.5 h-8 ${isReached ? "bg-green-500" : "bg-gray-200"}`} />}
              </div>
              <div className="flex-1 pt-0.5">
                <p className={`text-sm font-medium ${isReached ? "text-green-700" : "text-gray-400"}`}>{STATUS_LABELS[status]}</p>
                {event && <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>}
                {event?.note && <p className="text-xs text-gray-400 mt-0.5">{event.note}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CustomerSupportTicketForm() {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-lg border bg-green-50 p-6 text-center">
        <p className="text-green-700 font-medium">Your support request has been submitted.</p>
        <p className="text-sm text-green-600 mt-1">We will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6 space-y-4">
      <h2 className="text-lg font-semibold">Contact Support</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Subject</label>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} required className="w-full rounded border px-3 py-2 text-sm" placeholder="How can we help?" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded border px-3 py-2 text-sm">
          <option value="general">General</option>
          <option value="order">Order Issue</option>
          <option value="delivery">Delivery Problem</option>
          <option value="return">Return / Refund</option>
          <option value="product">Product Question</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className="w-full rounded border px-3 py-2 text-sm" placeholder="Describe your issue..." />
      </div>
      <button type="submit" className="rounded bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-700">Submit Ticket</button>
    </form>
  );
}
