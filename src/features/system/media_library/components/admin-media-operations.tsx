"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Settings, RefreshCw, Plus, Trash2 } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import type { MediaUsageDTO } from "../types";

type MediaOperationsDialogProps = {
  media_id: string;
  trigger?: React.ReactNode;
};

export function MediaOperationsDialog({ media_id, trigger }: MediaOperationsDialogProps) {
  const t = useTranslations("media");
  const [open, set_open] = React.useState(false);
  const [entity_type, set_entity_type] = React.useState("");
  const [entity_id, set_entity_id] = React.useState("");
  const is_mobile = useIsMobile();
  const utils = trpc.useUtils();

  const { data: usage_data, isLoading } = trpc.media.usages.useQuery(
    { id: media_id },
    { enabled: open },
  );

  const optimize_mutation = trpc.media.optimize.useMutation({
    onSuccess: () => {
      toast.success(t("optimized"));
      utils.media.usages.invalidate({ id: media_id });
    },
    onError: (e) => toast.error(e.message),
  });

  const regenerate_mutation = trpc.media.regenerate.useMutation({
    onSuccess: () => {
      toast.success(t("thumbnails_regenerated"));
      utils.media.usages.invalidate({ id: media_id });
    },
    onError: (e) => toast.error(e.message),
  });

  const attach_mutation = trpc.media.attach.useMutation({
    onSuccess: () => {
      toast.success(t("attached"));
      set_entity_type("");
      set_entity_id("");
      utils.media.usages.invalidate({ id: media_id });
    },
    onError: (e) => toast.error(e.message),
  });

  const detach_mutation = trpc.media.detach.useMutation({
    onSuccess: () => {
      toast.success(t("detached"));
      utils.media.usages.invalidate({ id: media_id });
    },
    onError: (e) => toast.error(e.message),
  });

  function handle_attach(e: React.FormEvent) {
    e.preventDefault();
    if (!entity_type || !entity_id) return;
    attach_mutation.mutate({ media_id, entity_type, entity_id });
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={set_open}>
      {trigger ? <ResponsiveDialogTrigger asChild>{trigger}</ResponsiveDialogTrigger> : null}
      <ResponsiveDialogContent className={is_mobile ? "" : "sm:max-w-lg"}>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{t("operations_title")}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {t("operations_description")}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="space-y-6 py-2">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => optimize_mutation.mutate({ id: media_id })}
              disabled={optimize_mutation.isPending}
            >
              <Settings className="mr-2 size-4" />
              {t("optimize")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => regenerate_mutation.mutate({ id: media_id })}
              disabled={regenerate_mutation.isPending}
            >
              <RefreshCw className="mr-2 size-4" />
              {t("regenerate_thumbnails")}
            </Button>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">{t("usage_title")}</h4>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : usage_data && usage_data.usages.length > 0 ? (
              <div className="space-y-2">
                {(usage_data.usages as MediaUsageDTO[]).map((usage) => (
                  <div
                    key={usage.id}
                    className="flex items-center justify-between rounded-md border p-2 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{usage.entity_type}</p>
                      <p className="text-muted-foreground truncate text-xs">{usage.entity_id}</p>
                      {usage.field && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {usage.field}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0 text-destructive"
                      onClick={() => detach_mutation.mutate({ usage_id: usage.id })}
                      disabled={detach_mutation.isPending}
                      title={t("detach")}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">{t("no_usages")}</p>
            )}
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">{t("attach_to_entity")}</h4>
            <form onSubmit={handle_attach} className="space-y-3">
              <div>
                <Label htmlFor="entity_type">{t("entity_type")}</Label>
                <Input
                  id="entity_type"
                  value={entity_type}
                  onChange={(e) => set_entity_type(e.target.value)}
                  placeholder={t("entity_type_placeholder")}
                  required
                />
              </div>
              <div>
                <Label htmlFor="entity_id">{t("entity_id")}</Label>
                <Input
                  id="entity_id"
                  value={entity_id}
                  onChange={(e) => set_entity_id(e.target.value)}
                  placeholder={t("entity_id_placeholder")}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={attach_mutation.isPending}>
                <Plus />
                {t("attach")}
              </Button>
            </form>
          </div>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
