"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { ROLE_LABELS } from "@/features/authentication_and_authorization/authorization/constants/roles";

const ROLE_OPTIONS = ["admin", "moderator", "operator", "delivery_person", "customer"] as const;

export function CreateUserDialog() {
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("customer");

  const create_user = trpc.adminAuth.createUser.useMutation({
    onSuccess: () => {
      toast.success("Utilisateur créé");
      setOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setRole("customer");
      void utils.adminAuth.listUsers.invalidate();
      void utils.adminAuth.getStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const on_submit = (e: React.FormEvent) => {
    e.preventDefault();
    create_user.mutate({
      name,
      email,
      password,
      role: role as (typeof ROLE_OPTIONS)[number],
    });
  };

  return (
    <QueryGuard mutation={create_user}>
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        <Button>
          <Plus />
          Créer un utilisateur
        </Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Créer un utilisateur</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Ajouter un nouvel utilisateur à la plateforme
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form onSubmit={on_submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-name">Nom</Label>
            <Input
              id="create-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom complet"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-email">Email</Label>
            <Input
              id="create-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-password">Mot de passe</Label>
            <Input
              id="create-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 caractères"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-role">Rôle</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="create-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={create_user.isPending}
          >
            {create_user.isPending ? "Création..." : "Créer l'utilisateur"}
          </Button>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
    </QueryGuard>
  );
}
