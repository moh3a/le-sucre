import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = { title: "Accueil" };

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-8">
      {/* HERO BANNER - campaign carousel */}
      <section className="from-lemon-lime/20 to-lemon-chiffon/40 relative overflow-hidden rounded-2xl bg-linear-to-r p-12 md:p-20">
        <div className="relative z-10 max-w-xl space-y-4">
          <Badge className="bg-crimson-violet text-white">
            {t("home.new_collection") || "Nouvelle collection"}
          </Badge>
          <h1 className="text-4xl font-bold md:text-5xl">
            {t("home.hero_title") || "Des douceurs qui font la différence"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("home.hero_subtitle") ||
              "Découvrez notre sélection de produits premium livrés chez vous."}
          </p>
          <Button size="lg">{t("home.shop_now") || "Acheter maintenant"}</Button>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/3 bg-[url('/placeholder-hero.png')] bg-cover bg-center opacity-20" />
      </section>

      {/* FEATURED CATEGORIES */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t("home.categories") || "Catégories populaires"}</h2>
          <Button variant="link">{t("home.see_all") || "Voir tout"}</Button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="group cursor-pointer overflow-hidden p-4 text-center transition-shadow hover:shadow-md"
            >
              <div className="bg-muted mx-auto mb-3 h-20 w-20 rounded-full" />
              <p className="text-sm font-medium">Catégorie {i + 1}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* FLASH SALE COUNTDOWN */}
      <section className="bg-olive-leaf/10 space-y-6 rounded-xl p-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="text-2xl font-bold">{t("home.flash_sale") || "Vente flash"}</h2>
            <p className="text-muted-foreground">
              {t("home.flash_sale_subtitle") || "Offres limitées dans le temps"}
            </p>
          </div>
          <div className="flex gap-3 text-center">
            {["08", "12", "45", "30"].map((val, i) => (
              <div key={i} className="bg-background rounded-lg px-3 py-2 shadow-sm">
                <span className="text-2xl font-bold">{val}</span>
                <p className="text-muted-foreground text-xs">
                  {["Heures", "Minutes", "Secondes"][i] || "Jours"}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="space-y-2 p-3">
              <div className="bg-muted aspect-square w-full rounded-md" />
              <p className="text-sm font-medium">Produit flash {i + 1}</p>
              <div className="flex items-center gap-2">
                <span className="text-destructive font-semibold">{(4 - i) * 1000} DZD</span>
                <span className="text-muted-foreground text-xs line-through">
                  {(4 - i) * 1500} DZD
                </span>
              </div>
              <Badge variant="destructive">-{(4 - i) * 10}%</Badge>
            </Card>
          ))}
        </div>
      </section>

      {/* TRENDING PRODUCTS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t("home.trending") || "Tendances"}</h2>
          <Button variant="link">{t("home.see_all") || "Voir tout"}</Button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="min-w-[200px] shrink-0 space-y-2 p-3">
              <Skeleton className="aspect-square w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t("home.new_arrivals") || "Nouveautés"}</h2>
          <Button variant="link">{t("home.see_all") || "Voir tout"}</Button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="space-y-2 p-3">
              <div className="bg-muted aspect-square w-full rounded-md" />
              <p className="text-sm font-medium">Nouveau produit {i + 1}</p>
              <p className="text-muted-foreground text-sm">{(i + 1) * 2000} DZD</p>
              <Badge variant="secondary">{t("home.new") || "Nouveau"}</Badge>
            </Card>
          ))}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t("home.best_sellers") || "Meilleures ventes"}</h2>
          <Button variant="link">{t("home.see_all") || "Voir tout"}</Button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="space-y-2 p-3">
              <div className="bg-muted aspect-square w-full rounded-md" />
              <p className="text-sm font-medium">Best-seller {i + 1}</p>
              <p className="text-muted-foreground text-sm">{(i + 1) * 3000} DZD</p>
              <div className="flex items-center gap-1 text-xs text-yellow-500">
                {"★".repeat(5 - i)}
                {"☆".repeat(i)}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* BRAND STRIP */}
      <section className="space-y-6 py-8">
        <h2 className="text-center text-2xl font-bold">{t("home.brands") || "Nos marques"}</h2>
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-muted h-8 w-24 rounded" />
          ))}
        </div>
      </section>

      {/* PROMOTIONAL BANNERS */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          {
            label: t("home.promo_delivery") || "Livraison offerte",
            desc: t("home.promo_delivery_desc") || "Dès 5 000 DZD d'achat",
          },
          {
            label: t("home.promo_return") || "Retour facile",
            desc: t("home.promo_return_desc") || "Satisfait ou remboursé sous 14 jours",
          },
        ].map((banner, i) => (
          <Card
            key={i}
            className="from-lemon-chiffon/30 to-cream/50 flex items-center gap-4 bg-linear-to-br p-6"
          >
            <div className="bg-lemon-lime/30 flex h-12 w-12 items-center justify-center rounded-full text-2xl">
              {i === 0 ? "🚚" : "🔄"}
            </div>
            <div>
              <p className="font-semibold">{banner.label}</p>
              <p className="text-muted-foreground text-sm">{banner.desc}</p>
            </div>
          </Card>
        ))}
      </section>

      {/* NEWSLETTER CTA */}
      <section className="bg-olive-leaf space-y-4 rounded-xl p-12 text-center text-white">
        <h2 className="text-3xl font-bold">{t("home.newsletter_title") || "Restez informé"}</h2>
        <p className="text-white/80">
          {t("home.newsletter_subtitle") ||
            "Recevez nos offres exclusives et les dernières nouvelles."}
        </p>
        <div className="mx-auto flex max-w-md gap-2">
          <input
            type="email"
            placeholder={t("home.newsletter_placeholder") || "Votre adresse email"}
            className="text-foreground flex-1 rounded-md px-4 py-2"
          />
          <Button variant="secondary">{t("home.newsletter_subscribe") || "S'abonner"}</Button>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="space-y-6">
        <h2 className="text-center text-2xl font-bold">
          {t("home.testimonials") || "Ce qu'ils disent"}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="space-y-3 p-6 text-center">
              <div className="bg-muted mx-auto h-16 w-16 rounded-full" />
              <p className="text-muted-foreground text-sm italic">
                &ldquo;
                {t("home.testimonial_text") ||
                  "Excellent service et produits de qualité. Je recommande vivement !"}
                &rdquo;
              </p>
              <p className="text-sm font-medium">
                {t("home.testimonial_author") || "Client"} {i + 1}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
