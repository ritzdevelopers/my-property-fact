import { Poppins, Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-7peaks-poppins",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-7peaks-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-7peaks-inter",
  display: "swap",
});

export default function Eldeco7PeaksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`eldeco-7peaks-hide-scrollbar ${poppins.variable} ${cormorant.variable} ${inter.variable}`}
    >
      {children}
    </div>
  );
}
