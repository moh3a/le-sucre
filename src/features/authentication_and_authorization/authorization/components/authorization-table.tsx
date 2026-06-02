"use client";

import * as React from "react";
import { ROLE_PERMISSION_MAP, PERMISSIONS } from "../constants/permissions";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AuthorizationTable() {
  const roles = Object.keys(ROLE_PERMISSION_MAP);
  const permissionsList = Object.keys(PERMISSIONS) as (keyof typeof PERMISSIONS)[];

  return (
    <div className="relative w-full overflow-auto rounded-lg border">
      <table className="w-full caption-bottom text-sm">
        <thead>
          <tr className="border-b bg-muted/50 transition-colors hover:bg-muted/50">
            <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground w-64">
              Permissions
            </th>
            {roles.map((role) => (
              <th
                key={role}
                className="h-12 px-4 text-center align-middle font-semibold text-muted-foreground capitalize"
              >
                <Badge variant="outline" className="text-xs uppercase bg-secondary text-olive-leaf border-primary/20">
                  {role.replace("_", " ")}
                </Badge>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0 bg-background">
          {permissionsList.map((permissionKey) => {
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
                    <span className="text-xs text-muted-foreground mt-0.5 capitalize">
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
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <X className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
