"use client";

import * as React from "react";
import Image from "next/image";
import { Search, Upload, Check, FileVideo, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { cn } from "@/lib/utils";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { MediaUploadDialog } from "./media-upload-dialog";
import type { MediaDTO } from "../types";

type MediaPickerDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect: (media: MediaDTO) => void;
  onMultiSelect?: (media: MediaDTO[]) => void;
  multiple?: boolean;
  trigger?: React.ReactNode;
  entity_type?: string;
  entity_id?: string;
  field?: string;
  allowed_types?: string[];
  selected_ids?: string[];
};

export function MediaPickerDialog({
  open: open_prop,
  onOpenChange: on_open_change_prop,
  onSelect,
  onMultiSelect,
  multiple = false,
  trigger,
  entity_type,
  entity_id,
  field,
  allowed_types,
  selected_ids = [],
}: MediaPickerDialogProps) {
  const [open_internal, set_open_internal] = React.useState(false);
  const open = open_prop ?? open_internal;
  const on_open_change = on_open_change_prop ?? set_open_internal;

  const [search, set_search] = React.useState("");
  const [page, set_page] = React.useState(1);
  const [selected, set_selected] = React.useState<string[]>([]);
  const [show_upload, set_show_upload] = React.useState(false);

  const { data, isLoading } = trpc.media.list.useQuery({
    search,
    limit: 20,
    page,
    kind: allowed_types?.includes("video") ? undefined : "image",
  });

  function toggle_select(id: string) {
    if (multiple) {
      set_selected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    } else {
      set_selected([id]);
    }
  }

  function handle_confirm() {
    if (!data) return;
    const items = data.items.filter((m) => selected.includes(m.id)) as MediaDTO[];
    if (multiple && onMultiSelect) {
      onMultiSelect(items);
    } else if (items[0]) {
      onSelect(items[0]);
    }
    on_open_change(false);
    set_selected([]);
  }

  function handle_upload_success(media: unknown) {
    const uploaded = media as MediaDTO;
    onSelect(uploaded as MediaDTO);
    set_show_upload(false);
    on_open_change(false);
  }

  React.useEffect(() => {
    if (!open) {
      set_selected([]);
      set_page(1);
      set_search("");
      set_show_upload(false);
    }
  }, [open]);

  return (
    <QueryGuard query={{ isLoading }}>
    <ResponsiveDialog open={open} onOpenChange={on_open_change}>
      {trigger ? <ResponsiveDialogTrigger asChild>{trigger}</ResponsiveDialogTrigger> : null}
      <ResponsiveDialogContent className="sm:max-w-3xl">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {show_upload ? "Importer un fichier" : "Sélectionner un média"}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {show_upload
              ? "Importez un nouveau fichier dans la médiathèque."
              : "Choisissez un fichier depuis la médiathèque."}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        {show_upload ? (
          <div className="space-y-4">
            <MediaUploadDialog
              open={show_upload}
              onOpenChange={set_show_upload}
              onSuccess={handle_upload_success}
              entity_type={entity_type}
              entity_id={entity_id}
              field={field}
            />
            <Button variant="outline" onClick={() => set_show_upload(false)}>
              Retour à la médiathèque
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => {
                    set_search(e.target.value);
                    set_page(1);
                  }}
                />
              </div>
              <Button variant="outline" onClick={() => set_show_upload(true)}>
                <Upload />
                Importer
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            ) : !data || data.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">Aucun fichier trouvé</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
                {data.items.map((item) => {
                  const is_selected = selected.includes(item.id);
                  const is_disabled = !multiple && selected.length > 0 && !is_selected;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={is_disabled}
                      onClick={() => toggle_select(item.id)}
                      className={cn(
                        "group bg-muted relative aspect-square overflow-hidden rounded-lg border transition-all",
                        is_selected && "ring-primary ring-2 ring-offset-2",
                        is_disabled && "cursor-not-allowed opacity-40",
                        !is_selected && !is_disabled && "hover:ring-primary/50 hover:ring-2",
                      )}
                    >
                      {item.kind === "image" ? (
                        <Image
                          src={item.url}
                          alt={item.alt ?? item.original_name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : item.kind === "video" ? (
                        <div className="flex h-full items-center justify-center">
                          <FileVideo className="text-muted-foreground size-8" />
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <FileText className="text-muted-foreground size-8" />
                        </div>
                      )}
                      {is_selected && (
                        <div className="bg-primary text-primary-foreground absolute top-1 right-1 flex size-5 items-center justify-center rounded-full">
                          <Check className="size-3" />
                        </div>
                      )}
                      <div className="from-background/80 absolute right-0 bottom-0 left-0 bg-gradient-to-t to-transparent p-1">
                        <p className="truncate text-[10px] font-medium text-white drop-shadow-md">
                          {item.original_name}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {data && data.meta.total_pages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => set_page((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Précédent
                </Button>
                <span className="text-muted-foreground text-xs">
                  {page} / {data.meta.total_pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => set_page((p) => p + 1)}
                  disabled={!data.meta.has_more}
                >
                  Suivant
                </Button>
              </div>
            )}

            {selected.length > 0 && (
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => set_selected([])}>
                  Effacer
                </Button>
                <Button onClick={handle_confirm}>
                  {multiple ? `Confirmer (${selected.length})` : "Confirmer"}
                </Button>
              </div>
            )}
          </div>
        )}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
    </QueryGuard>
  );
}
