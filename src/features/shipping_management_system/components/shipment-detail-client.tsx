"use client";

import Link from "next/link";
import { ExternalLink, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

export function ShipmentDetailClient({ shipment_id }: { shipment_id: string }) {
  const utils = trpc.useUtils();

  const { data, isLoading, refetch, error } = trpc.shipping.adminGetDetail.useQuery({ shipment_id });

  const sync_mutation = trpc.shipping.sync.useMutation({
    onSuccess: () => {
      toast.success("Suivi synchronisé");
      void refetch();
      void utils.shipping.adminList.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  if (!data) {
    return <p className="text-muted-foreground text-sm">Expédition introuvable.</p>;
  }

  const { shipment, tracking_events } = data;

  return (
    <QueryGuard query={{ isLoading, error }}>
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Informations</CardTitle>
          <div className="flex gap-2">
            {shipment.tracking_url ? (
              <Button variant="outline" size="sm" asChild>
                <a href={shipment.tracking_url} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  Suivi transporteur
                </a>
              </Button>
            ) : null}
            <Button
              size="sm"
              disabled={!shipment.tracking_number || sync_mutation.isPending}
              onClick={() => sync_mutation.mutate({ shipment_id })}
            >
              <RefreshCcw className="size-4" />
              Synchroniser
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <span className="text-muted-foreground">N° suivi</span>
            <p className="font-mono">{shipment.tracking_number ?? "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Transporteur</span>
            <p>
              <Badge variant="outline">{shipment.provider}</Badge>
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Statut</span>
            <p>{shipment.status}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Livraison</span>
            <p>{shipment.delivery_status}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Commande</span>
            <p>
              <Link href={`/console/orders/${shipment.order_id}`} className="hover:underline">
                Voir la commande
              </Link>
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Destinataire</span>
            <p>
              {shipment.recipient_name} — {shipment.recipient_phone}
            </p>
          </div>
          <div className="md:col-span-2">
            <span className="text-muted-foreground">Adresse</span>
            <p>
              {shipment.address_line1}
              {shipment.address_line2 ? `, ${shipment.address_line2}` : ""}, {shipment.city},{" "}
              {shipment.country_code}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique de suivi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tracking_events.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucun événement enregistré.</p>
          ) : (
            tracking_events.map((event) => (
              <div key={event.id} className="border-primary/30 border-l-2 pl-4">
                <p className="font-medium">{event.status}</p>
                {event.description ? (
                  <p className="text-muted-foreground text-sm">{event.description}</p>
                ) : null}
                <p className="text-muted-foreground text-xs">
                  {event.location ? `${event.location} — ` : ""}
                  {formatDate(event.occurred_at, {
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
    </QueryGuard>
  );
}
