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
import { Plus, Phone } from "lucide-react";

export function CreateFollowUpDialog() {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [followUpType, setFollowUpType] = useState("follow_up");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [assignedTo, setAssignedTo] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  const utils = trpc.useUtils();
  const mutation = trpc.operations.customerCreateFollowUp.useMutation({
    onSuccess: () => {
      toast.success("Relance créée");
      setOpen(false);
      reset();
      utils.operations.customerListMyFollowUps.invalidate();
      utils.operations.customerGetOverdueFollowUps.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function reset() {
    setUserId("");
    setOrderId("");
    setFollowUpType("follow_up");
    setTitle("");
    setDescription("");
    setPriority("normal");
    setAssignedTo("");
    setScheduledAt("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !scheduledAt) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    mutation.mutate({
      user_id: userId || null,
      order_id: orderId || null,
      follow_up_type: followUpType as "callback" | "follow_up" | "reminder",
      title,
      description: description || undefined,
      priority: priority as "low" | "normal" | "high" | "urgent",
      assigned_to_user_id: assignedTo || undefined,
      scheduled_at: new Date(scheduledAt).toISOString(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Phone className="mr-2 size-4" />
          Nouvelle relance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Créer une relance / suivi</DialogTitle>
          <DialogDescription>
            Planifier un rappel ou un suivi client.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fu_title">Titre *</Label>
            <Input
              id="fu_title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Objet de la relance"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fu_type">Type</Label>
              <Select value={followUpType} onValueChange={setFollowUpType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="callback">Rappel</SelectItem>
                  <SelectItem value="follow_up">Suivi</SelectItem>
                  <SelectItem value="reminder">Rappel automatique</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fu_priority">Priorité</Label>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fu_user_id">Client</Label>
              <Input
                id="fu_user_id"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="ID du client (optionnel)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fu_order_id">Commande</Label>
              <Input
                id="fu_order_id"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="ID de la commande (optionnel)"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fu_description">Description</Label>
            <Textarea
              id="fu_description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes supplémentaires"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fu_scheduled_at">Programmé le *</Label>
              <Input
                id="fu_scheduled_at"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fu_assigned_to">Assigné à</Label>
              <Input
                id="fu_assigned_to"
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
              {mutation.isPending ? "Création..." : "Créer la relance"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
