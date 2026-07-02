import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

const CONTACT_INFO = [
  { icon: Mail, titleKey: "infoEmail", valueKey: "infoEmailValue" },
  { icon: Phone, titleKey: "infoPhone", valueKey: "infoPhoneValue" },
  { icon: MapPin, titleKey: "infoAddress", valueKey: "infoAddressValue" },
  { icon: Clock, titleKey: "infoHours", valueKey: "infoHoursValue" },
];

export async function generateMetadata({ params }: Props): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title") };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      <section className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">{t("subtitle")}</p>
      </section>

      <Separator />

      <section>
        <h2 className="mb-6 text-2xl font-bold">{t("infoTitle")}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CONTACT_INFO.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.titleKey}>
                <CardHeader>
                  <Icon className="mb-2 size-6 text-primary" />
                  <CardTitle className="text-base">{t(item.titleKey)}</CardTitle>
                  <CardDescription>{t(item.valueKey)}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator />

      <section className="mx-auto max-w-2xl">
        <h2 className="mb-6 text-2xl font-bold">{t("formTitle")}</h2>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">{t("formNameLabel")}</label>
              <Input id="name" placeholder={t("formNamePlaceholder")} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">{t("formEmailLabel")}</label>
              <Input id="email" type="email" placeholder={t("formEmailPlaceholder")} required />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">{t("formSubjectLabel")}</label>
            <Input id="subject" placeholder={t("formSubjectPlaceholder")} required />
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">{t("formMessageLabel")}</label>
            <Textarea id="message" placeholder={t("formMessagePlaceholder")} rows={6} required />
          </div>
          <Button type="submit" className="w-full sm:w-auto">{t("formSubmit")}</Button>
        </form>
      </section>

      <Separator />

      <section className="text-center">
        <h2 className="mb-4 text-2xl font-bold">{t("faqTitle")}</h2>
        <p className="text-muted-foreground mb-4">{t("faqDesc")}</p>
        <Button variant="outline" asChild>
          <Link href="/faq">{t("faqButton")}</Link>
        </Button>
      </section>

      <Separator />

      <section className="text-center">
        <h2 className="mb-6 text-2xl font-bold">{t("socialTitle")}</h2>
        <div className="flex justify-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
            </Link>
          </Button>
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="mb-6 text-2xl font-bold">{t("mapTitle")}</h2>
        <div className="bg-muted flex h-64 items-center justify-center rounded-lg">
          <div className="text-center">
            <MapPin className="text-muted-foreground mx-auto mb-2 size-8" />
            <p className="text-muted-foreground text-sm">{t("mapPlaceholder")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
