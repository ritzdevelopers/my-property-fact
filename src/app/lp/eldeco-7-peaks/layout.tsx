import type { Metadata } from "next";
import "./globals.css";

const title = "Eldeco 7 Peaks Greater Noida | Price & Floor Plans";
const description = "Explore Eldeco 7 Peaks in Omicron 1A, Greater Noida: 3 & 4 BHK homes from ₹2.37 Cr*. View prices, floor plans, amenities and RERA details.";

export const metadata: Metadata = {
  metadataBase: new URL("https://mypropertyfact.in"),
  title,
  description,
  alternates: { canonical: "/lp/eldeco-7-peaks" },
  openGraph: { type: "website", url: "/lp/eldeco-7-peaks", title, description, siteName: "My Property Fact", images: [{ url: "/eldeco-7-peak/hero.webp", width: 1200, height: 630, alt: "Eldeco 7 Peaks Residences in Omicron 1A, Greater Noida" }] },
  twitter: { card: "summary_large_image", title, description, images: ["/eldeco-7-peak/hero.webp"] },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function SevenPeaksLpLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
      {children}
    </>
  );
}
