"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { PERMISSIONS } from "../constants/permissions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

export function AuthorizationRoleEditor() {
  const t = useTranslations("users");
  const utils = trpc.useUtils();
  const { data: roles = [], isLoading, error } = trpc.authorization.listRoles.useQuery();
  const [selected_role, setSelectedRole] = useState<string>("moderator");
  const [draft_permissions, setDraftPermissions] = useState<string[]>([]);

  const current_role = useMemo(
    () => roles.find((role) => role.name === selected_role),
    [roles, selected_role],
  );

  const effective_permissions =
    draft_permissions.length > 0 ? draft_permissions : (current_role?.permissions ?? []);

  const update_permissions = trpc.authorization.updateRolePermissions.useMutation({
    onSuccess: () => {
      toast.success(t("permissions_updated"));
      setDraftPermissions([]);
      void utils.authorization.listRoles.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const toggle_permission = (permission: string, checked: boolean) => {
    const base = effective_permissions;
    setDraftPermissions(
      checked ? [...new Set([...base, permission])] : base.filter((p) => p !== permission),
    );
  };

  return (
    <QueryGuard query={{ isLoading, error }}>
    <ResponsiveDialog>
      <ResponsiveDialogTrigger asChild>
        <Button>{t("edit_permissions")}</Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{t("edit_role_permissions_title")}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>{t("admin_only")}</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <div className="space-y-4">
          <Select value={selected_role} onValueChange={setSelectedRole}>
            <SelectTrigger className="max-w-sm capitalize">
              <SelectValue placeholder={t("select_role_placeholder")} />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.name}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid gap-2 md:grid-cols-2">
            {Object.values(PERMISSIONS).map((permission) => (
              <label key={permission} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={effective_permissions.includes(permission)}
                  onCheckedChange={(checked) => toggle_permission(permission, checked === true)}
                />
                <span className="font-mono text-xs">{permission}</span>
              </label>
            ))}
          </div>

          <Button
            disabled={selected_role === "admin" || update_permissions.isPending}
            onClick={() =>
              update_permissions.mutate({
                role_name: selected_role,
                permissions: effective_permissions,
              })
            }
          >
            {t("save_permissions")}
          </Button>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
    </QueryGuard>
  );
}
