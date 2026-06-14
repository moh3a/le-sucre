"use client";

import { useState } from "react";
import { toast } from "sonner";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

const ROLE_OPTIONS = ["admin", "moderator", "operator", "delivery_person", "customer"] as const;

type EditUserProps = {
  userId: string;
  name: string | null;
  email: string;
  is_active: boolean;
  role: string;
};

export function EditUser({ userId, name, email, is_active, role }: EditUserProps) {
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [form_name, setFormName] = useState(name ?? "");
  const [form_active, setFormActive] = useState(is_active);
  const [form_role, setFormRole] = useState(role);

  const update_user = trpc.adminAuth.updateUser.useMutation({
    onSuccess: () => {
      toast.success("Utilisateur mis à jour");
      void utils.adminAuth.listUsers.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const assign_role = trpc.adminAuth.assignRole.useMutation({
    onSuccess: () => {
      toast.success("Rôle mis à jour");
      void utils.adminAuth.listUsers.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const on_save = async () => {
    await update_user.mutateAsync({
      user_id: userId,
      name: form_name,
      is_active: form_active,
    });

    if (form_role !== role) {
      await assign_role.mutateAsync({
        user_id: userId,
        role_name: form_role as (typeof ROLE_OPTIONS)[number],
      });
    }

    setOpen(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        <Button variant="outline" size="sm">
          Gérer
        </Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Gérer l&apos;utilisateur</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>{email}</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`name-${userId}`}>Nom</Label>
            <Input
              id={`name-${userId}`}
              value={form_name}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Rôle</Label>
            <Select value={form_role} onValueChange={setFormRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor={`active-${userId}`}>Compte actif</Label>
            <Switch id={`active-${userId}`} checked={form_active} onCheckedChange={setFormActive} />
          </div>

          <Button
            className="w-full"
            disabled={update_user.isPending || assign_role.isPending}
            onClick={() => void on_save()}
          >
            Enregistrer
          </Button>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
