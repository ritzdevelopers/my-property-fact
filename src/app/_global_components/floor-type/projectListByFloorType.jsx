import HeaderComponent from "@/app/(home)/components/header/headerComponent";
import NewFooterDesign from "@/app/(home)/components/footer/NewFooterDesign";
import ProjectsRedesigned from "@/app/(home)/projects/ProjectsRedesigned";
import {
  buildCompoundListingTitle,
  citySlugToListingLabel,
  floorSlugToListingLabel,
  normalizeFloorSlugSegment,
} from "@/app/_global_components/masterFunction";

function resolveInitialFilters(floorType = "", categorySlug = null) {
  const label = String(floorType || "").trim();
  const lower = label.toLowerCase();
  const isBhk = /\d+\s*bhk|\d+\s*rk/i.test(lower);

  let hubCategory = "";
  let initialActiveTab = "all";

  if (categorySlug === "new-projects") {
    hubCategory = "new-projects";
  } else if (categorySlug === "commercial" || categorySlug === "offices-and-shop") {
    hubCategory = categorySlug;
    initialActiveTab = "commercial";
  } else if (categorySlug === "apartments" || categorySlug === "flats") {
    hubCategory = categorySlug;
    initialActiveTab = "residential";
  } else if (!isBhk && label) {
    // Non-BHK floor listings (shops/office/plots/etc.) behave like config filters.
    initialActiveTab = "commercial";
  } else if (isBhk) {
    initialActiveTab = "residential";
  }

  return {
    hubCategory,
    initialActiveTab,
    initialBhkType: isBhk ? label : "",
    initialConfigType: !isBhk && label ? label : "",
  };
}

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
  const categorySlug = compoundListing?.categorySlug ?? null;
  const filters = resolveInitialFilters(floorType, categorySlug);

  return (
    <>
      <HeaderComponent />
      <main id="primary-content" aria-labelledby="mpf-page-heading">
        <ProjectsRedesigned
          initialCity={cityName}
          initialActiveTab={filters.initialActiveTab}
          initialBhkType={filters.initialBhkType}
          initialConfigType={filters.initialConfigType}
          hubCategory={filters.hubCategory}
          breadcrumbParent={{ href: "/projects", label: "Projects" }}
          breadcrumbLabel={title ? `${title.replace("%20", " ")}` : "All Projects"}
          pageHeading={title ? `${title.replace("%20", " ")}` : "All Projects"}
          showBreadcrumb={true}
        />
      </main>
      <NewFooterDesign cityList={cityList} compactTop={true} />
    </>
  );
}
