"use client";

import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format";
import { Ban, TriangleAlert, PauseCircle, PlayCircle, Send } from "lucide-react";

const ESCALATION_STATUS_LABELS: Record<string, string> = {
  open: "Ouvert",
  in_review: "En révision",
  resolved: "Résolu",
  dismissed: "Rejeté",
};

const ESCALATION_STATUS_BADGES: Record<string, "destructive" | "secondary" | "default" | "outline"> = {
  open: "destructive",
  in_review: "secondary",
  resolved: "default",
  dismissed: "outline",
};

const CANCELLATION_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvée",
  rejected: "Rejetée",
};

const CANCELLATION_STATUS_BADGES: Record<string, "destructive" | "secondary" | "default" | "outline"> = {
  pending: "outline",
  approved: "destructive",
  rejected: "default",
};

type OrderOpsTabProps = {
  order_id: string;
  order_status: string;
};

export function OrderOperationsTab({ order_id, order_status }: OrderOpsTabProps) {
  const utils = trpc.useUtils();

  // Holds
  const { data: holds, refetch: refetch_holds } = trpc.operations.orderGetHolds.useQuery({ order_id });
  const [hold_reason, set_hold_reason] = useState("");
  const [hold_desc, set_hold_desc] = useState("");
  const place_hold = trpc.operations.orderPlaceOnHold.useMutation({
    onSuccess: () => {
      refetch_holds();
      set_hold_reason("");
      set_hold_desc("");
      toast.success("Commande mise en attente");
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });
  const release_hold = trpc.operations.orderReleaseHold.useMutation({
    onSuccess: () => {
      refetch_holds();
      toast.success("Attente levée");
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  // Escalations
  const { data: escalations, refetch: refetch_esc } = trpc.operations.orderGetEscalations.useQuery({ order_id });
  const [esc_reason, set_esc_reason] = useState("");
  const [esc_priority, set_esc_priority] = useState<"low" | "normal" | "high" | "urgent">("normal");
  const escalate = trpc.operations.orderEscalate.useMutation({
    onSuccess: () => {
      refetch_esc();
      set_esc_reason("");
      toast.success("Escalade créée");
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });
  const resolve_esc = trpc.operations.orderResolveEscalation.useMutation({
    onSuccess: () => {
      refetch_esc();
      toast.success("Escalade résolue");
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  // Cancellation requests
  const { data: cancellations, refetch: refetch_cancel } = trpc.operations.orderGetCancellationRequests.useQuery({ order_id });
  const [cancel_reason, set_cancel_reason] = useState("");
  const request_cancel = trpc.operations.orderRequestCancellation.useMutation({
    onSuccess: () => {
      refetch_cancel();
      set_cancel_reason("");
      toast.success("Demande d'annulation créée");
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });
  const review_cancel = trpc.operations.orderReviewCancellation.useMutation({
    onSuccess: () => {
      refetch_cancel();
      utils.orders.adminGet.invalidate({ order_id });
      toast.success("Demande d'annulation révisée");
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  const active_hold = holds?.find((h) => h.is_active);

  return (
    <div className="space-y-6">
      {/* ── Holds ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PauseCircle className="h-4 w-4" />
            Mise en attente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {active_hold ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Commande en attente</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Motif: {active_hold.reason}
                  </p>
                  {active_hold.description && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      {active_hold.description}
                    </p>
                  )}
                  <p className="text-xs text-amber-500">
                    Depuis le {formatDate(active_hold.created_at, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    release_hold.mutate({ hold_id: active_hold.id })
                  }
                  disabled={release_hold.isPending}
                >
                  <PlayCircle className="mr-1 h-3 w-3" />
                  Lever l&apos;attente
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <Label>Motif</Label>
                <select
                  className="border-input bg-background ring-offset-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                  value={hold_reason}
                  onChange={(e) => set_hold_reason(e.target.value)}
                >
                  <option value="">Sélectionner un motif</option>
                  <option value="payment_verification">Vérification de paiement</option>
                  <option value="fraud_check">Contrôle anti-fraude</option>
                  <option value="customer_request">Demande client</option>
                  <option value="stock_issue">Problème de stock</option>
                  <option value="address_verification">Vérification d&apos;adresse</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <Label>Description (optionnelle)</Label>
                <Textarea
                  value={hold_desc}
                  onChange={(e) => set_hold_desc(e.target.value)}
                  rows={2}
                  placeholder="Détails supplémentaires..."
                />
              </div>
              <Button
                size="sm"
                disabled={!hold_reason || place_hold.isPending}
                onClick={() => place_hold.mutate({ order_id, reason: hold_reason, description: hold_desc || undefined })}
              >
                <PauseCircle className="mr-1 h-3 w-3" />
                Mettre en attente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Escalations ───────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TriangleAlert className="h-4 w-4" />
            Escalades
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label>Créer une escalade</Label>
              <select
                className="border-input bg-background ring-offset-background mb-1 flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                value={esc_reason}
                onChange={(e) => set_esc_reason(e.target.value)}
              >
                <option value="">Motif</option>
                <option value="payment_dispute">Litige paiement</option>
                <option value="customer_complaint">Réclamation client</option>
                <option value="delivery_issue">Problème livraison</option>
                <option value="technical">Technique</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div className="w-32 space-y-1">
              <Label>Priorité</Label>
              <select
                className="border-input bg-background ring-offset-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                value={esc_priority}
                onChange={(e) => set_esc_priority(e.target.value as "low" | "normal" | "high" | "urgent")}
              >
                <option value="low">Basse</option>
                <option value="normal">Normale</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <Button
              size="sm"
              disabled={!esc_reason || escalate.isPending}
              onClick={() => escalate.mutate({ order_id, reason: esc_reason, priority: esc_priority })}
            >
              <TriangleAlert className="mr-1 h-3 w-3" />
              Escalader
            </Button>
          </div>

          {(escalations?.length ?? 0) > 0 && (
            <div className="divide-y rounded-md border text-sm">
              {escalations?.map((esc) => (
                <div key={esc.id} className="flex items-center justify-between px-3 py-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={ESCALATION_STATUS_BADGES[esc.status]}>
                        {ESCALATION_STATUS_LABELS[esc.status] ?? esc.status}
                      </Badge>
                      <span className="text-xs font-medium">{esc.reason}</span>
                    </div>
                    {esc.description && (
                      <p className="text-muted-foreground mt-1 text-xs">{esc.description}</p>
                    )}
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {formatDate(esc.created_at, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {(esc.status === "open" || esc.status === "in_review") && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => resolve_esc.mutate({ id: esc.id, resolution: "Résolu manuellement" })}
                      disabled={resolve_esc.isPending}
                    >
                      Résoudre
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Cancellation Requests ──────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-4 w-4" />
            Annulations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label>Demander une annulation</Label>
              <select
                className="border-input bg-background ring-offset-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                value={cancel_reason}
                onChange={(e) => set_cancel_reason(e.target.value)}
              >
                <option value="">Motif</option>
                <option value="customer_request">Demande client</option>
                <option value="payment_issue">Problème de paiement</option>
                <option value="out_of_stock">Rupture de stock</option>
                <option value="fraud">Fraude</option>
                <option value="duplicate">Doublon</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <Button
              size="sm"
              disabled={!cancel_reason || request_cancel.isPending}
              onClick={() => request_cancel.mutate({ order_id, reason: cancel_reason })}
            >
              <Ban className="mr-1 h-3 w-3" />
              Demander l&apos;annulation
            </Button>
          </div>

          {(cancellations?.length ?? 0) > 0 && (
            <div className="divide-y rounded-md border text-sm">
              {cancellations?.map((cr) => (
                <div key={cr.id} className="flex items-center justify-between px-3 py-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={CANCELLATION_STATUS_BADGES[cr.status]}>
                        {CANCELLATION_STATUS_LABELS[cr.status] ?? cr.status}
                      </Badge>
                      <span className="text-xs">{cr.reason}</span>
                    </div>
                    {cr.description && (
                      <p className="text-muted-foreground mt-1 text-xs">{cr.description}</p>
                    )}
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {formatDate(cr.created_at, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {cr.status === "pending" && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 text-xs"
                        onClick={() => review_cancel.mutate({ cancellation_request_id: cr.id, status: "approved" })}
                        disabled={review_cancel.isPending}
                      >
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 text-xs"
                        onClick={() => review_cancel.mutate({ cancellation_request_id: cr.id, status: "rejected" })}
                        disabled={review_cancel.isPending}
                      >
                        Rejeter
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
