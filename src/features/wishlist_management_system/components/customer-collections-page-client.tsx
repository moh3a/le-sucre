"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Bookmark, Plus, Loader2, Trash2 } from "lucide-react";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CollectionsPageSkeleton } from "./collections-page-skeleton";
import { Empty, EmptyHeader, EmptyTitle, EmptyMedia } from "@/components/ui/empty";

export function CustomerCollectionsPageClient() {
  const t = useTranslations("wishlist");
  const [newName, setNewName] = useState("");
  const { data, isLoading, error } = trpc.wishlistManagement.collections.list.useQuery({
    page: 1,
    limit: 50,
  });
  const createMut = trpc.wishlistManagement.collections.create.useMutation();
  const deleteMut = trpc.wishlistManagement.collections.delete.useMutation();
  const utils = trpc.useUtils();

  async function handleCreate() {
    if (!newName.trim()) return;
    await createMut.mutateAsync({ name: newName.trim() });
    setNewName("");
    utils.wishlistManagement.collections.list.invalidate();
  }

  async function handleDelete(id: string) {
    await deleteMut.mutateAsync({ id });
    utils.wishlistManagement.collections.list.invalidate();
  }

  return (
    <QueryGuard query={{ isLoading, error }} loadingFallback={<CollectionsPageSkeleton />}>
      <div className="container mx-auto py-6">
        <h1 className="mb-6 text-2xl font-bold">Mes collections</h1>

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
            Créer
          </Button>
        </div>

        {!data?.items?.length ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Bookmark className="size-6" />
              </EmptyMedia>
              <EmptyTitle>Créez votre première collection</EmptyTitle>
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
                      onClick={() => handleDelete(col.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {col.item_count ?? 0} article{(col.item_count ?? 0) > 1 ? "s" : ""}
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
    </QueryGuard>
  );
}
