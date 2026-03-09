import Property from "./propertypage";
import {
  fetchAllProjects,
  fetchCityData,
  fetchProjectDetailsBySlug,
  isCityTypeUrl,
  isFloorTypeUrl,
} from "@/app/_global_components/masterFunction";
import MasterBHKProjectsPage from "@/app/_global_components/bhk-components/master-bhk-server-component";
import ProjectListByFloorType from "@/app/_global_components/floor-type/projectListByFloorType";
import NotFound from "@/app/not-found";
import NewFooterDesign from "@/app/(home)/components/footer/NewFooterDesign";
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const response = await fetchProjectDetailsBySlug(slug);
  if (!(response.slugURL === slug)) {
    // Case 1: Master BHK listing page
    return {
      title:
        slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) +
        " Flats in India",
      description:
        "Browse apartments, villas, and plots categorized by BHK type. Get detailed price lists, floor plans, and location maps.",
      keywords: [
        slug.replace(/-/g, " ") + " flats",
        "apartments",
        "villas",
        "plots",
        "BHK flats in India",
      ],
    };
  }

  if (!response.projectAddress) {
    response.projectAddress = "";
  }
  return {
    title:
      response.metaTitle +
      " " +
      response.projectAddress +
      " | Price List & Brochure, Floor Plan, Location Map & Reviews",
    description: response.metaDescription,
    keywords: response.metaKeyword,
  };
}

export default async function PropertyPage({ params }) {
  const { slug } = await params;
  const [cityList, projectDetail, featuredProjects] = await Promise.all([
    fetchCityData(),
    fetchProjectDetailsBySlug(slug),
    fetchAllProjects(),
  ]);
  const isFloorTypeSlug = await isFloorTypeUrl(slug);
  const isProjectSlug = projectDetail.slugURL === slug;
  const isCitySlug = await isCityTypeUrl(slug);

  const projectCity = projectDetail.city || projectDetail.cityName;
  const similarProject = featuredProjects.filter(
    (item) =>
      item.cityName === projectDetail.city &&
      item.propertyTypeName === projectDetail.propertyTypeName &&
      item.id !== projectDetail.id,
  );
  
  if (isCitySlug) {
    return <MasterBHKProjectsPage slug={slug} cityList={cityList} />;
  } else if (isFloorTypeSlug) {
    {
      return <ProjectListByFloorType slug={slug} cityList={cityList} />;
    }
  } else if (isProjectSlug) {
    return (
      <>
        <Property projectDetail={projectDetail} similarProjects={similarProject} />
        <NewFooterDesign cityList={cityList} compactTop={true} />
      </>
    );
  } else {
    return <NotFound />;
  }
}
