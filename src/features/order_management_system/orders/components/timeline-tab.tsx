"use client";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { ORDER_LABELS } from "../constants/order-status";

type TimelineTabProps = {
  status_events: Array<{
    id: string;
    from_status: string | null;
    to_status: string;
    actor_name: string | null;
    note: string | null;
    created_at: string;
  }>;
};

export function TimelineTab({ status_events }: TimelineTabProps) {
  return (
    <div className="space-y-3">
      {status_events.map((ev, idx) => (
        <div key={ev.id} className="relative flex gap-4">
          <div className="flex flex-col items-center">
            <div className="bg-primary h-3 w-3 rounded-full" />
            {idx < status_events.length - 1 && <div className="bg-border mt-1 w-px flex-1" />}
          </div>
          <div className="pb-4">
            <div className="flex items-center gap-2">
              {ev.from_status && (
                <>
                  <Badge variant="outline" className="text-xs">
                    {ORDER_LABELS[ev.from_status] ?? ev.from_status}
                  </Badge>
                  <span className="text-muted-foreground text-xs">→</span>
                </>
              )}
              <Badge className="text-xs">{ORDER_LABELS[ev.to_status] ?? ev.to_status}</Badge>
            </div>
            {ev.actor_name && (
              <p className="text-muted-foreground mt-1 text-xs font-medium">{ev.actor_name}</p>
            )}
            {ev.note && <p className="text-muted-foreground mt-1 text-sm">{ev.note}</p>}
            <p className="text-muted-foreground mt-1 text-xs">
              {formatDate(ev.created_at, {
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}
      {status_events.length === 0 && (
        <p className="text-muted-foreground text-sm">Aucun événement enregistré.</p>
      )}
    </div>
  );
}
