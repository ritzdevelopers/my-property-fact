import EldecoTailwindGate from "./EldecoTailwindGate";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    <EldecoTailwindGate>
      <div className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </div>
    </EldecoTailwindGate>
  );
}
