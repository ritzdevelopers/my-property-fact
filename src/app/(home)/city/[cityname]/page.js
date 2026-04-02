import CityPage from "./citypage";
import axios from "axios";
import { cache } from "react";

export const dynamic = "force-dynamic";

/** One upstream request per slug per render (shared by metadata + page). */
const fetchCityDataBySlug = cache(async (slug) => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}city/get/${slug}`,
  );
  return response.data;
});

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }) {
  const { cityname } = await params;
  const cityData = await fetchCityDataBySlug(cityname);
  return {
    title: cityData.metaTitle,
    description: cityData.metaDescription,
    alternates: {
      canonical: `/city/${cityname}`,
    },
  };
}

// Main page component
export default async function AllCityProjects({ params }) {
  const { cityname } = await params;
  const cityData = await fetchCityDataBySlug(cityname);

  return (
    <CityPage cityData={cityData} />
  );
}
