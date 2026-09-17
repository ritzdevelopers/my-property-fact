import {
  Montserrat,
  Playfair,
  Playfair_Display,
  Schibsted_Grotesk,
} from "next/font/google";
import "./globals.css";

/*
  Type families taken verbatim from the Figma frame (to28JffFfMbVRJHdRR4C0i,
  node 1:3). The frame uses four:
    Schibsted Grotesk  — all UI/body copy, Regular..ExtraBold plus Italic
    Playfair           — display headings, variable with opsz + wdth axes
                         (Figma sets fontVariationSettings: opsz 12, wdth 100)
    Playfair Display   — the metric row and the active amenity title
    Montserrat         — the single "/" glyph in the hero carousel counter
*/

const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const playfair = Playfair({
  variable: "--font-playfair",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Eldeco Terra & Sol — Iconic Luxury Apartments In Gurgaon",
  description:
    "3 / 3.5 BHK premium residences at Sector 80, Gurugram. Exclusive starting price ₹3.11 Cr*.",
};

export default function EldecoLayout({ children }) {
  return (
    <div
      className={`eldeco-terra-sol-page ${schibsted.variable} ${playfair.variable} ${playfairDisplay.variable} ${montserrat.variable}`}
    >
      {children}
    </div>
  );
}
