"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Bookmark, Plus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useUndoAction } from "@/hooks/use-undo-action";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CollectionsPageSkeleton } from "./collections-page-skeleton";
import { Empty, EmptyHeader, EmptyTitle, EmptyMedia } from "@/components/ui/empty";

export function CustomerCollectionsPageClient() {
  const t = useTranslations("wishlist");
  const [newName, setNewName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const { data, isLoading, error } = trpc.wishlistManagement.collections.list.useQuery({
    page: 1,
    limit: 50,
  });
  const { execute_with_undo } = useUndoAction();
  const utils = trpc.useUtils();
  const createMut = trpc.wishlistManagement.collections.create.useMutation();
  const deleteMut = trpc.wishlistManagement.collections.delete.useMutation({
    onSuccess: () => {
      execute_with_undo({
        description: deleteTarget?.name ?? "",
        execute: () => {
          utils.wishlistManagement.collections.list.invalidate();
        },
        rollback: () => {
          utils.wishlistManagement.collections.list.invalidate();
        },
        undoTimeoutMs: 8_000,
      });
    },
    onError: (err) => toast.error(err.message),
  });

  async function handleCreate() {
    if (!newName.trim()) return;
    try {
      await createMut.mutateAsync({ name: newName.trim() });
      toast.success(t("collection_created"));
      setNewName("");
      utils.wishlistManagement.collections.list.invalidate();
    } catch {
      toast.error(t("collection_created"));
    }
  }

  async function handleDelete(id: string) {
    await deleteMut.mutateAsync({ id });
  }

  return (
    <QueryGuard query={{ isLoading, error }} loadingFallback={<CollectionsPageSkeleton />}>
      <div className="container mx-auto py-6">
        <h1 className="mb-6 text-2xl font-bold">{t("my_collections")}</h1>

        <div className="mb-6 flex gap-2">
          <Input
            placeholder={t("new_collection_placeholder")}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button onClick={handleCreate} disabled={!newName.trim() || createMut.isPending}>
            {createMut.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {t("create")}
          </Button>
        </div>

        {!data?.items?.length ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Bookmark className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t("create_first_collection")}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((col: { id: string; name: string; item_count?: number; description?: string | null }) => (
              <Card key={col.id} className="group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{col.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-8 w-8 opacity-0 group-hover:opacity-100"
                      onClick={() => setDeleteTarget({ id: col.id, name: col.name })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {col.item_count ?? 0}{" "}
                    {(col.item_count ?? 0) === 1 ? t("article") : t("articles")}
                  </p>
                  {col.description && (
                    <p className="text-muted-foreground mt-1 truncate text-xs">{col.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirm_delete_collection_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirm_delete_collection_description", {
                name: deleteTarget?.name ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("edit")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteTarget) {
                  await handleDelete(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </QueryGuard>
  );
}
