import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "notFound" });
  return { title: t("title") };
}

export default async function NotFoundPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "notFound" });

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-8">
      <div className="mx-auto max-w-md text-center">
        <h1 className="mb-2 text-8xl font-bold text-primary">404</h1>
        <h2 className="mb-4 text-2xl font-bold">{t("subtitle")}</h2>
        <p className="text-muted-foreground mb-8">{t("description")}</p>
        <Button size="lg" className="mb-8" asChild>
          <Link href="/">{t("goHome")}</Link>
        </Button>

        <Separator />

        <div className="mt-8">
          <p className="text-muted-foreground mb-4 text-sm">{t("popularPages")}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: "/", label: t("popularHome") },
              { href: "/c", label: t("popularCatalog") },
              { href: "/faq", label: t("popularFaq") },
              { href: "/contact", label: t("popularContact") },
            ].map((link) => (
              <Button key={link.href} variant="outline" size="sm" asChild>
                <a href={link.href}>{link.label}</a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
