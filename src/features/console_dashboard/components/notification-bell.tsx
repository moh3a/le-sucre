"use client";

import { useTranslations } from "next-intl";
import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  REFERENCE_ROUTES,
  type ReferenceType,
} from "@/features/console_dashboard/tasks/constants/task-types";

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  reference_type: string | null;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
};

export function NotificationBell() {
  const t = useTranslations("notifications");

  const utils = trpc.useUtils();
  const countQuery = trpc.operations.notificationCountUnread.useQuery();
  const listQuery = trpc.operations.notificationList.useQuery({ page: 1, limit: 10 });

  const unread = countQuery.data ?? 0;
  const items = (listQuery.data?.items ?? []) as NotificationRow[];

  const markRead = trpc.operations.notificationMarkAsRead.useMutation({
    onSuccess: () => {
      utils.operations.notificationCountUnread.invalidate();
      utils.operations.notificationList.invalidate();
    },
  });

  const markAll = trpc.operations.notificationMarkAllAsRead.useMutation({
    onSuccess: () => {
      utils.operations.notificationCountUnread.invalidate();
      utils.operations.notificationList.invalidate();
    },
  });

  const reference_route = (item: NotificationRow) =>
    item.reference_type && item.reference_id && REFERENCE_ROUTES[item.reference_type as ReferenceType]
      ? `${REFERENCE_ROUTES[item.reference_type as ReferenceType]}${item.reference_id}`
      : null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={t("title")}>
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b p-3">
          <h3 className="text-sm font-semibold">{t("title")}</h3>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
            >
              <CheckCheck className="size-3.5" />
              {t("mark_all_read", { count: unread })}
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          <QueryGuard query={{ isLoading: listQuery.isLoading, error: listQuery.error }}>
            {items.length === 0 ? (
              <p className="text-muted-foreground p-6 text-center text-sm">
                {t("no_notifications")}
              </p>
            ) : (
              <ul className="divide-y">
                {items.map((item) => {
                  const route = reference_route(item);
                  const content = (
                    <div
                      className={cn(
                        "flex w-full items-start gap-3 px-3 py-2.5 text-left",
                        !item.is_read && "bg-accent/50",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        {item.message && (
                          <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                            {item.message}
                          </p>
                        )}
                        <p className="text-muted-foreground mt-1 text-xs">
                          {formatDate(item.created_at, { month: "short" })}
                        </p>
                      </div>
                      {!item.is_read && (
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                  );
                  return (
                    <li key={item.id}>
                      {route ? (
                        <Link href={route} onClick={() => !item.is_read && markRead.mutate({ id: item.id })}>
                          {content}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="w-full"
                          onClick={() => !item.is_read && markRead.mutate({ id: item.id })}
                        >
                          {content}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </QueryGuard>
        </div>
      </PopoverContent>
    </Popover>
  );
}
