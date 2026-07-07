import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/features/contact_management/components/storefront/contact-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title") };
}

export default async function ContactPage() {
  return <ContactForm />;
}
