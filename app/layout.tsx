import { cn } from "@/lib/utils";
import { SerwistProvider } from "@serwist/turbopack/react";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import {
  Geist,
  Inter,
  Inter_Tight,
  JetBrains_Mono,
  Roboto_Mono,
} from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: "700",
});

const APP_NAME = "CONDUIT";
const APP_DESCRIPTION = "Grocery Intelligence System";
const APP_TITLE = {
  default: APP_NAME,
  template: "%s - CONDUIT",
};

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: APP_TITLE,
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={cn(
        "h-full",
        inter.variable,
        robotoMono.variable,
        jetbrainsMono.variable,
        interTight.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body className="scanlines">
        <SerwistProvider swUrl="/serwist/sw.js">
          <NextIntlClientProvider>
            <>{children}</>
          </NextIntlClientProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}
