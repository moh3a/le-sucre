import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { APP_NAME } from "@/constants";

type Props = {
  params: Promise<{ locale: string }>;
};

type Article = {
  number: number;
  titleKey: string;
  contentKey: string;
};

const ARTICLES: Article[] = Array.from({ length: 10 }, (_, i) => ({
  number: i + 1,
  titleKey: `article_${i + 1}_title`,
  contentKey: `article_${i + 1}_content`,
}));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  return {
    title: t("title"),
    description: t("lastUpdated"),
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      <section className="text-center">
        <h1 className="mb-4 text-balance text-4xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("lastUpdated")}</p>
      </section>

      <Separator />

      <section className="text-center">
        <p className="text-muted-foreground mx-auto max-w-2xl text-sm leading-relaxed text-balance">
          {t("readNotice")}
        </p>
      </section>

      <Separator />

      <section className="space-y-6">
        {ARTICLES.map((article) => (
          <Card key={article.number}>
            <CardHeader>
              <CardTitle className="text-lg font-heading">
                {t("articleLabel", { number: article.number })} — {t(article.titleKey)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t(article.contentKey, { appName: APP_NAME })}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Separator />

      <section className="text-center">
        <p className="text-muted-foreground text-sm">{t("contactText")}</p>
      </section>
    </div>
  );
}
