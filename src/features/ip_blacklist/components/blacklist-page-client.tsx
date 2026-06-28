"use client";

import { useTranslations } from "next-intl";
import { useState, useCallback } from "react";
import { Plus, ShieldBan } from "lucide-react";
import { QueryGuard } from "@/components/query-guard";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BlacklistTable } from "./blacklist-table";
import { BlacklistAddDialog } from "./blacklist-add-dialog";

export function BlacklistPageClient() {
  const t = useTranslations("blacklist");
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
    <QueryGuard query={{ isLoading }}>
    <ConsolePageShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={
        <Button onClick={() => set_dialog_open(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("block_ip_button")}
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
            {t("blocked_ips_title")}
          </CardTitle>
          <CardDescription>
            {t("blocked_ips_description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-4 text-sm">{t("loading_blacklist")}</p>
          ) : !data?.entries || data.entries.length === 0 ? (
            <p className="text-muted-foreground py-4 text-sm">
              {t("no_blocked_ips")}
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
                      {t("page_info", { page: data.page, total: data.total_pages, count: data.total })}
                    </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      {t("previous")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= data.total_pages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      {t("next")}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </ConsolePageShell>
    </QueryGuard>
  );
}
