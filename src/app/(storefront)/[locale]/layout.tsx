import type { PropsWithChildren } from "react";
import { notFound } from "next/navigation";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { localesSchema } from "@/i18n/config";

type Props = PropsWithChildren<{
  params: Promise<{ locale: string }>;
}>;

export default async function StorefrontLayout({ children, params }: Props) {
  const { locale } = await params;
  try {
    localesSchema.parse(locale);
  } catch {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
