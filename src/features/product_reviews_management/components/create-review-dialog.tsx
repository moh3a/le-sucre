"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";

export function CreateReviewDialog() {
  const [open, setOpen] = React.useState(false);
  const [product_id, setProductId] = React.useState("");
  const [rating, setRating] = React.useState("5");
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");

  const utils = trpc.useUtils();

  const create = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success("Avis créé avec succès");
      setOpen(false);
      setProductId("");
      setRating("5");
      setTitle("");
      setBody("");
      void utils.reviews.adminList.invalidate();
      void utils.reviews.adminStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({
      product_id,
      rating: Number(rating),
      title: title || undefined,
      body,
      locale: "fr",
    });
  }

  return (
    <QueryGuard mutation={create}>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Nouvel avis
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un avis</DialogTitle>
          <DialogDescription>
            Ajouter un avis client manuellement.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handle_submit} className="space-y-4">
          <div className="space-y-2">
            <Label>ID Produit</Label>
            <Input value={product_id} onChange={(e) => setProductId(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Note</Label>
            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 4, 3, 2, 1].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} étoile{n > 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Titre (optionnel)</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Commentaire</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={create.isPending}>
            <Star />
            Publier l&apos;avis
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
