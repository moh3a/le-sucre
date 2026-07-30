import { getTranslations } from "next-intl/server";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";
import { APP_NAME } from "@/constants";

type Props = {
  params: Promise<{ locale: string }>;
};

const SECTIONS = [
  { id: "section_1" },
  { id: "section_2" },
  { id: "section_3" },
  { id: "section_4" },
  { id: "section_5" },
  { id: "section_6" },
  { id: "section_7" },
] as const;

export async function generateMetadata({ params }: Props): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  const tBc = await getTranslations({ locale, namespace: "breadcrumb" });

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      <StorefrontBreadcrumbs
        items={[{ label: tBc("home"), href: "/" }, { label: tBc("privacy") }]}
      />
      <section className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-balance">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </section>

      <Separator />

      <section className="text-center">
        <p className="text-muted-foreground mx-auto max-w-2xl text-sm leading-relaxed text-balance">
          {t("intro", { appName: APP_NAME })}
        </p>
      </section>

      <Separator />

      <section className="space-y-6">
        {SECTIONS.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="font-heading text-lg">{t(`${section.id}_title`)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t(`${section.id}_content`)}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Separator />

      <section className="text-center">
        <p className="text-muted-foreground text-sm">{t("footer")}</p>
      </section>
    </div>
  );
}
