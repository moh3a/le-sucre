"use client";

import { useState } from "react";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
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

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false);
  const [taskType, setTaskType] = useState("general");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [referenceType, setReferenceType] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState("normal");
  const [dueAt, setDueAt] = useState("");

  const utils = trpc.useUtils();
  const mutation = trpc.operations.adminTaskCreate.useMutation({
    onSuccess: () => {
      toast.success("Tâche créée");
      setOpen(false);
      reset();
      utils.operations.adminTaskListAll.invalidate();
      utils.operations.adminTaskDashboard.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function reset() {
    setTaskType("general");
    setTitle("");
    setDescription("");
    setReferenceType("");
    setReferenceId("");
    setAssignedTo("");
    setPriority("normal");
    setDueAt("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) {
      toast.error("Veuillez saisir un titre");
      return;
    }
    mutation.mutate({
      task_type: taskType as "order_follow_up" | "customer_follow_up" | "inventory_review" | "campaign_review" | "general",
      title,
      description: description || undefined,
      reference_type: referenceType || undefined,
      reference_id: referenceId || undefined,
      assigned_to_user_id: assignedTo || undefined,
      priority: priority as "low" | "normal" | "high" | "urgent",
      due_at: dueAt ? new Date(dueAt).toISOString() : undefined,
    });
  }

  return (
    <QueryGuard mutation={{ isPending: mutation.isPending, error: mutation.error }}>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          Nouvelle tâche
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Créer une tâche</DialogTitle>
          <DialogDescription>
            Ajouter une nouvelle tâche interne.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tk_title">Titre *</Label>
            <Input
              id="tk_title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Objet de la tâche"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tk_type">Type</Label>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order_follow_up">Suivi commande</SelectItem>
                  <SelectItem value="customer_follow_up">Suivi client</SelectItem>
                  <SelectItem value="inventory_review">Révision inventaire</SelectItem>
                  <SelectItem value="campaign_review">Révision campagne</SelectItem>
                  <SelectItem value="general">Général</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tk_priority">Priorité</Label>
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="tk_description">Description</Label>
            <Textarea
              id="tk_description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description détaillée"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tk_ref_type">Type de référence</Label>
              <Select value={referenceType} onValueChange={setReferenceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Aucun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order">Commande</SelectItem>
                  <SelectItem value="campaign">Campagne</SelectItem>
                  <SelectItem value="product">Produit</SelectItem>
                  <SelectItem value="customer">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tk_ref_id">ID de référence</Label>
              <Input
                id="tk_ref_id"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                placeholder="ID correspondant"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tk_due_at">Échéance</Label>
              <Input
                id="tk_due_at"
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tk_assigned_to">Assigné à</Label>
              <Input
                id="tk_assigned_to"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="ID utilisateur"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Création..." : "Créer la tâche"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      </Dialog>
    </QueryGuard>
  );
}
