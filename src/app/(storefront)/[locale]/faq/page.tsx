import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "FAQ",
};

const faqData: Record<string, { q: string; a: string }[]> = {
  commandes: [
    { q: "Comment passer une commande ?", a: "Pour passer une commande, parcourez notre catalogue, ajoutez les articles souhaités à votre panier, puis suivez le processus de paiement. Vous recevrez une confirmation par email." },
    { q: "Puis-je modifier ma commande après l'avoir passée ?", a: "Vous pouvez modifier votre commande dans un délai de 2 heures après sa confirmation. Contactez notre service client pour toute modification." },
    { q: "Comment annuler une commande ?", a: "L'annulation est possible dans les 2 heures suivant la commande. Passé ce délai, veuillez nous contacter directement." },
    { q: "Quels sont les moyens de paiement acceptés ?", a: "Nous acceptons les paiements par carte bancaire (Visa, Mastercard), CCP, Baridimob, et paiement à la livraison." },
    { q: "Ma commande est-elle bien confirmée ?", a: "Vous recevrez un email de confirmation avec votre numéro de commande. Vérifiez également vos spams." },
  ],
  livraison: [
    { q: "Quels sont les délais de livraison ?", a: "Les délais varient selon votre localisation : 24-48h pour Alger, 2-5 jours pour les autres wilayas." },
    { q: "Quels sont les frais de livraison ?", a: "Les frais de livraison sont calculés en fonction de votre adresse et du poids de votre commande. La livraison est offerte dès 5000 DZD d'achat." },
    { q: "Livrez-vous dans toute l'Algérie ?", a: "Oui, nous livrons dans toutes les wilayas d'Algérie via nos partenaires Yalidine et ZR Express." },
    { q: "Puis-je suivre ma commande ?", a: "Oui, un numéro de suivi vous sera communiqué par email dès l'expédition de votre commande." },
    { q: "Que faire si je ne suis pas chez moi lors de la livraison ?", a: "Le livreur vous contactera par téléphone. Vous pouvez convenir d'un autre créneau ou faire livrer chez un voisin." },
  ],
  retours: [
    { q: "Quelle est votre politique de retour ?", a: "Vous disposez de 14 jours à compter de la réception pour retourner un produit non ouvert et en parfait état." },
    { q: "Comment retourner un produit ?", a: "Contactez notre service client pour obtenir un numéro de retour. Emballez soigneusement le produit et déposez-le chez notre transporteur partenaire." },
    { q: "Qui prend en charge les frais de retour ?", a: "Les frais de retour sont à votre charge, sauf en cas de produit défectueux ou d'erreur de notre part." },
    { q: "Quand serai-je remboursé ?", a: "Le remboursement est effectué sous 5 à 10 jours ouvrés après réception et vérification du produit retourné." },
    { q: "Puis-je échanger un produit ?", a: "Oui, vous pouvez demander un échange. Contactez notre service client pour connaître la procédure." },
  ],
  paiements: [
    { q: "Quels modes de paiement acceptez-vous ?", a: "Nous acceptons les cartes bancaires (Visa, Mastercard), CCP, Baridimob, et le paiement à la livraison." },
    { q: "Est-il possible de payer en plusieurs fois ?", a: "Pour le moment, nous ne proposons pas de paiement en plusieurs fois. Cette option sera disponible prochainement." },
    { q: "Le paiement est-il sécurisé ?", a: "Oui, tous les paiements sont cryptés et sécurisés. Nous utilisons des technologies conformes aux normes bancaires." },
    { q: "Puis-je payer à la livraison ?", a: "Oui, le paiement à la livraison est disponible pour toutes les commandes, avec un supplément de 200 DZD." },
  ],
  compte: [
    { q: "Comment créer un compte ?", a: "Cliquez sur 'Mon compte' en haut de la page, puis suivez les étapes d'inscription. C'est gratuit et rapide." },
    { q: "J'ai oublié mon mot de passe", a: "Cliquez sur 'Mot de passe oublié' sur la page de connexion. Un email de réinitialisation vous sera envoyé." },
    { q: "Comment modifier mes informations personnelles ?", a: "Connectez-vous à votre compte et accédez à la section 'Mes informations' pour modifier vos données." },
    { q: "Puis consulter l'historique de mes commandes ?", a: "Oui, dans votre espace client, la rubrique 'Mes commandes' répertorie l'ensemble de vos achats." },
  ],
};

export default async function FaqPage({ params }: Props) {
  const {} = await params;

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      {/* PAGE HEADER */}
      <section className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Questions fréquentes</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          Retrouvez les réponses aux questions les plus courantes. Si vous ne trouvez pas votre
          réponse, n&apos;hésitez pas à nous contacter.
        </p>
      </section>

      <Separator />

      {/* CATEGORY TABS */}
      <section>
        <Tabs defaultValue="commandes" className="w-full">
          <TabsList className="mb-8 w-full justify-start">
            <TabsTrigger value="commandes">Commandes</TabsTrigger>
            <TabsTrigger value="livraison">Livraison</TabsTrigger>
            <TabsTrigger value="retours">Retours</TabsTrigger>
            <TabsTrigger value="paiements">Paiements</TabsTrigger>
            <TabsTrigger value="compte">Compte</TabsTrigger>
          </TabsList>

          {Object.entries(faqData).map(([category, items]) => (
            <TabsContent key={category} value={category}>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {category === "commandes" && "Commandes"}
                    {category === "livraison" && "Livraison"}
                    {category === "retours" && "Retours"}
                    {category === "paiements" && "Paiements"}
                    {category === "compte" && "Compte"}
                  </CardTitle>
                  <CardDescription>
                    {category === "commandes" && "Tout savoir sur le processus de commande"}
                    {category === "livraison" && "Informations sur la livraison de vos colis"}
                    {category === "retours" && "Comment retourner ou échanger un produit"}
                    {category === "paiements" && "Moyens de paiement et sécurité"}
                    {category === "compte" && "Gestion de votre compte client"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {items.map((faq, index) => (
                      <AccordionItem key={index} value={`${category}-${index}`}>
                        <AccordionTrigger>{faq.q}</AccordionTrigger>
                        <AccordionContent>{faq.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      <Separator />

      {/* CONTACT CTA */}
      <section className="text-center">
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <CardTitle>Vous n&apos;avez pas trouvé votre réponse ?</CardTitle>
            <CardDescription>
              Notre équipe est à votre disposition pour répondre à toutes vos questions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/contact">Contactez-nous</a>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
