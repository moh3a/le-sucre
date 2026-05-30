import type { Metadata } from "next";
import { Noto_Sans, Noto_Serif } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/components/providers/app-providers";

const notoSerifHeading = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-heading",
});

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" });

// import localFont from "next/font/local";
// export const font_heading = localFont({
//   src: [{ path: "../../public/fonts/Orla.woff2", weight: "400 700", style: "normal" }],
//   variable: "--font-heading",
//   display: "swap",
// });
// export const font_sans = localFont({
//   src: [{ path: "../../public/fonts/Moya.woff2", weight: "400 600", style: "normal" }],
//   variable: "--font-sans",
//   display: "swap",
// });

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
          <NuqsAdapter>
            <AppProviders>{children}</AppProviders>
          </NuqsAdapter>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
