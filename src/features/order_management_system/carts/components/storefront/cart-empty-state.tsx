"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

interface CartEmptyStateProps {
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCta?: () => void;
}

export function CartEmptyState({
  title = "Votre panier est vide",
  description = "Découvrez nos produits et ajoutez vos articles préférés.",
  ctaLabel = "Continuer mes achats",
  ctaHref = "/",
  onCta,
}: CartEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-20">
      <ShoppingCart className="text-muted-foreground/30 h-16 w-16" aria-hidden="true" />
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
      {onCta ? (
        <Button onClick={onCta}>{ctaLabel}</Button>
      ) : (
        <Button asChild>
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      )}
    </div>
  );
}
