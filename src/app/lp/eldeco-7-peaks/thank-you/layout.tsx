import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank You | Eldeco 7 Peaks",
  description: "Your Eldeco 7 Peaks enquiry has been received.",
  robots: { index: false, follow: false },
};

export default function ThankYouLayout({ children }: { children: React.ReactNode }) {
  return children;
}
