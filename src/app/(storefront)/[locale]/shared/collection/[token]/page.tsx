import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, Share2 } from "lucide-react";

type Props = {
  params: Promise<{ locale: string; token: string }>;
};

export const metadata: Metadata = {
  title: "Collection partagée",
};

const collectionItems = [
  {
    name: "Macarons assortis",
    price: "2 400 DZD",
    badge: "Nouveauté",
    image: null,
  },
  {
    name: "Gâteau au chocolat fondant",
    price: "2 800 DZD",
    badge: "Populaire",
    image: null,
  },
  {
    name: "Tarte aux fruits rouges",
    price: "2 200 DZD",
    badge: "Saison",
    image: null,
  },
  {
    name: "Meringues françaises (x6)",
    price: "1 200 DZD",
    badge: null,
    image: null,
  },
  {
    name: "Coffret découverte",
    price: "4 500 DZD",
    badge: "Coffret",
    image: null,
  },
  {
    name: "Éclairs au café (x4)",
    price: "1 800 DZD",
    badge: null,
    image: null,
  },
];

export default async function SharedCollectionPage({ params }: Props) {
  const { token } = await params;

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      {/* COLLECTION HEADER */}
      <section className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Collection partagée</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          Sarah Benali a partagé cette collection avec vous. Découvrez ses coups de coeur.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <Badge variant="outline">{collectionItems.length} articles</Badge>
          <Badge variant="secondary">
            Collection partagée via le token {token.slice(0, 8)}...
          </Badge>
        </div>
      </section>

      <Separator />

      {/* PRODUCT GRID */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">Les articles de la collection</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collectionItems.map((item) => (
            <Card key={item.name}>
              <CardHeader>
                {/* TODO: Replace with actual product image */}
                <div className="bg-muted mb-4 flex h-48 items-center justify-center rounded-lg">
                  <span className="text-muted-foreground text-sm">Image produit</span>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <CardDescription>{item.price}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Heart className="size-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                {item.badge ? (
                  <Badge variant="secondary">{item.badge}</Badge>
                ) : (
                  <span />
                )}
                <Button size="sm">Ajouter au panier</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* CTA */}
      <section className="text-center">
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <CardTitle>Vous aimez cette collection ?</CardTitle>
            <CardDescription>
              Créez votre propre collection personnalisée et partagez-la avec vos proches.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-4">
            <Button>
              <Share2 className="mr-2 size-4" />
              Créer votre collection
            </Button>
            <Button variant="outline" asChild>
              <a href="/account/wishlists">Connectez-vous</a>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
