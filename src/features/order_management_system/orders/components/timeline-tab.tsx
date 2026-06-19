"use client";

import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { ORDER_LABELS } from "../constants/order-status";
import {
  ArrowRightLeft,
  UserPlus,
  PauseCircle,
  PlayCircle,
  TriangleAlert,
  MessageSquare,
  Ban,
  Info,
} from "lucide-react";

type TimelineTabProps = {
  order_id: string;
};

const TYPE_STYLES: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  status_event: {
    icon: ArrowRightLeft,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900",
    label: "Changement de statut",
  },
  assignment: {
    icon: UserPlus,
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-900",
    label: "Affectation",
  },
  hold: {
    icon: PauseCircle,
    color: "text-amber-500",
    bg: "bg-amber-100 dark:bg-amber-900",
    label: "Mise en attente",
  },
  hold_released: {
    icon: PlayCircle,
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-900",
    label: "Attente levée",
  },
  escalation: {
    icon: TriangleAlert,
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-900",
    label: "Escalade",
  },
  comment: {
    icon: MessageSquare,
    color: "text-purple-500",
    bg: "bg-purple-100 dark:bg-purple-900",
    label: "Commentaire",
  },
  cancellation_request: {
    icon: Ban,
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-900",
    label: "Demande d'annulation",
  },
};

export function TimelineTab({ order_id }: TimelineTabProps) {
  const { data: timeline, isLoading } = trpc.operations.orderGetTimeline.useQuery({ order_id });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  if (!timeline || timeline.length === 0) {
    return <p className="text-muted-foreground text-sm">Aucun événement enregistré.</p>;
  }

  return (
    <div className="space-y-3">
      {timeline.map((ev, idx) => {
        const style = TYPE_STYLES[ev.type] ?? {
          icon: Info,
          color: "text-gray-500",
          bg: "bg-gray-100 dark:bg-gray-800",
          label: ev.type,
        };
        const Icon = style.icon;

        return (
          <div key={`${ev.type}_${ev.id}`} className="relative flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full ${style.bg}`}>
                <Icon className={`h-3.5 w-3.5 ${style.color}`} />
              </div>
              {idx < timeline.length - 1 && <div className="bg-border mt-1 w-px flex-1" />}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">{style.label}</span>
                {ev.type === "status_event" && ev.metadata && (
                  <div className="flex items-center gap-1">
                    {(ev.metadata as { from_status?: string }).from_status && (
                      <>
                        <Badge variant="outline" className="text-xs">
                          {ORDER_LABELS[(ev.metadata as { from_status: string }).from_status] ??
                            (ev.metadata as { from_status: string }).from_status}
                        </Badge>
                        <span className="text-muted-foreground text-xs">→</span>
                      </>
                    )}
                    <Badge className="text-xs">
                      {ORDER_LABELS[(ev.metadata as { to_status: string }).to_status] ??
                        (ev.metadata as { to_status: string }).to_status}
                    </Badge>
                  </div>
                )}
              </div>
              <p className="mt-1 text-sm">{ev.description}</p>
              {ev.actor_user_id && (
                <p className="text-muted-foreground mt-0.5 text-xs">Par: {ev.actor_user_id}</p>
              )}
              <p className="text-muted-foreground mt-0.5 text-xs">
                {formatDate(ev.date, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
