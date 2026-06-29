"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function CreateSLADialog() {
  const [open, setOpen] = useState(false);
  const [entity_type, setEntityType] = useState("order");
  const [priority, setPriority] = useState("medium");
  const [response_hours, setResponseHours] = useState(1);
  const [resolution_hours, setResolutionHours] = useState(24);
  const [escalation_minutes, setEscalationMinutes] = useState(30);
  const [escalate_to_role, setEscalateToRole] = useState("");

  const utils = trpc.useUtils();

  const create = trpc.operationsWorkflows.slaCreateDefinition.useMutation({
    onSuccess: () => {
      toast.success("Définition SLA créée avec succès");
      setOpen(false);
      setEntityType("order");
      setPriority("medium");
      setResponseHours(1);
      setResolutionHours(24);
      setEscalationMinutes(30);
      setEscalateToRole("");
      void utils.operationsWorkflows.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({
      entity_type,
      priority,
      response_hours,
      resolution_hours,
      escalation_minutes,
      escalate_to_role: escalate_to_role || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Nouveau SLA
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer une définition SLA</DialogTitle>
          <DialogDescription>
            Définir un nouvel accord de niveau de service.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handle_submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type d&apos;entité</Label>
            <Select value={entity_type} onValueChange={setEntityType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="order">Commande</SelectItem>
                <SelectItem value="support_case">Support</SelectItem>
                <SelectItem value="return">Retour</SelectItem>
                <SelectItem value="refund">Remboursement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priorité</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critique</SelectItem>
                <SelectItem value="high">Haute</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Basse</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Délai de réponse (heures)</Label>
            <Input
              type="number"
              min={0}
              step={0.5}
              value={response_hours}
              onChange={(e) => setResponseHours(Number(e.target.value))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Délai de résolution (heures)</Label>
            <Input
              type="number"
              min={0}
              step={0.5}
              value={resolution_hours}
              onChange={(e) => setResolutionHours(Number(e.target.value))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Escalade (minutes)</Label>
            <Input
              type="number"
              min={0}
              value={escalation_minutes}
              onChange={(e) => setEscalationMinutes(Number(e.target.value))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Escalader vers le rôle (optionnel)</Label>
            <Input
              value={escalate_to_role}
              onChange={(e) => setEscalateToRole(e.target.value)}
              placeholder="ex: senior_support"
            />
          </div>
          <Button type="submit" className="w-full" disabled={create.isPending}>
            Créer la définition SLA
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SLAClient() {
  const { data: stats } = trpc.operationsWorkflows.slaStats.useQuery();
  const { data: overdue } = trpc.operationsWorkflows.slaOverdueList.useQuery();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">SLA Tracking</h1>
        <CreateSLADialog />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats?.active ?? 0}</p>
          <p className="text-xs text-gray-500">Active</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{stats?.overdue ?? 0}</p>
          <p className="text-xs text-gray-500">Overdue</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{stats?.breached ?? 0}</p>
          <p className="text-xs text-gray-500">Breached</p>
        </div>
      </div>

      <div className="rounded-lg border">
        <h2 className="border-b bg-gray-50 px-4 py-2 font-semibold text-sm">Overdue Items ({overdue?.length ?? 0})</h2>
        <div className="divide-y">
          {overdue?.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{item.entity_type}:{item.entity_id.slice(0, 12)}</p>
                <p className="text-xs text-gray-500">Escalated {item.escalation_count}x</p>
              </div>
              <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">OVERDUE</span>
            </div>
          ))}
          {(!overdue || overdue.length === 0) && <p className="p-4 text-sm text-gray-400">No overdue items</p>}
        </div>
      </div>
    </div>
  );
}
