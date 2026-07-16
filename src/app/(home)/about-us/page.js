import AboutUsV3 from "./AboutUsV3";
import {
  getAllProjects,
  fetchBuilderData,
  fetchCityData,
} from "@/app/_global_components/masterFunction";
import { normalizeBuildersResponse } from "../components/_homecomponents/topDevelopersMarqueeData";

export const metadata = {
  title: "About Us | MyPropertyFact – Real Estate Price Trends & Insights",
  description: "Discover the story behind MyPropertyFact – your trusted source for accurate real estate price trends, market insights, and property data across major Indian cities.",
  alternates: {
    canonical: "/about-us",
  },
};

export default async function AboutUsPage() {
  const [projects, buildersRes, cities] = await Promise.all([
    getAllProjects(),
    fetchBuilderData(),
    fetchCityData(),
  ]);
  const buildersList = normalizeBuildersResponse(buildersRes);
  const platformStats = {
    cities: Array.isArray(cities) ? cities.length : 0,
    builders: Array.isArray(buildersList) ? buildersList.length : 0,
    projects: Array.isArray(projects) ? projects.length : 0,
  };

  return (
    <main id="primary-content" aria-label="About My Property Fact">
      <AboutUsV3 platformStats={platformStats} />
    </main>
  );
}
