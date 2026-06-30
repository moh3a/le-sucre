"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: Props) {
  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-8">
      <div className="mx-auto max-w-md text-center">
        <AlertTriangle className="mx-auto mb-4 size-16 text-[#700145]" />
        <h1 className="mb-2 text-8xl font-bold text-[#c8d152]">500</h1>
        <h2 className="mb-4 text-2xl font-bold">Erreur interne</h2>
        <p className="text-muted-foreground mb-8">
          Désolé, une erreur inattendue s&apos;est produite. Notre équipe technique a été informée
          et travaille à résoudre le problème.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" onClick={reset}>
            Réessayer
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/">Retourner à l&apos;accueil</Link>
          </Button>
        </div>

        <Separator className="my-8" />

        <p className="text-muted-foreground text-sm">
          Si le problème persiste, veuillez nous contacter à l&apos;adresse support@lesucre.dz
        </p>
      </div>
    </div>
  );
}
