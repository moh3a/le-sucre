import type { Metadata } from "next";
import { Noto_Sans, Noto_Serif } from "next/font/google";
import "@/app/globals.css";
import { cn } from "@/lib/utils";

const notoSerifHeading = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-heading",
});

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Le Sucré",
  description: "Your eCommerce platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased font-sans",
        "font-sans",
        notoSans.variable,
        notoSerifHeading.variable,
      )}
    >
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}
