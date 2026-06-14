"use client";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { AuthorizationTable } from "./authorization-table";
import { AuthorizationRoleEditor } from "./authorization-role-editor";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function AuthorizationPageClient() {
  return (
    <ConsolePageShell title="Autorisation" subtitle="Gestion des rôles et des permissions">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Modifier les permissions d&apos;un rôle</CardTitle>
            <CardDescription>Réservé aux administrateurs.</CardDescription>
          </CardHeader>
          <CardContent>
            <AuthorizationRoleEditor />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Matrice des Rôles & Permissions</CardTitle>
            <CardDescription>
              Aperçu des droits d&apos;accès accordés pour chaque rôle du système.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthorizationTable />
          </CardContent>
        </Card>
      </div>
    </ConsolePageShell>
  );
}
