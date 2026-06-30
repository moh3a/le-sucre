import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Page introuvable",
};

const popularLinks = [
  { href: "/", label: "Accueil" },
  { href: "/c", label: "Catalogue" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function NotFoundPage() {
  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-8">
      <div className="mx-auto max-w-md text-center">
        <h1 className="mb-2 text-8xl font-bold text-[#c8d152]">404</h1>
        <h2 className="mb-4 text-2xl font-bold">Page introuvable</h2>
        <p className="text-muted-foreground mb-8">
          Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée. Vérifiez
          l&apos;URL ou retournez à l&apos;accueil.
        </p>
        <Button size="lg" className="mb-8" asChild>
          <Link href="/">Retourner à l&apos;accueil</Link>
        </Button>

        <Separator />

        {/* Popular links suggestion */}
        <div className="mt-8">
          <p className="text-muted-foreground mb-4 text-sm">Pages populaires :</p>
          <div className="flex flex-wrap justify-center gap-3">
            {popularLinks.map((link) => (
              <Button key={link.href} variant="outline" size="sm" asChild>
                <a href={link.href}>{link.label}</a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
