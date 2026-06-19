"use client";

import { useState } from "react";
import { Heart, HeartOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useFavorites, useWishlist } from "../hooks/use-wishlist";

interface WishlistButtonProps {
  productId: string;
  isFavorited?: boolean;
  className?: string;
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
  onToggle?: (isFavorited: boolean) => void;
}

export function WishlistButton({
  productId,
  isFavorited: initialFavorited = false,
  className,
  size = "default",
  showLabel = false,
  onToggle,
}: WishlistButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const { addFavorite, removeFavorite } = useFavorites();
  const [isPending, setIsPending] = useState(false);

  async function handleToggle() {
    setIsPending(true);
    try {
      if (isFavorited) {
        // We need the favorite ID - query first
        setIsFavorited(false);
        onToggle?.(false);
      } else {
        const result = await addFavorite({ product_id: productId });
        setIsFavorited(true);
        onToggle?.(true);
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size={size}
      className={cn(
        "group",
        isFavorited && "text-red-500 hover:text-red-600",
        className,
      )}
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFavorited ? (
        <Heart className="h-4 w-4 fill-current" />
      ) : (
        <Heart className="h-4 w-4" />
      )}
      {showLabel && (
        <span className="ml-2">{isFavorited ? "Favori" : "Ajouter aux favoris"}</span>
      )}
    </Button>
  );
}
