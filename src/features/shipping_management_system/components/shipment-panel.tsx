"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalLink, Plus, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/format";

const PROVIDERS = ["yalidine", "dhl", "fedex", "ups", "ems"] as const;

export function ShipmentPanel({ order_id }: { order_id: string }) {
  const [provider, setProvider] = useState<(typeof PROVIDERS)[number]>("yalidine");
  const [weight_kg, setWeightKg] = useState("1");

  const { data, isLoading, refetch, isError } = trpc.shipping.trackingByOrder.useQuery(
    { order_id },
    { retry: false },
  );

  const create_mutation = trpc.shipping.create.useMutation({
    onSuccess: () => {
      toast.success("Expédition créée");
      void refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const sync_mutation = trpc.shipping.sync.useMutation({
    onSuccess: () => {
      toast.success("Suivi synchronisé");
      void refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Chargement de l&apos;expédition…</p>;
  }

  if (isError || !data) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Créer une expédition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={provider} onValueChange={(v) => setProvider(v as typeof provider)}>
            <SelectTrigger>
              <SelectValue placeholder="Transporteur" />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            min="0.1"
            step="0.1"
            value={weight_kg}
            onChange={(e) => setWeightKg(e.target.value)}
            placeholder="Poids (kg)"
          />
          <Button
            disabled={create_mutation.isPending}
            onClick={() =>
              create_mutation.mutate({
                order_id,
                provider,
                weight_kg: Number(weight_kg),
              })
            }
          >
            <Plus className="size-4" />
            Créer l&apos;expédition
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { shipment, tracking_events } = data;

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Expédition</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/console/shipping/${shipment.id}`}>Voir détail</Link>
          </Button>
          {shipment.tracking_url ? (
            <Button variant="outline" size="sm" asChild>
              <a href={shipment.tracking_url} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
              </a>
            </Button>
          ) : null}
          <Button
            size="sm"
            disabled={!shipment.tracking_number || sync_mutation.isPending}
            onClick={() => sync_mutation.mutate({ shipment_id: shipment.id })}
          >
            <RefreshCcw className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{shipment.provider}</Badge>
          <Badge>{shipment.status}</Badge>
          <Badge variant="secondary">{shipment.delivery_status}</Badge>
        </div>
        <p className="font-mono text-xs">{shipment.tracking_number ?? "Sans numéro de suivi"}</p>
        {tracking_events.slice(0, 3).map((event) => (
          <div key={event.id} className="text-muted-foreground border-l pl-3">
            <p className="text-foreground font-medium">{event.status}</p>
            <p className="text-xs">
              {formatDate(event.occurred_at, {
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
