import type { Metadata } from "next";
import { Noto_Sans, Noto_Serif } from "next/font/google";
import "@/app/globals.css";
import { cn } from "@/lib/utils";
import { NextIntlClientProvider } from "next-intl";
import { AppProviders } from "@/components/providers/app-providers";
import { getLocale, getMessages } from "next-intl/server";

const notoSerifHeading = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-heading",
});

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Le Sucré",
  description: "Your eCommerce platform.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={cn(
        "h-full",
        "font-sans antialiased",
        "font-sans",
        notoSans.variable,
        notoSerifHeading.variable,
      )}
    >
      <body className="min-h-full">
        <NextIntlClientProvider messages={messages}>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
