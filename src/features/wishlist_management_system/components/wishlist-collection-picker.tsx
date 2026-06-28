"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Plus, Bookmark, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useWishlist, useCollections } from "../hooks/use-wishlist";

interface WishlistCollectionPickerProps {
  productId: string;
  variantId?: string | null;
  wishlists: Array<{ id: string; name: string }>;
  collections: Array<{ id: string; name: string }>;
  children?: React.ReactNode;
}

export function WishlistCollectionPicker({
  productId,
  variantId,
  wishlists,
  collections,
  children,
}: WishlistCollectionPickerProps) {
  const t = useTranslations("wishlist");
  const [open, setOpen] = useState(false);
  const [wishlistId, setWishlistId] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [newWishlistName, setNewWishlistName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { addItem, createWishlist } = useWishlist();
  const { addItem: addCollectionItem, create: createCollection } = useCollections();

  async function handleAddToWishlist() {
    if (!wishlistId) return;
    setIsAdding(true);
    try {
      await addItem({ wishlist_id: wishlistId, product_id: productId, variant_id: variantId });
      setOpen(false);
    } finally {
      setIsAdding(false);
    }
  }

  async function handleAddToCollection() {
    if (!collectionId) return;
    setIsAdding(true);
    try {
      await addCollectionItem({ collection_id: collectionId, product_id: productId, variant_id: variantId });
      setOpen(false);
    } finally {
      setIsAdding(false);
    }
  }

  async function handleCreateAndAdd() {
    if (!newWishlistName) return;
    setIsAdding(true);
    try {
      const wl = await createWishlist({ name: newWishlistName });
      await addItem({ wishlist_id: wl.id, product_id: productId, variant_id: variantId });
      setOpen(false);
      setNewWishlistName("");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="outline" size="sm">
            <Bookmark className="h-4 w-4 mr-2" />
            {t("save")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("add_to_list")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("wishlist")}</label>
            <Select value={wishlistId} onValueChange={setWishlistId}>
              <SelectTrigger>
                <SelectValue placeholder={t("choose_list")} />
              </SelectTrigger>
              <SelectContent>
                {wishlists.map((wl) => (
                  <SelectItem key={wl.id} value={wl.id}>{wl.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              size="sm"
              className="w-full mt-2"
              onClick={handleAddToWishlist}
              disabled={!wishlistId || isAdding}
            >
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {t("add")}
            </Button>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">{t("or_create_new")}</p>
            <div className="flex gap-2">
              <Input
                placeholder={t("list_name")}
                value={newWishlistName}
                onChange={(e) => setNewWishlistName(e.target.value)}
              />
              <Button onClick={handleCreateAndAdd} disabled={!newWishlistName || isAdding}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <label className="text-sm font-medium">{t("collection")}</label>
            <Select value={collectionId} onValueChange={setCollectionId}>
              <SelectTrigger>
                <SelectValue placeholder={t("choose_collection")} />
              </SelectTrigger>
              <SelectContent>
                {collections.map((col) => (
                  <SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              size="sm"
              className="w-full mt-2"
              onClick={handleAddToCollection}
              disabled={!collectionId || isAdding}
            >
              {t("add_to_collection")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
