"use client";

import { useState } from "react";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Bookmark, Plus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CustomerCollectionsPageClient() {
  const [newName, setNewName] = useState("");
  const { data, isLoading } = trpc.wishlistManagement.collections.list.useQuery({ page: 1, limit: 50 });
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
    <QueryGuard query={{ isLoading }}>
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Mes collections</h1>

      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Nouvelle collection..."
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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : !data?.items?.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <Bookmark className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>Créez votre première collection</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.items.map((col: any) => (
            <Card key={col.id} className="group">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{col.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive"
                    onClick={() => handleDelete(col.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {col.item_count ?? 0} article{(col.item_count ?? 0) > 1 ? "s" : ""}
                </p>
                {col.description && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">{col.description}</p>
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
