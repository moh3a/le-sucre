"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Search, Loader2, ShieldCheck } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { PERMISSIONS } from "../constants/permissions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";

export function AuthorizationRoleEditor() {
  const t = useTranslations("users");
  const tAuth = useTranslations("authorization");
  const utils = trpc.useUtils();
  const { data: roles = [], isLoading, error } = trpc.authorization.listRoles.useQuery();
  const [selected_role, setSelectedRole] = useState<string>("moderator");
  const [draft_permissions, setDraftPermissions] = useState<string[]>([]);
  const [perm_search, setPermSearch] = useState("");

  const current_role = useMemo(
    () => roles.find((role) => role.name === selected_role),
    [roles, selected_role],
  );

  const effective_permissions =
    draft_permissions.length > 0 ? draft_permissions : (current_role?.permissions ?? []);

  const filtered_permissions = useMemo(() => {
    const all = Object.entries(PERMISSIONS);
    if (!perm_search.trim()) return all;
    const q = perm_search.toLowerCase();
    return all.filter(([key, value]) => key.toLowerCase().includes(q) || value.toLowerCase().includes(q));
  }, [perm_search]);

  const selected_count = effective_permissions.length;
  const total_count = Object.values(PERMISSIONS).length;

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

  const select_all = () => {
    setDraftPermissions(Object.values(PERMISSIONS));
  };

  const select_none = () => {
    setDraftPermissions([]);
  };

  const is_admin = selected_role === "admin";
  const is_dirty = draft_permissions.length > 0;

  return (
    <QueryGuard query={{ isLoading, error }}>
      <ResponsiveDialog>
        <ResponsiveDialogTrigger asChild>
          <Button>
            <ShieldCheck className="mr-2 h-4 w-4" />
            {tAuth("edit_permissions")}
          </Button>
        </ResponsiveDialogTrigger>
        <ResponsiveDialogContent className="max-w-2xl">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>{t("edit_role_permissions_title")}</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>{t("admin_only")}</ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selected_role} onValueChange={(v) => { setSelectedRole(v); setDraftPermissions([]); setPermSearch(""); }}>
                <SelectTrigger className="w-[200px] capitalize">
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
              <Badge variant={is_dirty ? "default" : "secondary"}>
                {selected_count}/{total_count}
              </Badge>
              {is_admin && (
                <Badge variant="outline" className="text-xs">
                  {tAuth("admin_full_access")}
                </Badge>
              )}
            </div>
            <Separator />
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder={tAuth("search_permissions")}
                  value={perm_search}
                  onChange={(e) => setPermSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={select_all}>
                {tAuth("select_all")}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={select_none}>
                {tAuth("select_none")}
              </Button>
            </div>
            <div className="grid max-h-[400px] gap-1 overflow-y-auto rounded-lg border p-2">
              {filtered_permissions.map(([key, value]) => (
                <label
                  key={value}
                  className="hover:bg-muted/50 flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors"
                >
                  <Checkbox
                    checked={effective_permissions.includes(value)}
                    onCheckedChange={(checked) => toggle_permission(value, checked === true)}
                    disabled={is_admin}
                  />
                  <div className="flex flex-1 items-center gap-2">
                    <span className="font-mono text-xs">{value}</span>
                    <span className="text-muted-foreground text-xs capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                  </div>
                </label>
              ))}
              {filtered_permissions.length === 0 && (
                <p className="text-muted-foreground py-4 text-center text-sm">
                  {tAuth("no_permissions_found")}
                </p>
              )}
            </div>
          </div>
          <ResponsiveDialogFooter>
            <Button
              disabled={is_admin || !is_dirty || update_permissions.isPending}
              onClick={() =>
                update_permissions.mutate({
                  role_name: selected_role,
                  permissions: effective_permissions,
                })
              }
            >
              {update_permissions.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("save_permissions")}
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </QueryGuard>
  );
}
