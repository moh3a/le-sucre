import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Nous contacter",
};

export default async function ContactPage({ params }: Props) {
  const {} = await params;

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      <section className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Nous contacter</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          Une question, une suggestion ou une commande spéciale ? Nous sommes là pour vous aider.
        </p>
      </section>

      <Separator />

      {/* CONTACT INFO */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">Nos coordonnées</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <Mail className="mb-2 size-6 text-[#c8d152]" />
              <CardTitle className="text-base">Email</CardTitle>
              <CardDescription>contact@lesucre.dz</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Phone className="mb-2 size-6 text-[#c8d152]" />
              <CardTitle className="text-base">Téléphone</CardTitle>
              <CardDescription>+213 (0) 555 12 34 56</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <MapPin className="mb-2 size-6 text-[#c8d152]" />
              <CardTitle className="text-base">Adresse</CardTitle>
              <CardDescription>123 Rue Didouche Mourad, Alger</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Clock className="mb-2 size-6 text-[#c8d152]" />
              <CardTitle className="text-base">Horaires</CardTitle>
              <CardDescription>Lun-Sam 9h-20h</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <Separator />

      {/* CONTACT FORM */}
      <section className="mx-auto max-w-2xl">
        <h2 className="mb-6 text-2xl font-bold">Envoyez-nous un message</h2>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            // TODO: Implement form submission
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nom complet
              </label>
              <Input id="name" placeholder="Votre nom" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input id="email" type="email" placeholder="votre@email.com" required />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              Sujet
            </label>
            <Input id="subject" placeholder="Sujet de votre message" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message
            </label>
            <Textarea id="message" placeholder="Votre message..." rows={6} required />
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            Envoyer le message
          </Button>
        </form>
      </section>

      <Separator />

      {/* FAQ LINK */}
      <section className="text-center">
        <h2 className="mb-4 text-2xl font-bold">Vous avez des questions ?</h2>
        <p className="text-muted-foreground mb-4">
          Consultez notre FAQ pour trouver rapidement une réponse à vos questions.
        </p>
        <Button variant="outline" asChild>
          <a href="/faq">Consultez notre FAQ</a>
        </Button>
      </section>

      <Separator />

      {/* SOCIAL LINKS */}
      <section className="text-center">
        <h2 className="mb-6 text-2xl font-bold">Suivez-nous</h2>
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
      </section>

      <Separator />

      {/* MAP PLACEHOLDER */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">Nous trouver</h2>
        {/* TODO: Replace with actual Google Maps embed */}
        <div className="bg-muted flex h-64 items-center justify-center rounded-lg">
          <div className="text-center">
            <MapPin className="text-muted-foreground mx-auto mb-2 size-8" />
            <p className="text-muted-foreground text-sm">Carte interactive à venir</p>
          </div>
        </div>
      </section>
    </div>
  );
}
