"use client";

import { useState, useCallback } from "react";
import { Plus, ShieldBan } from "lucide-react";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BlacklistTable } from "./blacklist-table";
import { BlacklistAddDialog } from "./blacklist-add-dialog";

export function BlacklistPageClient() {
  const [page, setPage] = useState(1);
  const [dialog_open, set_dialog_open] = useState(false);
  const { data, isLoading, refetch } = trpc.blacklist.list.useQuery({ page, limit: 20 });
  const toggle_mutation = trpc.blacklist.toggle.useMutation({
    onSuccess: () => refetch(),
  });
  const remove_mutation = trpc.blacklist.remove.useMutation({
    onSuccess: () => refetch(),
  });

  const handle_toggle = useCallback(
    async (id: string) => {
      await toggle_mutation.mutateAsync({ id });
    },
    [toggle_mutation],
  );
  const handle_remove = useCallback(
    async (id: string) => {
      await remove_mutation.mutateAsync({ id });
    },
    [remove_mutation],
  );
  const handle_added = useCallback(() => {
    set_dialog_open(false);
    refetch();
  }, [refetch]);

  return (
    <ConsolePageShell
      title="Liste noire IP"
      subtitle="Gérez les adresses IP bloquées pour sécuriser votre plateforme"
      actions={
        <Button onClick={() => set_dialog_open(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Bloquer une IP
        </Button>
      }
    >
      <BlacklistAddDialog
        open={dialog_open}
        on_open_change={set_dialog_open}
        on_added={handle_added}
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldBan className="h-5 w-5" />
            Adresses IP bloquées
          </CardTitle>
          <CardDescription>
            Les adresses IP listées ci-dessous se verront refuser l&apos;accès à l&apos;ensemble de
            l&apos;API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-4 text-sm">Chargement de la liste noire…</p>
          ) : !data?.entries || data.entries.length === 0 ? (
            <p className="text-muted-foreground py-4 text-sm">
              Aucune adresse IP bloquée pour le moment.
            </p>
          ) : (
            <>
              <BlacklistTable
                entries={data.entries}
                on_toggle={handle_toggle}
                on_remove={handle_remove}
              />
              {data.total_pages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">
                    Page {data.page} / {data.total_pages} ({data.total} entrées)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= data.total_pages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </ConsolePageShell>
  );
}
