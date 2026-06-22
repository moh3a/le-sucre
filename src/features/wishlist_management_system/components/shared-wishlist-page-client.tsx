"use client";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";

export function SharedWishlistPageClient({ token }: { token: string }) {
  const { data, isLoading, error } = trpc.wishlistManagement.sharedWishlists.getByToken.useQuery({ token });

  if (error || !data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-lg">Cette liste n&apos;est pas accessible</p>
        <p className="text-sm">Le lien a peut-être expiré ou a été révoqué</p>
      </div>
    );
  }

  const { wishlist, items } = data as any;

  return (
    <QueryGuard query={{ isLoading }}>
    <div className="container mx-auto py-6 max-w-3xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{wishlist.name}</h1>
        {wishlist.description && (
          <p className="text-muted-foreground mt-2">{wishlist.description}</p>
        )}
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Cette liste est vide</p>
        ) : (
          items.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 border rounded-lg"
            >
              {item.product?.media?.[0]?.url && (
                <img
                  src={item.product.media[0].url}
                  alt=""
                  className="h-16 w-16 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {item.product?.translations?.[0]?.name ?? item.product_id}
                </p>
                <p className="text-sm text-muted-foreground">Qté: {item.quantity}</p>
              </div>
              {item.current_price && (
                <p className="font-semibold">{item.current_price} DA</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
    </QueryGuard>
  );
}
