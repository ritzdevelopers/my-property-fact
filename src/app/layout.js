import "./critical.css";
import "./globals.css";
import localFont from "next/font/local";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import Providers from "./_global_components/providers/Providers";
import { SiteDataProvider } from "./_global_components/contexts/SiteDataContext";
import ThirdPartyScripts from "./(home)/components/_homecomponents/ThirdPartyScripts";
config.autoAddCss = false;

// app/layout.js
export const metadata = {
  title: "My Property Fact | A valuable platform for buyers and sellers",
  description: "MPF provides accurate information about project and properties with verified details.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_UI_URL ?? "https://www.mypropertyfact.in")
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

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        {/* Preload LCP hero image for home (mobile-first) */}
        <link rel="preload" as="image" href="/static/banners/Irish_phone.jpg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "My Property Fact",
              url: process.env.NEXT_PUBLIC_UI_URL,
              logo: `${process.env.NEXT_PUBLIC_UI_URL}/logo.webp`,
              description:
                "Discover top property insights, LOCATE scores, and real estate trends across India.",
              sameAs: [
                "https://www.facebook.com/mypropertyfact1",
                "https://www.instagram.com/my.property.fact",
              ],
            }),
          }}
        />
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
          <SiteDataProvider>
            {children}
          </SiteDataProvider>
        </Providers>

        {/* third party scripts are loaded here */}
        <ThirdPartyScripts />

        {/* Accept or reject cookies component  */}
        {/* <CookieConsent /> */}
      </body>
    </html>
  );
}