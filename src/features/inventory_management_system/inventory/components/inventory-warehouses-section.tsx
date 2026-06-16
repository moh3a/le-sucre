"use client";

import { useState } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import { Plus, Pencil, MapPin, Phone, Mail, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/components/providers/app-providers";
import { formatDate } from "@/lib/format";
import { InventoryWarehouseDialog } from "./inventory-warehouse-dialog";
import type { WarehouseRow } from "../../warehouses/types";

export function InventoryWarehousesSection() {
  const [page] = useQueryState("whPage", parseAsInteger.withDefault(1));
  const [dialog_open, set_dialog_open] = useState(false);
  const [editing_warehouse, set_editing_warehouse] = useState<WarehouseRow | null>(null);

  const { data, isLoading } = trpc.warehouses.list.useQuery({ page, limit: 50, include_inactive: true });
  const utils = trpc.useUtils();

  const toggle_active = trpc.warehouses.update.useMutation({
    onSuccess: async () => {
      toast.success("Statut mis à jour");
      await utils.warehouses.list.invalidate();
      await utils.warehouses.listAllActive.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const warehouses = data?.items ?? [];

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {data?.meta.total_records ?? 0} entrepôt(s) configuré(s)
          </p>
          <Button onClick={() => { set_editing_warehouse(null); set_dialog_open(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel entrepôt
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader><div className="bg-muted h-5 w-32 rounded" /></CardHeader>
                <CardContent><div className="bg-muted h-4 w-48 rounded" /></CardContent>
              </Card>
            ))}
          </div>
        ) : warehouses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">Aucun entrepôt configuré</p>
              <Button onClick={() => { set_editing_warehouse(null); set_dialog_open(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Créer un entrepôt
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {warehouses.map((wh) => (
              <Card key={wh.id} className={wh.is_active ? "" : "opacity-60"}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{wh.name}</CardTitle>
                      <Badge variant="outline" className="mt-1 font-mono text-xs">
                        {wh.slug}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => { set_editing_warehouse(wh); set_dialog_open(true); }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          toggle_active.mutate({ id: wh.id, is_active: !wh.is_active })
                        }
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {wh.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="text-muted-foreground h-3.5 w-3.5" />
                      <span>{wh.location}</span>
                    </div>
                  )}
                  {wh.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="text-muted-foreground h-3.5 w-3.5" />
                      <span>{wh.phone}</span>
                    </div>
                  )}
                  {wh.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="text-muted-foreground h-3.5 w-3.5" />
                      <span>{wh.email}</span>
                    </div>
                  )}
                  <p className="text-muted-foreground pt-2 text-xs">
                    Créé le {formatDate(wh.created_at)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <InventoryWarehouseDialog
        warehouse={editing_warehouse}
        open={dialog_open}
        onOpenChange={(open) => {
          set_dialog_open(open);
          if (!open) set_editing_warehouse(null);
        }}
      />
    </>
  );
}
