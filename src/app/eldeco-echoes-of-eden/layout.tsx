import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import { Footer } from "@/eldeco-echoes-of-eden/components/Footer";
import { Navbar } from "@/eldeco-echoes-of-eden/components/Navbar";
import { AppProviders } from "@/eldeco-echoes-of-eden/components/providers/AppProviders";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  style: ["italic", "normal"],
});

export const metadata: Metadata = {
  title: "Eldeco | Premium Real Estate",
  description:
    "Discover premium residential developments by Eldeco Group — trusted quality, timely delivery, and thoughtfully planned communities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${playfair.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-[#DBE4DD] pb-[calc(5rem+env(safe-area-inset-bottom,0px))] font-sans text-[#1D3B2F] antialiased lg:pb-0">
        <AppProviders>
          <Navbar />
          {children}
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
