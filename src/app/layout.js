import "./critical.css";
import "./globals.css";
import { Inter, Lato } from "next/font/google";
import { Suspense } from "react";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import SiteDataShell from "./_global_components/SiteDataShell";
import ThirdPartyScripts from "./(home)/components/_homecomponents/ThirdPartyScripts";
import WebsiteGateway from "./_global_components/WebsiteGateway";
import PopularProjectPromoFromRequest from "./_global_components/PopularProjectPromoFromRequest";

config.autoAddCss = false;

const siteUrl = process.env.NEXT_PUBLIC_UI_URL ?? "https://mypropertyfact.in";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "My Property Fact | A valuable platform for buyers and sellers",
    template: "%s",
  },
  description:
    "MPF provides accurate information about project and properties with verified details.",
  authors: [{ name: "My Property Fact" }],
  publisher: "My Property Fact",
  robots: {
    index: true,
    follow: true,
  },
  twitter: {
    card: "summary",
    title: "Best Property Deals in India | My Property Fact",
    site: "@my_propertyfact",
    description:
      "Looking to buy or invest in property? Explore trusted listings, price trends & expert advice on My Property Fact.",
    images: {
      url: `${siteUrl}/logo.webp`,
      alt: "My Property Fact",
    },
  },
  openGraph: {
    title:
      "My Property Fact | Real Estate Insights, Property News & Investment Tips",
    siteName: "MyPropertyFact",
    url: siteUrl,
    description:
      "Explore the latest real estate news, property trends, investment tips, and expert insights on MyPropertyFact. Your trusted guide for smart property decisions in India.",
    type: "website",
    images: [
      {
        url: `${siteUrl}/logo.webp`,
        alt: "MyPropertyFact - Real Estate Insights Platform",
      },
    ],
    locale: "en_IN",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "My Property Fact",
  url: siteUrl,
  logo: `${siteUrl}/logo.webp`,
  description:
    "Explore flats, residential & commercial properties across India on MyPropertyFact: NCR, Delhi, Faridabad, Noida, & top Indian cities with verified listings and top developers.",
  sameAs: [
    "https://www.facebook.com/mypropertyfact1",
    "https://www.instagram.com/my.property.fact",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "My Property Fact",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/projects?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const headingFont = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--heaing-font",
  display: "swap",
});

const textFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--text-font",
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <body
        className={`${headingFont.variable} ${textFont.variable}`}
        suppressHydrationWarning={true}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd]),
          }}
        />
           <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([websiteJsonLd]),
          }}
        />

        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WL4BBZM8"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=994098169297958&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        <SiteDataShell>{children}</SiteDataShell>
        <WebsiteGateway />
        <Suspense fallback={null}>
          <PopularProjectPromoFromRequest />
        </Suspense>

        <ThirdPartyScripts />
      </body>
    </html>
  );
}
