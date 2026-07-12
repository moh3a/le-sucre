"use client";

import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useFavorites } from "../hooks/use-wishlist";
import { trpc } from "@/components/providers/app-providers";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
}

export function WishlistButton({
  productId,
  className,
  size = "default",
  showLabel = false,
}: WishlistButtonProps) {
  const t = useTranslations("wishlist");
  const { addFavorite, removeFavorite } = useFavorites();
  const [isPending, setIsPending] = useState(false);

  const checkQuery = trpc.wishlistManagement.favorites.check.useQuery(
    { product_id: productId },
    { enabled: !!productId },
  );
  const isFavorited = !!checkQuery.data;
  const favoriteId = checkQuery.data?.id ?? null;

  async function handleToggle() {
    setIsPending(true);
    try {
      if (isFavorited && favoriteId) {
        await removeFavorite(favoriteId);
        toast.success(t("favorite_removed"));
      } else {
        await addFavorite({ product_id: productId });
        toast.success(t("favorite_added"));
      }
      checkQuery.refetch();
    } catch {
      toast.error(isFavorited ? t("favorite_removed") : t("favorite_added"));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size={size}
      className={cn("group", isFavorited && "text-red-500 hover:text-red-600", className)}
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isFavorited ? t("remove_from_favorites") : t("add_to_favorites")}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFavorited ? (
        <Heart className="h-4 w-4 fill-current" />
      ) : (
        <Heart className="h-4 w-4" />
      )}
      {showLabel && (
        <span className="ml-2">{isFavorited ? t("favorite") : t("add_to_favorites")}</span>
      )}
    </Button>
  );
}
