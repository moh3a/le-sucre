import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Props = {
  params: Promise<{ locale: string }>;
};

const SECTIONS = [
  "section_1",
  "section_2",
  "section_3",
  "section_4",
  "section_5",
  "section_6",
  "section_7",
];

export async function generateMetadata({ params }: Props): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return { title: t("title") };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      <section className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </section>

      <Separator />

      <section className="text-center">
        <p className="text-muted-foreground mx-auto max-w-2xl text-sm">{t("intro")}</p>
      </section>

      <Separator />

      <section className="space-y-6">
        {SECTIONS.map((section) => (
          <Card key={section}>
            <CardHeader>
              <CardTitle className="text-lg">{t(`${section}_title`)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">{t(`${section}_content`)}</p>
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
