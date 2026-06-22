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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { QueryGuard } from "@/components/query-guard";

export function CreateSupportCaseDialog() {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("normal");
  const [assignedTo, setAssignedTo] = useState("");

  const utils = trpc.useUtils();
  const mutation = trpc.operations.customerCreateCase.useMutation({
    onSuccess: () => {
      toast.success("Cas de support créé");
      setOpen(false);
      reset();
      utils.operations.customerListCases.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function reset() {
    setUserId("");
    setOrderId("");
    setSubject("");
    setDescription("");
    setCategory("general");
    setPriority("normal");
    setAssignedTo("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject || !description) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    mutation.mutate({
      user_id: userId || null,
      order_id: orderId || null,
      subject,
      description,
      category,
      priority: priority as "low" | "normal" | "high" | "urgent",
      assigned_to_user_id: assignedTo || undefined,
    });
  }

  return (
    <QueryGuard mutation={mutation}>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          Nouveau cas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Créer un cas de support</DialogTitle>
          <DialogDescription>
            Ouvrir un nouveau cas de support client.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sc_subject">Sujet *</Label>
            <Input
              id="sc_subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Objet du cas"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sc_description">Description *</Label>
            <Textarea
              id="sc_description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description détaillée"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sc_category">Catégorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Général</SelectItem>
                  <SelectItem value="shipping">Livraison</SelectItem>
                  <SelectItem value="payment">Paiement</SelectItem>
                  <SelectItem value="product">Produit</SelectItem>
                  <SelectItem value="return">Retour</SelectItem>
                  <SelectItem value="complaint">Réclamation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sc_priority">Priorité</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="normal">Normale</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sc_assigned_to">Assigné à</Label>
              <Input
                id="sc_assigned_to"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="ID utilisateur"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sc_user_id">Client</Label>
              <Input
                id="sc_user_id"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="ID du client (optionnel)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sc_order_id">Commande</Label>
              <Input
                id="sc_order_id"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="ID de la commande (optionnel)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Création..." : "Créer le cas"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
