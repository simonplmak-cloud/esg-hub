import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AIChatWidget from "@/components/AIChatWidget";
import { Analytics } from "@vercel/analytics/next";
import "@/app/globals.css";

export const dynamic = "force-dynamic";

const SITE_URL = "https://esg-hub.ascent.partners";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ESG Hub — Open-Access ESG Encyclopedia",
    template: "%s — ESG Hub",
  },
  description:
    "Comprehensive, open-access ESG encyclopedia by Ascent Partners Foundation. Environmental, Social, and Governance resources for professionals, students, and researchers.",
  keywords: [
    "ESG",
    "Environmental",
    "Social",
    "Governance",
    "sustainability",
    "reporting",
    "IFRS",
    "SASB",
    "GRI",
    "TCFD",
    "climate",
    "ESG standards",
  ],
  authors: [{ name: "Ascent Partners Foundation" }],
  creator: "Ascent Partners Foundation",
  publisher: "Ascent Partners Foundation",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ESG Hub",
    title: "ESG Hub — Open-Access ESG Encyclopedia",
    description:
      "Comprehensive ESG resources covering Environmental, Social, and Governance topics. 307 articles and 244 curated external resources.",
    url: SITE_URL,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ESG Hub — Open-Access ESG Encyclopedia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ESG Hub — Open-Access ESG Encyclopedia",
    description:
      "Comprehensive ESG resources covering Environmental, Social, and Governance topics. 307 articles and 244 curated external resources.",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main>{children}</main>
          <Footer />
          <AIChatWidget />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
