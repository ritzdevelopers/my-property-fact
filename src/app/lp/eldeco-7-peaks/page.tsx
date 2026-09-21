import LandingPage from "./landing-page";
import { amenities, faqItems, project } from "@/eldeco-7-peak/lib/project-data";

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": ["ApartmentComplex", "Residence"],
    name: project.name,
    url: "https://mypropertyfact.in/lp/eldeco-7-peaks",
    image: "https://mypropertyfact.in/eldeco-7-peak/hero.webp",
    description: "Premium 3 BHK and 4 BHK residences in Omicron 1A, Greater Noida, with wraparound balconies, three-side-open planning and 18 named amenities.",
    address: { "@type": "PostalAddress", streetAddress: "Omicron 1A", addressLocality: "Greater Noida", addressRegion: "Uttar Pradesh", postalCode: "201310", addressCountry: "IN" },
    geo: { "@type": "GeoCoordinates", latitude: "[TO BE CONFIRMED]", longitude: "[TO BE CONFIRMED]" },
    numberOfAccommodationUnits: "[TO BE CONFIRMED]",
    amenityFeature: amenities.map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
    offers: [
      { "@type": "Offer", name: "3 BHK + 2T, 1650 sq ft", price: "23700000", priceCurrency: "INR", description: "Starting price ₹2.37 Cr*" },
      { "@type": "Offer", name: "4 BHK + 3T, 1850 sq ft", description: "Price on request" },
    ],
  },
  { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqItems.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) },
  { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://mypropertyfact.in/" }, { "@type": "ListItem", position: 2, name: "Eldeco 7 Peaks", item: "https://mypropertyfact.in/lp/eldeco-7-peaks" }] },
  { "@context": "https://schema.org", "@type": "Organization", name: "My Property Fact", url: "https://mypropertyfact.in/", logo: "https://mypropertyfact.in/eldeco-7-peak/my-property-fact-logo.webp" },
];

export default function Home() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><LandingPage /></>;
}
