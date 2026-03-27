import { redirect } from "next/navigation";
import Property from "./propertypage-server";
import {
  canonicalizeFloorInCitySlug,
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

export default async function PropertyPage({ params }) {
  const { slug } = await params;
  const canonicalFloorCity = canonicalizeFloorInCitySlug(slug);
  if (
    canonicalFloorCity &&
    canonicalFloorCity !== slug &&
    (await isFloorTypeUrl(canonicalFloorCity))
  ) {
    redirect(`/${canonicalFloorCity}`);
  }
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
