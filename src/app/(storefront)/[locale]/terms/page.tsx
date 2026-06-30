import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Conditions générales de vente",
};

const articles = [
  {
    number: 1,
    title: "Objet",
    content:
      "Les présentes conditions générales de vente régissent l'ensemble des transactions conclues entre Le Sucré et ses clients. Elles définissent les droits et obligations des parties dans le cadre de la vente en ligne de produits de pâtisserie fine.",
  },
  {
    number: 2,
    title: "Produits",
    content:
      "Les produits proposés à la vente sont décrits avec précision sur notre site. Les photographies sont fournies à titre indicatif et peuvent varier légèrement. Nous nous réservons le droit de modifier notre gamme de produits à tout moment.",
  },
  {
    number: 3,
    title: "Prix",
    content:
      "Les prix sont indiqués en DZD (dinars algériens) toutes taxes comprises. Les frais de livraison sont calculés séparément et indiqués avant la confirmation de la commande. Nous nous réservons le droit de modifier nos prix à tout moment.",
  },
  {
    number: 4,
    title: "Commandes",
    content:
      "La commande est confirmée après validation du paiement. Un email de confirmation est envoyé au client. Nous nous réservons le droit d'annuler toute commande en cas de problème de stock ou de suspicion de fraude.",
  },
  {
    number: 5,
    title: "Paiement",
    content:
      "Le paiement est exigible immédiatement à la commande. Les modes de paiement acceptés sont les cartes bancaires (Visa, Mastercard), CCP, Baridimob et le paiement à la livraison. Toutes les transactions sont sécurisées.",
  },
  {
    number: 6,
    title: "Livraison",
    content:
      "La livraison est effectuée à l'adresse indiquée par le client lors de la commande. Les délais de livraison sont fournis à titre indicatif. Le Sucré ne peut être tenu responsable des retards de livraison imputables aux transporteurs.",
  },
  {
    number: 7,
    title: "Droit de rétractation",
    content:
      "Conformément à la législation en vigueur, le client dispose d'un délai de 14 jours pour exercer son droit de rétractation, à compter de la réception du produit. Les frais de retour sont à la charge du client.",
  },
  {
    number: 8,
    title: "Garantie",
    content:
      "Tous nos produits sont garantis conformes à la commande. En cas de produit défectueux ou non conforme, le client peut demander un échange ou un remboursement dans les conditions prévues par la loi.",
  },
  {
    number: 9,
    title: "Responsabilité",
    content:
      "La responsabilité de Le Sucré ne saurait être engagée pour tout dommage indirect résultant de l'utilisation des produits achetés ou en cas de force majeure telle que définie par la jurisprudence.",
  },
  {
    number: 10,
    title: "Litiges",
    content:
      "Les présentes conditions sont soumises au droit algérien. En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, les tribunaux d'Alger seront seuls compétents.",
  },
];

export default async function TermsPage({ params }: Props) {
  const {} = await params;

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      <section className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Conditions générales de vente</h1>
        <p className="text-muted-foreground">Dernière mise à jour : 1 janvier 2026</p>
      </section>

      <Separator />

      {/* LAST UPDATED */}
      <section className="text-center">
        <p className="text-muted-foreground text-sm">
          Veuillez lire attentivement les présentes conditions générales de vente avant de passer
          commande. En passant commande, vous acceptez sans réserve les présentes conditions.
        </p>
      </section>

      <Separator />

      {/* LEGAL CONTENT */}
      <section className="space-y-6">
        {articles.map((article) => (
          <Card key={article.number}>
            <CardHeader>
              <CardTitle className="text-lg">
                Article {article.number} - {article.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">{article.content}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Separator />

      <section className="text-center">
        <p className="text-muted-foreground text-sm">
          Pour toute question concernant nos conditions générales de vente, veuillez nous contacter
          à l&apos;adresse contact@lesucre.dz.
        </p>
      </section>
    </div>
  );
}
