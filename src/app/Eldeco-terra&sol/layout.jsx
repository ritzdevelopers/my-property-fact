import EldecoTailwindGate from "./EldecoTailwindGate";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const GTAG_ID = "AW-16457709652";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title:
    "Eldeco Terra & Sol | Palatial 3 BR Homes | Sector 80 Gurugram | Starting ₹3.11 Cr*",
  description:
    "Discover Eldeco Terra & Sol — Palatial 3 BR World Residences in Sector 80, Gurugram. Japanese-inspired architecture, all-corner homes with infinite views & 100+ ft. balcony decks. Exclusive offer: Pay 30% now & nothing till 36 months*. Starting ₹3.11 Cr*. Only 2 towers. Limited units. Enquire Now!",
  keywords: [
    "Eldeco Terra & Sol",
    "Eldeco Terra & Sol Gurugram",
    "Luxury flats in Sector 80 Gurugram",
    "3 BHK flats in Gurugram",
    "New launch flats Gurugram 2026",
    "Luxury homes Sector 80 Gurgaon",
  ],
};

export default function EldecoLayout({ children }) {
  return (
    <>
      <Script
        id="eldeco-landing-gtag-base"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
          `,
        }}
      />
      <Script
        id="eldeco-landing-gtag-js"
        src={`https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="eldeco-landing-gtag-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            gtag('js', new Date());
            gtag('config', '${GTAG_ID}');
          `,
        }}
      />
      <EldecoTailwindGate>
        <div className={`${geistSans.variable} ${geistMono.variable}`}>
          {children}
        </div>
      </EldecoTailwindGate>
    </>
  );
}
