"use client";

import { Activity, Database, Server, Wifi } from "lucide-react";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function HealthPageClient() {
  const query = trpc.health.check.useQuery(undefined, {
    refetchInterval: 30_000,
    networkMode: "online",
  });

  const { data } = query;

  const services = [
    {
      name: "Serveur",
      icon: Server,
      ok: true,
      detail: `Uptime : ${data?.checks?.uptime_sec ? Math.floor(data.checks.uptime_sec / 60) + " min" : "—"}`,
      version: data?.checks?.version,
    },
    {
      name: "Base de données (MySQL)",
      icon: Database,
      ok: data?.checks?.mysql ?? false,
      detail: data?.checks?.mysql ? "Connexion OK" : "Indisponible",
    },
    {
      name: "Redis",
      icon: Activity,
      ok: data?.checks?.redis ?? false,
      detail: data?.checks?.redis ? "Connexion OK" : "Indisponible",
    },
  ];

  return (
    <QueryGuard query={query}>
      <ConsolePageShell
        title="État des services"
        subtitle="Surveillance de l'infrastructure technique"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {services.map((service) => (
            <Card key={service.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{service.name}</CardTitle>
                <service.icon className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant={service.ok ? "default" : "destructive"}>
                    {service.ok ? "Opérationnel" : "Panne"}
                  </Badge>
                  {data && (
                    <Wifi
                      className={`size-4 ${
                        service.ok ? "text-primary" : "text-destructive"
                      }`}
                    />
                  )}
                </div>
                <p className="text-muted-foreground mt-2 text-xs">{service.detail}</p>
                {service.version && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    Version : {service.version}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ConsolePageShell>
    </QueryGuard>
  );
}
