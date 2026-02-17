import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

// Force dynamic rendering for all pages (SurrealDB fetches at request time)
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "ESG Hub — Open-Access ESG Encyclopedia",
    template: "%s | ESG Hub",
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
  ],
  authors: [{ name: "Ascent Partners Foundation" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ESG Hub",
    title: "ESG Hub — Open-Access ESG Encyclopedia",
    description:
      "Comprehensive ESG resources covering Environmental, Social, and Governance topics.",
    images: [{ url: "/esg-hub-logo.png", width: 512, height: 512 }],
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
