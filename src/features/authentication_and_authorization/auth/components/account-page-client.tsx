"use client";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { trpc } from "@/components/providers/app-providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AccountPageClient() {
  const { data, isLoading } = trpc.auth.me.useQuery();

  return (
    <ConsolePageShell title="Mon compte" subtitle="Informations de votre profil">
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {isLoading ? (
            <p className="text-muted-foreground">Chargement…</p>
          ) : (
            <>
              <p>
                <span className="text-muted-foreground">Nom : </span>
                {data?.user.name}
              </p>
              <p>
                <span className="text-muted-foreground">Email : </span>
                {data?.user.email}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {data?.roles.map((role) => (
                  <Badge key={role} variant="outline">
                    {role}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </ConsolePageShell>
  );
}
