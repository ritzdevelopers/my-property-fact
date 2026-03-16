import CityPage from "./citypage";
import axios from "axios";
export const dynamic = 'force-dynamic';
// Fetch SEO data by city slug
async function fetchData(slug) {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}city/get/${slug}`);
  return response.data;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }) {
  const { cityname } = await params;
  const cityData = await fetchData(cityname);  
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
  const [cityData] = await Promise.all([
    fetchData(cityname)
  ]);

  return (
    <CityPage cityData={cityData} />
  );
}
