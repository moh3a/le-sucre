import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/constants";

export async function Footer() {
  const t = await getTranslations("layout");

  const footerLinks = {
    boutique: {
      title: t("boutique_title"),
      links: [
        { href: "/boutique", label: t("all_products") },
        { href: "/categories", label: t("categories") },
        { href: "/promotions", label: t("promotions") },
        { href: "/nouveautes", label: t("new_arrivals") },
      ],
    },
    compte: {
      title: t("my_account_title"),
      links: [
        { href: "/compte", label: t("my_profile") },
        { href: "/commandes", label: t("my_orders") },
        { href: "/liste-souhaits", label: t("wishlist") },
        { href: "/adresses", label: t("my_addresses") },
      ],
    },
    aide: {
      title: t("help_title"),
      links: [
        { href: "/faq", label: t("faq") },
        { href: "/livraison", label: t("shipping") },
        { href: "/retours", label: t("returns_exchanges") },
        { href: "/contact", label: t("contact_us") },
      ],
    },
    legal: {
      title: t("legal_title"),
      links: [
        { href: "/cgv", label: t("terms") },
        { href: "/confidentialite", label: t("privacy") },
        { href: "/mentions-legales", label: t("legal_notices") },
        { href: "/cookies", label: t("cookies") },
      ],
    },
  };
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
            © {new Date().getFullYear()} {siteConfig.name}. {t("all_rights_reserved")}
          </p>
        </div>
      </div>
    </footer>
  );
}
