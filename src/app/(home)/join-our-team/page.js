import Career from "./career";
import CareerHeroPreload from "./CareerHeroPreload";
import data from "../../_global_components/job-description.json";
export const metadata = {
  title: "Careers at MyPropertyFact | Join Our Real Estate Innovation Team",
  description:
    "Explore exciting career opportunities at MyPropertyFact. Join a passionate team shaping the future of real estate data, insights, and technology in India.",
  keywords: [
    "Join Our Team",
    "Careers at My Property Fact",
    "My Property Fact Jobs",
    "Real Estate Careers India",
    "Real Estate Jobs Noida",
    "Hiring in Noida",
  ],
  alternates: {
    canonical: "/join-our-team",
  },
};

export default function CareerPage() {
  return (
    <main id="primary-content" aria-labelledby="mpf-page-heading">
      <CareerHeroPreload />
      <Career jobsArr={data} />
    </main>
  );
}
