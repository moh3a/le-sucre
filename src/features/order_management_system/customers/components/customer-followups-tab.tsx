"use client";

import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { Phone, Plus, CheckCircle2 } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  completed: "Terminé",
  cancelled: "Annulé",
  rescheduled: "Reporté",
};

const STATUS_BADGES: Record<string, "destructive" | "secondary" | "default" | "outline"> = {
  pending: "outline",
  completed: "default",
  cancelled: "destructive",
  rescheduled: "secondary",
};

type CustomerFollowupsTabProps = { user_id: string };

export function CustomerFollowupsTab({ user_id }: CustomerFollowupsTabProps) {
  const { data: follow_ups, isLoading, refetch } = trpc.operations.customerGetFollowUpsByUser.useQuery({ user_id });
  const [show_form, set_show_form] = useState(false);
  const [fu_type, set_fu_type] = useState("follow_up");
  const [title, set_title] = useState("");
  const [scheduled_at, set_scheduled_at] = useState("");

  const create = trpc.operations.customerCreateFollowUp.useMutation({
    onSuccess: () => {
      refetch();
      set_show_form(false);
      set_title("");
      set_scheduled_at("");
      toast.success("Relance créée");
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  const complete = trpc.operations.customerCompleteFollowUp.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Relance terminée");
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Relances et suivis</h3>
        <Button size="sm" onClick={() => set_show_form(!show_form)}>
          <Plus className="mr-1 h-3 w-3" />
          Planifier une relance
        </Button>
      </div>

      {show_form && (
        <Card className="border-blue-200">
          <CardContent className="space-y-3 pt-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">Type</label>
              <select
                className="border-input bg-background ring-offset-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                value={fu_type}
                onChange={(e) => set_fu_type(e.target.value)}
              >
                <option value="callback">Rappel</option>
                <option value="follow_up">Suivi</option>
                <option value="reminder">Rappel automatique</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Titre</label>
              <input
                className="border-input bg-background ring-offset-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                value={title}
                onChange={(e) => set_title(e.target.value)}
                placeholder="Objet de la relance..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Date programmée</label>
              <input
                type="datetime-local"
                className="border-input bg-background ring-offset-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                value={scheduled_at}
                onChange={(e) => set_scheduled_at(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => set_show_form(false)}>
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  create.mutate({
                    user_id,
                    follow_up_type: fu_type as "callback" | "follow_up" | "reminder",
                    title,
                    scheduled_at: new Date(scheduled_at).toISOString(),
                  })
                }
                disabled={!title.trim() || !scheduled_at || create.isPending}
              >
                Planifier
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(follow_ups?.length ?? 0) === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">Aucune relance planifiée</p>
      ) : (
        <div className="space-y-2">
          {(follow_ups ?? []).map((fu) => (
            <div key={fu.id} className="rounded-md border p-3 text-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{fu.title}</span>
                  <Badge variant={STATUS_BADGES[fu.status] ?? "outline"}>
                    {STATUS_LABELS[fu.status] ?? fu.status}
                  </Badge>
                </div>
                {fu.status === "pending" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => complete.mutate({ id: fu.id, result_notes: "Terminé" })}
                    disabled={complete.isPending}
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Terminer
                  </Button>
                )}
              </div>
              {fu.description && <p className="mt-1 text-muted-foreground">{fu.description}</p>}
              <p className="mt-1 text-xs text-muted-foreground">
                Prévue le {formatDate(fu.scheduled_at, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
