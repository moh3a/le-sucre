"use client";

import { trpc } from "@/components/providers/app-providers";
import { SaveForLaterPanel } from "./save-for-later";
import { Loader2 } from "lucide-react";

export function CustomerSavedItemsPageClient() {
  const { data, isLoading } = trpc.wishlistManagement.saveForLater.list.useQuery({ page: 1, limit: 50 });
  const utils = trpc.useUtils();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const items = (data?.items ?? []).map((item: any) => ({
    ...item,
    product: item.product ?? undefined,
  }));

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Sauvegardé pour plus tard</h1>
      {(!items || items.length === 0) ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Aucun article sauvegardé</p>
          <p className="text-sm">
            Les articles de votre panier peuvent être sauvegardés pour plus tard
          </p>
        </div>
      ) : (
        <SaveForLaterPanel
          items={items}
          onMovedToCart={() => {
            utils.wishlistManagement.saveForLater.list.invalidate();
          }}
        />
      )}
    </div>
  );
}
