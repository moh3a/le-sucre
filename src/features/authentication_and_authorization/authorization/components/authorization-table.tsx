"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { ROLE_PERMISSION_MAP, PERMISSIONS } from "../constants/permissions";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function AuthorizationTable() {
  const t = useTranslations("authorization");
  const [search, setSearch] = React.useState("");

  const roles = Object.keys(ROLE_PERMISSION_MAP);
  const permissionsList = Object.keys(PERMISSIONS) as (keyof typeof PERMISSIONS)[];

  const filtered = React.useMemo(() => {
    if (!search.trim()) return permissionsList;
    const q = search.toLowerCase();
    return permissionsList.filter((key) => {
      const value = PERMISSIONS[key];
      return key.toLowerCase().includes(q) || value.toLowerCase().includes(q);
    });
  }, [search, permissionsList]);

  const role_permission_counts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const role of roles) {
      counts[role] = filtered.filter((key) =>
        ROLE_PERMISSION_MAP[role].includes(PERMISSIONS[key]),
      ).length;
    }
    return counts;
  }, [roles, filtered]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{t("matrix_title")}</CardTitle>
            <CardDescription>{t("matrix_description")}</CardDescription>
          </div>
          <div className="relative max-w-sm">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder={t("search_permissions")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b bg-muted/50 transition-colors">
                <th className="text-muted-foreground h-12 w-64 px-4 text-left align-middle font-semibold">
                  {t("permissions_column")} ({filtered.length})
                </th>
                {roles.map((role) => (
                  <th
                    key={role}
                    className="text-muted-foreground h-12 px-4 text-center align-middle font-semibold"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Badge
                        variant="outline"
                        className="text-xs capitalize"
                      >
                        {role.replace("_", " ")}
                      </Badge>
                      <span className="text-muted-foreground text-[10px] font-normal">
                        {role_permission_counts[role]}/{filtered.length}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0 bg-background">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={roles.length + 1}
                    className="text-muted-foreground py-8 text-center text-sm"
                  >
                    {t("no_permissions_found")}
                  </td>
                </tr>
              ) : (
                filtered.map((permissionKey) => {
                  const permissionValue = PERMISSIONS[permissionKey];
                  return (
                    <tr
                      key={permissionKey}
                      className="border-b transition-colors hover:bg-muted/30"
                    >
                      <td className="p-4 align-middle font-medium">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-crimson-violet">
                            {permissionValue}
                          </span>
                          <span className="text-muted-foreground mt-0.5 text-xs capitalize">
                            {permissionKey.replace(/_/g, " ")}
                          </span>
                        </div>
                      </td>
                      {roles.map((role) => {
                        const hasPermission = ROLE_PERMISSION_MAP[role].includes(permissionValue);
                        return (
                          <td key={role} className="p-4 align-middle text-center">
                            <div className="flex justify-center">
                              {hasPermission ? (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-olive-leaf">
                                  <Check className="h-4 w-4" />
                                </div>
                              ) : (
                                <div className="bg-muted text-muted-foreground flex h-6 w-6 items-center justify-center rounded-full">
                                  <X className="h-3 w-3" />
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
