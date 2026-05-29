import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/constants";

const footerLinks = {
  boutique: {
    title: "Boutique",
    links: [
      { href: "/boutique", label: "Tous les produits" },
      { href: "/categories", label: "Catégories" },
      { href: "/promotions", label: "Promotions" },
      { href: "/nouveautes", label: "Nouveautés" },
    ],
  },
  compte: {
    title: "Mon compte",
    links: [
      { href: "/compte", label: "Mon profil" },
      { href: "/commandes", label: "Mes commandes" },
      { href: "/liste-souhaits", label: "Liste de souhaits" },
      { href: "/adresses", label: "Mes adresses" },
    ],
  },
  aide: {
    title: "Aide",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/livraison", label: "Livraison" },
      { href: "/retours", label: "Retours & échanges" },
      { href: "/contact", label: "Nous contacter" },
    ],
  },
  legal: {
    title: "Légal",
    links: [
      { href: "/cgv", label: "CGV" },
      { href: "/confidentialite", label: "Confidentialité" },
      { href: "/mentions-legales", label: "Mentions légales" },
      { href: "/cookies", label: "Cookies" },
    ],
  },
};

export function Footer() {
  return (
    <footer className="bg-brand-olive-leaf text-brand-lemon-chiffon border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="font-heading text-brand-lemon-lime mb-4 text-sm font-semibold tracking-wider uppercase">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-brand-lemon-chiffon/70 hover:text-brand-lemon-lime text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="bg-brand-lemon-chiffon/20 my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-heading text-brand-lemon-lime text-lg font-bold">{siteConfig.name}</p>
          <p className="text-brand-lemon-chiffon/60 text-sm">
            © {new Date().getFullYear()} {siteConfig.name}. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
