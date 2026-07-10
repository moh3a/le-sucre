import type { PropsWithChildren } from "react";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnonymousSessionProvider } from "@/features/authentication_and_authorization/auth/components/AnonymousSessionProvider";

type Props = PropsWithChildren<{
  params: Promise<{ locale: string }>;
}>;

export default async function StorefrontLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AnonymousSessionProvider>
        <Header locale={locale} />
        <main className="flex-1 pb-16 md:pb-0">
          <div className="container mx-auto p-6">{children}</div>
        </main>
        <Footer />
      </AnonymousSessionProvider>
    </div>
  );
}
