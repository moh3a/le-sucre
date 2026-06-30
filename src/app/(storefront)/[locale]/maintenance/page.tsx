import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Wrench } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Maintenance",
};

export default async function MaintenancePage({ params }: Props) {
  const {} = await params;

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-8">
      <div className="mx-auto max-w-md text-center">
        {/* Logo placeholder */}
        <div className="bg-[#c8d152] mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full">
          <span className="text-[#4d4c20] text-2xl font-bold">LS</span>
        </div>

        <h1 className="mb-4 text-4xl font-bold">Nous revenons bientôt !</h1>

        <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
          Notre site est actuellement en maintenance pour vous offrir une meilleure expérience.
          Nous serons de retour dans quelques instants. Merci de votre patience.
        </p>

        {/* Estimated return time */}
        <div className="bg-[#fff3e3] mb-8 inline-block rounded-lg px-6 py-3">
          <p className="text-sm font-medium text-[#4d4c20]">
            Retour estimé : dans les prochaines heures
          </p>
        </div>

        {/* Social links */}
        <div className="mb-8">
          <p className="text-muted-foreground mb-4 text-sm">
            Suivez-nous sur les réseaux sociaux pour rester informé :
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
              </a>
            </Button>
          </div>
        </div>

        <p className="text-muted-foreground text-xs">
          Le Sucré - contact@lesucre.dz
        </p>
      </div>
    </div>
  );
}
