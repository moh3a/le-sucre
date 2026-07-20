import { getTranslations } from "next-intl/server";
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
import { Link } from "@/i18n/navigation";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";

type Props = {
  params: Promise<{ locale: string }>;
};

const CATEGORIES = [
  { id: "commandes", questions: 5 },
  { id: "livraison", questions: 5 },
  { id: "retours", questions: 5 },
  { id: "paiements", questions: 4 },
  { id: "compte", questions: 4 },
] as const;

export async function generateMetadata({ params }: Props): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  const tBc = await getTranslations({ locale, namespace: "breadcrumb" });

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      <StorefrontBreadcrumbs items={[{ label: tBc("home"), href: "/" }, { label: tBc("faq") }]} />
      <section className="text-center">
        <h1 className="mb-4 text-balance text-4xl font-bold">{t("heading")}</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg text-balance leading-relaxed">
          {t("subtitle")}
        </p>
      </section>

      <Separator />

      <section>
        <Tabs defaultValue="commandes" className="w-full">
          <TabsList className="mb-8 w-full justify-start">
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {t(`tab_${cat.id}`)}
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <Card>
                <CardHeader>
                  <CardTitle>{t(`${category.id}_title`)}</CardTitle>
                  <CardDescription>{t(`${category.id}_desc`)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {Array.from({ length: category.questions }).map((_, index) => (
                      <AccordionItem key={index} value={`${category.id}-${index}`}>
                        <AccordionTrigger>
                          {t(`${category.id}_q_${index + 1}`)}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                          {t(`${category.id}_a_${index + 1}`)}
                        </AccordionContent>
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

      <section className="text-center">
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <CardTitle>{t("ctaTitle")}</CardTitle>
            <CardDescription>{t("ctaDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/contact">{t("ctaButton")}</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
