import HomePage from "./components/home/HomePage";
import HomeIntroMotion from "./components/home/HomeIntroMotion";
import HeroLcpPreloads from "./components/_homecomponents/HeroLcpPreloads";
import JsonLdScript from "@/app/_global_components/jsonLd/JsonLdScript";
import { buildFaqJsonLd } from "@/app/_global_components/jsonLd/buildJsonLd";
import { HOME_FAQ_ITEMS } from "./components/home/noida-projects/homeFaqItems";

export const metadata = {
  title: "Verified Properties & Real Estate in India & Delhi NCR | My Property Fact",
  description:
    "Explore verified properties, new projects and real estate opportunities across India and Delhi NCR. Find residential & commercial properties with My Property Fact",
  keywords: [
    "My Property Fact",
    "property in Delhi NCR",
    "properties in Gurgaon",
    "properties in Noida",
    "property in Delhi",
    "flats in Gurgaon",
    "flats in Noida",
    "flats in Delhi",
    "apartments in Gurgaon",
    "apartments in Noida",
    "new projects in Gurgaon",
    "new projects in Noida",
    "new projects in Delhi NCR",
    "residential property",
    "commercial property",
    "real estate India",
    "real estate Delhi NCR",
    "property investment",
    "property listings",
    "verified properties",
    "RERA approved projects",
    "RERA registered projects",
    "property price trends",
    "real estate investment",
    "property buying",
    "property developers",
    "real estate projects",
    "upcoming projects in Gurgaon",
    "upcoming projects in Noida",
  ],
  openGraph: {
    title: "Verified Properties & Real Estate in India & Delhi NCR | My Property Fact",
    description:
      "Explore verified properties, new projects and real estate opportunities across India and Delhi NCR. Find residential & commercial properties with My Property Fact",
    url: "https://mypropertyfact.in/",
  },
  twitter: {
    title: "Verified Properties & Real Estate in India & Delhi NCR | My Property Fact",
    description:
      "Explore verified properties, new projects and real estate opportunities across India and Delhi NCR. Find residential & commercial properties with My Property Fact",
  },
};

export default function Home() {
  return (
    <>
      <link rel="canonical" href="https://mypropertyfact.in/" />
      <JsonLdScript data={buildFaqJsonLd(HOME_FAQ_ITEMS)} />
      <HeroLcpPreloads />
      <HomeIntroMotion>
        <HomePage />
      </HomeIntroMotion>
    </>
  );
}
