import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eldeco Echoes of Eden | Sector 22D",
  description: "Premium 3 BHK homes at Eldeco Echoes of Eden on the Yamuna Expressway.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
