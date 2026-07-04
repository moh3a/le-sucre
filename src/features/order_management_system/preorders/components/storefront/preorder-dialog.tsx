"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "@/hooks/use-media-query";

interface PreorderDialogProps {
  productName?: string;
  skuLabel?: string;
  estimatedDate?: string;
  depositPercent?: number;
  isLoading?: boolean;
  error?: unknown;
  onSubmit?: (data: { email: string; quantity: number }) => void;
  isSubmitting?: boolean;
}

export function PreorderDialog({
  productName,
  skuLabel = "SKU",
  estimatedDate,
  depositPercent = 100,
  isLoading,
  error,
  onSubmit,
  isSubmitting,
}: PreorderDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [quantity, setQuantity] = useState(1);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const content = (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ) : error ? (
        <p className="text-destructive text-sm">Une erreur est survenue. Veuillez réessayer.</p>
      ) : (
        <>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{skuLabel}</p>
            <p className="font-medium">{productName ?? "Produit"}</p>
          </div>
          {estimatedDate && (
            <p className="text-sm">
              <span className="text-muted-foreground">Disponible le :</span>{" "}
              <span className="font-medium">{estimatedDate}</span>
            </p>
          )}
          {depositPercent < 100 && (
            <p className="text-sm text-muted-foreground">
              Acompte de {depositPercent}% requis
            </p>
          )}
          <div className="space-y-2">
            <label htmlFor="preorder-email" className="text-sm font-medium">Email</label>
            <Input
              id="preorder-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="preorder-qty" className="text-sm font-medium">Quantité</label>
            <Input
              id="preorder-qty"
              type="number"
              min={1}
              max={99}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          <Button
            className="w-full"
            disabled={!email || isSubmitting}
            onClick={() => { onSubmit?.({ email, quantity }); setOpen(false); }}
          >
            {isSubmitting ? "..." : "Confirmer la précommande"}
          </Button>
        </>
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" disabled={isLoading || !!error}>
            Précommander
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Précommander</DialogTitle>
            <DialogDescription>
              Soyez le premier à recevoir ce produit dès sa sortie.
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" disabled={isLoading || !!error}>
          Précommander
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Précommander</DrawerTitle>
          <DrawerDescription>
            Soyez le premier à recevoir ce produit dès sa sortie.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-6">{content}</div>
      </DrawerContent>
    </Drawer>
  );
}
