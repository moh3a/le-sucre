import type { PropsWithChildren } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

type Props = PropsWithChildren<{
  params: Promise<{ locale: string }>;
}>;

export default async function StorefrontLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
