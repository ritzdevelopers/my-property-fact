import CommonBreadCrum from "@/app/(home)/components/common/breadcrum";
import CommonHeaderBanner from "@/app/(home)/components/common/commonheaderbanner";
import NewFooterDesign from "@/app/(home)/components/footer/NewFooterDesign";
import ProjectListByFloorTypeClient from "./projectListByFloorTypeClient";
import HeaderComponent from "@/app/(home)/components/header/headerComponent";
import {
  buildCompoundListingTitle,
  citySlugToListingLabel,
  floorSlugToListingLabel,
  normalizeFloorSlugSegment,
} from "@/app/_global_components/masterFunction";

export default function ProjectListByFloorType({
  slug,
  cityList = [],
  compoundListing = null,
  initialProjects = [],
}) {
  const title = compoundListing
    ? buildCompoundListingTitle(compoundListing)
    : slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

  const parts = slug.split("-in-");
  const floorSlug = compoundListing
    ? compoundListing.floorSlug
    : normalizeFloorSlugSegment(parts[0] || "");
  const citySlugStr = compoundListing
    ? compoundListing.citySlug
    : parts.slice(1).join("-in-");

  const floorType = floorSlugToListingLabel(floorSlug);
  const cityName = citySlugToListingLabel(citySlugStr);

  return (
    <>
      <HeaderComponent />
      <CommonHeaderBanner
        image={"project-banner.jpg"}
        headerText={title ? `${title.replace("%20", " ")}` : "All Projects"}
      />
      <CommonBreadCrum
        firstPage={"projects"}
        pageName={title ? `${title.replace("%20", " ")}` : "All Projects"}
      />
      <ProjectListByFloorTypeClient
        title={title}
        floorType={floorType}
        cityName={cityName}
        categorySlug={compoundListing?.categorySlug ?? null}
        initialProjects={initialProjects}
      />
      <NewFooterDesign cityList={cityList} compactTop={true} />
    </>
  );
}
