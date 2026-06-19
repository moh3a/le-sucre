"use client";

import { useState } from "react";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Calendar } from "lucide-react";

export function SchedulePublishingDialog() {
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [action, setAction] = useState<"publish" | "unpublish">("publish");
  const [scheduledAt, setScheduledAt] = useState("");

  const utils = trpc.useUtils();
  const mutation = trpc.operations.productSchedulePublish.useMutation({
    onSuccess: () => {
      toast.success("Publication programmée");
      setOpen(false);
      reset();
      utils.operations.productListScheduledActions.invalidate();
      utils.operations.productGetScheduleStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function reset() {
    setProductId("");
    setAction("publish");
    setScheduledAt("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId || !scheduledAt) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    mutation.mutate({
      product_id: productId,
      action,
      scheduled_at: new Date(scheduledAt).toISOString(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Calendar className="mr-2 size-4" />
          Programmer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Programmer une publication</DialogTitle>
          <DialogDescription>
            Planifier la publication ou la dépublication d&apos;un produit.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ps_product_id">Produit *</Label>
            <Input
              id="ps_product_id"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="ID du produit"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ps_action">Action *</Label>
            <Select
              value={action}
              onValueChange={(v) => setAction(v as "publish" | "unpublish")}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publish">Publication</SelectItem>
                <SelectItem value="unpublish">Dépublication</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ps_scheduled_at">Programmé le *</Label>
            <Input
              id="ps_scheduled_at"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Programmation..." : "Programmer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
