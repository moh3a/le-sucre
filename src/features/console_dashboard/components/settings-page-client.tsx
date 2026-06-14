"use client";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsPageClient() {
  return (
    <ConsolePageShell title="Paramètres" subtitle="Configuration de la plateforme">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Général</CardTitle>
            <CardDescription>Nom de la boutique, devise, langue admin.</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Module de configuration à brancher sur une table `settings`.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Transporteurs</CardTitle>
            <CardDescription>Clés API Yalidine, DHL, etc.</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Variables d&apos;environnement ou chiffrement en base.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Paiements</CardTitle>
            <CardDescription>Stripe, Chargily, SATIM…</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Configuration des prestataires de paiement.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Base de données</CardTitle>
            <CardDescription>Sauvegarde et maintenance.</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Actions admin DB à implémenter via jobs sécurisés.
          </CardContent>
        </Card>
      </div>
    </ConsolePageShell>
  );
}
