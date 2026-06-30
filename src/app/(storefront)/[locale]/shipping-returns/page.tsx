import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, RotateCcw, Truck, Clock, CheckCircle } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Livraison et retours",
};

const shippingMethods = [
  { method: "Standard", cost: "500 DZD", delay: "3-5 jours ouvrés", badge: "Économique" },
  { method: "Express", cost: "1 000 DZD", delay: "24-48h", badge: "Populaire" },
  { method: "Point relais", cost: "350 DZD", delay: "3-5 jours ouvrés", badge: "Économique" },
  { method: "Livraison offerte", cost: "Gratuit", delay: "3-5 jours ouvrés", badge: "Dès 5000 DZD" },
];

const returnSteps = [
  { icon: RotateCcw, title: "1. Demande de retour", description: "Contactez notre service client dans les 14 jours suivant la réception." },
  { icon: Package, title: "2. Emballez le produit", description: "Emballez soigneusement le produit dans son emballage d'origine." },
  { icon: Truck, title: "3. Expédiez le colis", description: "Déposez le colis chez notre transporteur partenaire." },
  { icon: CheckCircle, title: "4. Remboursement", description: "Sous 5 à 10 jours ouvrés après réception et vérification." },
];

export default async function ShippingReturnsPage({ params }: Props) {
  const {} = await params;

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      <section className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Livraison et retours</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          Tout savoir sur nos options de livraison et notre politique de retour.
        </p>
      </section>

      <Separator />

      {/* SHIPPING INFO */}
      <section>
        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <Globe className="mb-2 size-6 text-[#c8d152]" />
              <CardTitle className="text-base">Zones de livraison</CardTitle>
              <CardDescription>
                Nous livrons dans toutes les wilayas d&apos;Algérie, de Tamanrasset à Alger.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Truck className="mb-2 size-6 text-[#c8d152]" />
              <CardTitle className="text-base">Transporteurs</CardTitle>
              <CardDescription>
                En partenariat avec Yalidine, ZR Express et Algérie Poste pour une livraison fiable.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Clock className="mb-2 size-6 text-[#c8d152]" />
              <CardTitle className="text-base">Délais estimés</CardTitle>
              <CardDescription>
                24-48h pour Alger, 2-5 jours pour le reste du pays.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <Separator />

      {/* SHIPPING METHODS */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">Méthodes de livraison</h2>
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-muted-foreground p-4 text-left font-medium">Méthode</th>
                  <th className="text-muted-foreground p-4 text-left font-medium">Coût</th>
                  <th className="text-muted-foreground p-4 text-left font-medium">Délai</th>
                  <th className="text-muted-foreground p-4 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {shippingMethods.map((method) => (
                  <tr key={method.method} className="border-b last:border-0">
                    <td className="p-4 font-medium">{method.method}</td>
                    <td className="p-4">{method.cost}</td>
                    <td className="p-4">{method.delay}</td>
                    <td className="p-4 text-right">
                      <Badge variant="secondary">{method.badge}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* RETURN POLICY */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">Politique de retour</h2>
        <Card>
          <CardHeader>
            <CardTitle>Conditions de retour</CardTitle>
            <CardDescription>
              Vous disposez de 14 jours à compter de la réception de votre commande pour retourner
              un produit qui ne vous conviendrait pas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground text-sm">
              Le produit doit être dans son état d&apos;origine, non ouvert et dans son emballage
              d&apos;origine. Les produits personnalisés ou périssables ne peuvent être retournés
              pour des raisons d&apos;hygiène.
            </p>
            <p className="text-muted-foreground text-sm">
              Les frais de retour sont à la charge du client, sauf en cas de produit défectueux ou
              d&apos;erreur de notre part. Le remboursement est effectué sous 5 à 10 jours ouvrés
              après réception du colis.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* RETURN PROCESS STEPS */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">Comment retourner un produit</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {returnSteps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.title}>
                <CardHeader>
                  <Icon className="mb-2 size-8 text-[#c8d152]" />
                  <CardTitle className="text-base">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator />

      <section className="text-center">
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <CardTitle>Besoin d&apos;aide ?</CardTitle>
            <CardDescription>
              Notre équipe du service client est à votre disposition pour vous accompagner.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-4">
            <Button asChild>
              <a href="/contact">Nous contacter</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/faq">Consulter la FAQ</a>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Globe(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
