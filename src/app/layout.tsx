import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/components/providers/app-providers";
import { Toaster } from "@/components/ui/sonner";
import { APP_NAME } from "@/constants";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: "Votre plateforme e-commerce de confiance.",
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
        montserrat.variable,
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <NextIntlClientProvider messages={messages}>
          <NuqsAdapter>
            <ThemeProvider
              defaultTheme="system"
            >
              <AppProviders>{children}</AppProviders>
              <Toaster />
            </ThemeProvider>
          </NuqsAdapter>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
