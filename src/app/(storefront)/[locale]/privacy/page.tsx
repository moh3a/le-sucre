import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Politique de confidentialité",
};

const sections = [
  {
    title: "Collecte des informations",
    content:
      "Nous collectons les informations que vous nous fournissez lors de la création de votre compte, la passation d'une commande ou la soumission d'un formulaire de contact. Ces informations incluent votre nom, adresse email, adresse de livraison et numéro de téléphone.",
  },
  {
    title: "Utilisation des informations",
    content:
      "Les informations collectées sont utilisées pour traiter vos commandes, améliorer notre service client, vous envoyer des communications marketing (avec votre consentement) et personnaliser votre expérience d'achat.",
  },
  {
    title: "Partage des informations",
    content:
      "Nous ne vendons pas vos informations personnelles à des tiers. Vos données peuvent être partagées avec nos partenaires de livraison (transporteurs) et de paiement, uniquement dans le cadre du traitement de votre commande.",
  },
  {
    title: "Cookies",
    content:
      "Notre site utilise des cookies pour améliorer votre expérience de navigation, analyser le trafic et personnaliser le contenu. Vous pouvez contrôler l'utilisation des cookies dans les paramètres de votre navigateur.",
  },
  {
    title: "Vos droits",
    content:
      "Conformément à la réglementation applicable, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données. Vous pouvez exercer ces droits en nous contactant à contact@lesucre.dz.",
  },
  {
    title: "Sécurité des données",
    content:
      "Nous mettons en oeuvre des mesures de sécurité techniques et organisationnelles pour protéger vos informations personnelles contre tout accès non autorisé, perte ou divulgation.",
  },
  {
    title: "Conservation des données",
    content:
      "Vos données personnelles sont conservées pendant la durée nécessaire à la réalisation des finalités pour lesquelles elles ont été collectées, conformément aux obligations légales en vigueur.",
  },
];

export default async function PrivacyPage({ params }: Props) {
  const {} = await params;

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      <section className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Politique de confidentialité</h1>
        <p className="text-muted-foreground">Dernière mise à jour : 1 janvier 2026</p>
      </section>

      <Separator />

      <section className="text-center">
        <p className="text-muted-foreground mx-auto max-w-2xl text-sm">
          La protection de vos données personnelles est une priorité pour Le Sucré. Cette politique
          explique comment nous collectons, utilisons et protégeons vos informations.
        </p>
      </section>

      <Separator />

      {/* PRIVACY CONTENT */}
      <section className="space-y-6">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">{section.content}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Separator />

      <section className="text-center">
        <p className="text-muted-foreground text-sm">
          Pour toute question concernant notre politique de confidentialité, veuillez nous contacter
          à l&apos;adresse contact@lesucre.dz.
        </p>
      </section>
    </div>
  );
}
