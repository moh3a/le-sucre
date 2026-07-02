"use client";

import { trpc } from "@/components/providers/app-providers";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function CustomerReturnsClient() {
  const t = useTranslations("returns");
  const { data: requests } = trpc.returns.myListReturnRequests.useQuery({ order_id: "" });
  const [orderId, setOrderId] = useState("");

  const { data: filtered } = trpc.returns.myListReturnRequests.useQuery(
    { order_id: orderId },
    { enabled: !!orderId },
  );

  const statusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: t("status_pending"),
      approved: t("status_approved"),
      rejected: t("status_rejected"),
      awaiting_return: t("status_awaiting_return"),
      received: t("status_received"),
      completed: t("status_completed"),
      cancelled: t("status_cancelled"),
    };
    return labels[status] ?? status;
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <h1 className="text-2xl font-bold">{t("my_returns")}</h1>
      <p className="text-sm text-gray-500">{t("description")}</p>

      <div className="flex gap-2">
        <input
          placeholder={t("filter_by_order_id")}
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="flex-1 rounded border px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-4">
        {(orderId ? filtered : requests)?.map((r: any) => (
          <div key={r.id} className="rounded-lg border bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">{t("return_number", { id: r.id.slice(0, 8) })}</p>
              <span className={`rounded-full px-2 py-0.5 text-xs ${statusColor(r.status)}`}>
                {statusLabel(r.status)}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {t("order", { id: r.order_id?.slice(0, 12) ?? "—" })}
            </p>
            {r.reason && (
              <p className="mt-1 text-xs text-gray-500">{t("reason", { reason: r.reason })}</p>
            )}
            {r.created_at && (
              <p className="mt-1 text-xs text-gray-400">
                {t("submitted", { date: new Date(r.created_at).toLocaleDateString() })}
              </p>
            )}
          </div>
        ))}
        {(!(orderId ? filtered : requests) || (orderId ? filtered : requests)?.length === 0) && (
          <p className="py-8 text-center text-sm text-gray-400">{t("no_returns")}</p>
        )}
      </div>

      <p className="text-center text-xs text-gray-400">
        {t.rich("create_return_text", {
          link: (chunks) => (
            <Link href="/account/orders" className="text-blue-600 hover:underline">
              {chunks}
            </Link>
          ),
        })}
      </p>
    </div>
  );
}

function statusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    awaiting_return: "bg-blue-100 text-blue-700",
    received: "bg-purple-100 text-purple-700",
    completed: "bg-gray-100 text-gray-700",
    cancelled: "bg-gray-100 text-gray-500",
  };
  return colors[status] ?? "bg-gray-100 text-gray-700";
}
