"use client";

import { trpc } from "@/components/providers/app-providers";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function NotificationsPageClient() {
  const t = useTranslations("notifications");
  const [page, setPage] = useState(1);
  const { data: result, refetch } = trpc.operations.notificationList.useQuery({ page, limit: 20, unread_only: false });
  const markRead = trpc.operations.notificationMarkAsRead.useMutation({ onSuccess: () => refetch() });
  const markAll = trpc.operations.notificationMarkAllAsRead.useMutation({ onSuccess: () => refetch() });
  const { data: unread } = trpc.operations.notificationCountUnread.useQuery();

  const notifications = result?.items ?? [];
  const meta = result?.meta;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <button onClick={() => markAll.mutate()} className="rounded bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200">
          {t("mark_all_read", { count: unread ?? 0 })}
        </button>
      </div>

      <div className="rounded-lg border">
        <div className="divide-y">
          {notifications.map((n: any) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3 ${n.is_read ? "" : "bg-blue-50"}`}
              onClick={() => !n.is_read && markRead.mutate({ id: n.id })}
            >
              <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${n.is_read ? "bg-transparent" : "bg-blue-500"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{n.title}</p>
                {n.message && <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>}
                <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {n.type && <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 shrink-0">{n.type}</span>}
            </div>
          ))}
          {notifications.length === 0 && <p className="p-8 text-center text-sm text-gray-400">{t("no_notifications")}</p>}
        </div>
      </div>

      {meta && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="rounded border px-3 py-1 text-sm disabled:opacity-50">{t("previous")}</button>
          <span className="px-3 py-1 text-sm text-gray-500">{t("page")} {page} {t("of")} {meta.total_pages}</span>
          <button onClick={() => setPage(page + 1)} disabled={page >= meta.total_pages} className="rounded border px-3 py-1 text-sm disabled:opacity-50">{t("next")}</button>
        </div>
      )}
    </div>
  );
}
