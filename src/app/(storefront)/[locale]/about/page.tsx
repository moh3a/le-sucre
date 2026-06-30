import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heart, Leaf, Sparkles, Target, Handshake, Globe } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "À propos",
};

const values = [
  { icon: Target, title: "Qualité", description: "Nous sélectionnons les meilleurs ingrédients pour des créations d'exception." },
  { icon: Handshake, title: "Authenticité", description: "Chaque produit reflète notre passion et notre engagement envers l'excellence." },
  { icon: Leaf, title: "Durabilité", description: "Nous nous engageons pour une production responsable et respectueuse de l'environnement." },
  { icon: Sparkles, title: "Innovation", description: "Nous réinventons constamment nos recettes pour surprendre et ravir nos clients." },
  { icon: Heart, title: "Passion", description: "L'amour de la pâtisserie est au coeur de tout ce que nous faisons." },
  { icon: Globe, title: "Accessibilité", description: "Nous rendons la pâtisserie fine accessible à tous, partout en Algérie." },
];

const team = [
  { name: "Sarah Benali", role: "Fondatrice et pâtissière en chef" },
  { name: "Amine Kerrouche", role: "Directeur des opérations" },
  { name: "Lina Mansouri", role: "Responsable marketing" },
  { name: "Rayan Boudiaf", role: "Chef pâtissier" },
];

const locations = [
  { city: "Alger", address: "123 Rue Didouche Mourad, Alger Centre", hours: "Lun-Sam 9h-20h" },
  { city: "Oran", address: "45 Boulevard de l'Indépendance, Oran", hours: "Lun-Sam 9h-20h" },
];

export default async function AboutPage({ params }: Props) {
  const {} = await params;

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      {/* HERO SECTION */}
      <section className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Notre histoire</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          Découvrez l&apos;univers de Le Sucré, une marque passionnée par l&apos;art de la pâtisserie fine
          et la création de moments sucrés inoubliables.
        </p>
      </section>

      <Separator />

      {/* OUR STORY */}
      <section>
        <h2 className="mb-4 text-2xl font-bold">Notre histoire</h2>
        <div className="text-muted-foreground space-y-4">
          <p>
            Le Sucré est né d&apos;une passion pour la pâtisserie artisanale et le désir de partager
            des créations uniques avec le plus grand nombre. Depuis nos débuts modestes dans une
            petite cuisine, nous avons grandi pour devenir une référence en matière de douceurs
            haut de gamme.
          </p>
          <p>
            Chaque création est le fruit d&apos;un savoir-faire artisanal, utilisant des ingrédients
            soigneusement sélectionnés pour offrir une expérience gustative exceptionnelle.
          </p>
        </div>
      </section>

      <Separator />

      {/* MISSION & VALUES */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">Mission et valeurs</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <Card key={value.title}>
                <CardHeader>
                  <Icon className="mb-2 size-8 text-[#c8d152]" />
                  <CardTitle>{value.title}</CardTitle>
                  <CardDescription>{value.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* THE TEAM */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">Notre équipe</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <Card key={member.name}>
              <CardHeader className="items-center text-center">
                {/* TODO: Replace with actual avatar */}
                <div className="bg-muted mb-4 flex h-24 w-24 items-center justify-center rounded-full">
                  <span className="text-muted-foreground text-3xl">?</span>
                </div>
                <CardTitle className="text-lg">{member.name}</CardTitle>
                <CardDescription>{member.role}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* STORE LOCATIONS */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">Nos boutiques</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {locations.map((location) => (
            <Card key={location.city}>
              <CardHeader>
                <CardTitle>{location.city}</CardTitle>
                <CardDescription>{location.address}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{location.hours}</p>
                <Button variant="outline" className="mt-4" asChild>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(location.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Voir sur la carte
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
