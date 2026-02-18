import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AIChatWidget from "@/components/AIChatWidget";
import "./globals.css";

export const dynamic = "force-dynamic";

const SITE_URL = "https://esg-hub-six.vercel.app";

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
      "Comprehensive ESG resources covering Environmental, Social, and Governance topics.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Header />
        <main id="main-content" role="main">
          {children}
        </main>
        <Footer />
        <AIChatWidget />
      </body>
    </html>
  );
}
