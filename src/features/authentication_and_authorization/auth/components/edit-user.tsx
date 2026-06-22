"use client";

import { useState } from "react";
import { toast } from "sonner";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
  banned: boolean | null;
  role: string;
};

export function EditUser({ userId, name, email, is_active, banned, role }: EditUserProps) {
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [form_name, setFormName] = useState(name ?? "");
  const [form_active, setFormActive] = useState(is_active);
  const [form_role, setFormRole] = useState(role);
  const [form_password, setFormPassword] = useState("");
  const [form_confirm_password, setFormConfirmPassword] = useState("");
  const [form_banned, setFormBanned] = useState(banned ?? false);
  const [form_ban_reason, setFormBanReason] = useState("");

  const update_user = trpc.adminAuth.updateUser.useMutation({
    onSuccess: () => {
      toast.success("Utilisateur mis à jour");
      void utils.adminAuth.listUsers.invalidate();
      setOpen(false);
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
    if (form_password && form_password !== form_confirm_password) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    const payload: {
      user_id: string;
      name?: string;
      is_active?: boolean;
      password?: string;
      banned?: boolean;
      ban_reason?: string;
    } = { user_id: userId };

    if (form_name !== (name ?? "")) payload.name = form_name;
    if (form_active !== is_active) payload.is_active = form_active;
    if (form_password) payload.password = form_password;
    if (form_banned !== (banned ?? false) || form_ban_reason) {
      payload.banned = form_banned;
      if (form_banned && form_ban_reason) {
        payload.ban_reason = form_ban_reason;
      }
    }

    try {
      await update_user.mutateAsync(payload);

      if (form_role !== role) {
        await assign_role.mutateAsync({
          user_id: userId,
          role_name: form_role as (typeof ROLE_OPTIONS)[number],
        });
      }
    } catch {
      // toast already handled by mutation onError
    }
  };

  return (
    <QueryGuard mutation={{ isPending: update_user.isPending || assign_role.isPending, error: update_user.error ?? assign_role.error }}>
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

        <div className="max-h-[60vh] space-y-4 overflow-y-auto">
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

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label>Compte banni</Label>
                <p className="text-muted-foreground text-xs">
                  {banned ? "Actuellement banni" : "Non banni"}
                </p>
              </div>
              <Switch checked={form_banned} onCheckedChange={setFormBanned} />
            </div>

            {form_banned && (
              <div className="space-y-2">
                <Label htmlFor={`ban-reason-${userId}`}>Raison du bannissement</Label>
                <Input
                  id={`ban-reason-${userId}`}
                  value={form_ban_reason}
                  onChange={(e) => setFormBanReason(e.target.value)}
                  placeholder="Optionnelle"
                />
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor={`password-${userId}`}>Nouveau mot de passe</Label>
            <Input
              id={`password-${userId}`}
              type="password"
              value={form_password}
              onChange={(e) => setFormPassword(e.target.value)}
              placeholder="Laisser vide pour conserver"
            />
          </div>

          {form_password && (
            <div className="space-y-2">
              <Label htmlFor={`confirm-password-${userId}`}>Confirmer le mot de passe</Label>
              <Input
                id={`confirm-password-${userId}`}
                type="password"
                value={form_confirm_password}
                onChange={(e) => setFormConfirmPassword(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">État actuel</p>
              <p className="text-muted-foreground text-xs">{email}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={is_active ? "default" : "secondary"}>
                {is_active ? "Actif" : "Inactif"}
              </Badge>
              {banned && <Badge variant="destructive">Banni</Badge>}
            </div>
          </div>

          <Button
            className="w-full"
            disabled={update_user.isPending || assign_role.isPending}
            onClick={() => void on_save()}
          >
            {update_user.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
    </QueryGuard>
  );
}
