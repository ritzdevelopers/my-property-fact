import "./critical.css";
import "./globals.css";
import localFont from "next/font/local";
import { Suspense, cache } from "react";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import Providers from "./_global_components/providers/Providers";
import { SiteDataProvider } from "./_global_components/contexts/SiteDataContext";
import { fetchSiteDataFromApi } from "./_global_components/siteData/fetchSiteDataApi";
import ThirdPartyScripts from "./(home)/components/_homecomponents/ThirdPartyScripts";
config.autoAddCss = false;

const getSiteDataForRootLayout = cache(async () => {
  try {
    return await fetchSiteDataFromApi();
  } catch (err) {
    console.error("Server site data fetch failed:", err);
    return null;
  }
});

// app/layout.js
export const metadata = {
  title: "My Property Fact | A valuable platform for buyers and sellers",
  description: "MPF provides accurate information about project and properties with verified details.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_UI_URL ?? "https://mypropertyfact.in")
};

// local fonts are loaded here
const gothamBold = localFont({
  src: "../../public/fonts/plus_jakarta_sans/PlusJakartaSans-VariableFont_wght.ttf",
  variable: "--heaing-font",
  style: "normal",
  display: "swap",
  preload: true,
});

const gothamLight = localFont({
  src: "../../public/fonts/montserrat/Montserrat-VariableFont_wght.ttf",
  variable: "--text-font",
  style: "normal",
  display: "swap",
  preload: true,
});

export default async function RootLayout({ children }) {
  const initialSiteData = await getSiteDataForRootLayout();

  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "My Property Fact",
                url: process.env.NEXT_PUBLIC_UI_URL || "https://mypropertyfact.in",
                logo: `${process.env.NEXT_PUBLIC_UI_URL || "https://mypropertyfact.in"}/logo.webp`,
                description:
                  "Discover top property insights, LOCATE scores, and real estate trends across India.",
                sameAs: [
                  "https://www.facebook.com/mypropertyfact1",
                  "https://www.instagram.com/my.property.fact",
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "My Property Fact",
                url: process.env.NEXT_PUBLIC_UI_URL || "https://mypropertyfact.in",
                potentialAction: {
                  "@type": "SearchAction",
                  target: `${process.env.NEXT_PUBLIC_UI_URL || "https://mypropertyfact.in"}/projects?search={search_term_string}`,
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />

          <script type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "http://schema.org/",
              "@type": "Product",
              "name": "Eldeco Camelot",
              "image": "https://mypropertyfact.in/_next/image?url=https%3A%2F%2Fapis.mypropertyfact.in%2Fapi%2Fv1%2Fget%2Fimages%2Fproperties%2Feldeco-camelot%2F1770876748447_Eldeco_Camelot_Desktop_Banner_2_-_My_Property_Fact.jpg&w=1920&q=75",
              "description": "Eldeco Camelot in Sector 17 Dwarka, Delhi offers premium 3 & 4 BHK apartments with modern amenities, clubhouse, landscaped greens, and excellent connectivity to IGI Airport and major NCR hubs.",
              "sku": "001",
              "brand": {
                "@type": "Brand",
                "name": "My Property Fact"
              },
              "offers": {
                "@type": "Offer",
                "priceCurrency": "INR",
                "price": "74200000",
                "url": "https://mypropertyfact.in/eldeco-camelot",
                "itemCondition": "https://schema.org/NewCondition",
                "priceValidUntil": "2026-12-31"
              }

            })
          }}
        />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Best Property Deals in India | My Property Fact" />
        <meta name="twitter:site" content="@my_propertyfact" />
        <meta name="twitter:description" content="Looking to buy or invest in property? Explore trusted listings, price trends & expert advice on My Property Fact." />
        <meta name="twitter:image" content="https://mypropertyfact.in/logo.webp" />
        <meta name="twitter:image:alt" content="My Property Fact" />

          
        <meta name="author" content="My Property Fact" />
        <meta name="publisher" content="My Property Fact" />

          
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="My Property Fact | Real Estate Insights, Property News & Investment Tips" />
        <meta property="og:site_name" content="MyPropertyFact" />
        <meta property="og:url" content="https://mypropertyfact.in/" />
        <meta property="og:description" content="Explore the latest real estate news, property trends, investment tips, and expert insights on MyPropertyFact. Your trusted guide for smart property decisions in India." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://mypropertyfact.in/logo.webp" />
        <meta property="og:image:alt" content="MyPropertyFact - Real Estate Insights Platform" />
        <meta property="og:locale" content="en_IN" />
      </head>
      <body
        className={`${gothamBold.variable} ${gothamLight.variable}`} suppressHydrationWarning={true}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WL4BBZM8"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        {/* Meta Pixel noscript fallback - img required for no-JS tracking */}
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

        <Providers>
          <Suspense fallback={null}>
            <SiteDataProvider initialData={initialSiteData}>
              {children}
            </SiteDataProvider>
          </Suspense>
        </Providers>

        {/* third party scripts are loaded here */}
        <ThirdPartyScripts />

        {/* Accept or reject cookies component  */}
        {/* <CookieConsent /> */}
      </body>
    </html>
  );
}