"use client";
import PropertyContainer from "@/app/(home)/components/common/page";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import {
  ProjectListingPaginationControls,
  useProjectListingPagination,
} from "@/app/_global_components/projectListingPagination";
import { useEffect, useState } from "react";
import { cityNameMatchesFilter } from "../cityAliasUtils";
import { useSiteData } from "../contexts/SiteDataContext";
import {
  configTypeMatchesWanted,
  configTypesForFloorSlug,
  extractTypesFromProjectConfiguration,
  normalizeFloorSlugSegment,
  normalizeListingConfigType,
} from "@/lib/listingFloorValidation";

const matchesProjectConfigurationType = (projectConfiguration, floorType) => {
  if (!floorType) return true;
  const configTypes = extractTypesFromProjectConfiguration(projectConfiguration);
  if (!configTypes.length) return false;

  const floorSlug = normalizeFloorSlugSegment(
    normalizeListingConfigType(floorType).replace(/\s+/g, "-"),
  );
  const wantedTypes = configTypesForFloorSlug(floorSlug);
  if (wantedTypes.length) {
    return configTypes.some((type) =>
      wantedTypes.some((wanted) => configTypeMatchesWanted(type, wanted)),
    );
  }

  const wanted = normalizeListingConfigType(floorType);
  if (!wanted) return true;

  const bhkWanted = wanted.match(/(\d+)\s*bhk/i);
  if (bhkWanted?.[1]) {
    return configTypes.includes(`${bhkWanted[1]} bhk`);
  }

  const brVillaWanted = wanted.match(/(\d+)\s*br\s*villa/i);
  if (brVillaWanted?.[1]) {
    return configTypes.some((type) =>
      configTypeMatchesWanted(type, `${brVillaWanted[1]} br villa`),
    );
  }

  return configTypes.some((type) => configTypeMatchesWanted(type, wanted));
};

const cityMatches = (item, cityKey) => cityNameMatchesFilter(cityKey, item);

function applyListingCategoryFilter(items, categorySlug) {
  if (!categorySlug || !items?.length) return items;
  switch (categorySlug) {
    case "new-projects":
      return items.filter((item) => item.projectStatusName === "New Launched");
    case "apartments":
    case "flats":
      return items.filter(
        (item) => item.propertyTypeName?.toLowerCase() === "residential",
      );
    case "commercial":
    case "offices-and-shop":
      return items.filter(
        (item) => item.propertyTypeName?.toLowerCase() === "commercial",
      );
    default:
      return items;
  }
}

export default function ProjectListByFloorTypeClient({
  title,
  floorType: floorTypeProp,
  cityName: cityNameProp,
  categorySlug = null,
  initialProjects = [],
}) {
  const { projectList = [], loading: siteDataLoading } = useSiteData();
  const [filteredProjectsByBrType, setFilteredProjectsByBrType] = useState(
    initialProjects,
  );
  const [floorType, setFloorType] = useState(floorTypeProp || "");
  const [cityName, setCityName] = useState(cityNameProp || "");

  const getListOfProjectFromBkType = (projects, floorType, city) => {
    if (!projects.length) return [];
    const cityNorm = normalizeListingConfigType(city);
    let filtered = projects.filter((item) => cityMatches(item, cityNorm));
    if (!floorType) return filtered;
    filtered = filtered.filter((item) =>
      matchesProjectConfigurationType(item.projectConfiguration, floorType),
    );
    return filtered;
  };

  useEffect(() => {
    if (floorTypeProp != null && floorTypeProp !== "" && cityNameProp != null) {
      setFloorType(floorTypeProp);
      setCityName(cityNameProp);
      return;
    }
    const parts = (title || "").split(/\s+In\s+/);
    const parsedFloorType = parts[0]?.trim() || "";
    const city = (parts[1] || "").replace(/%20/g, " ").trim();
    setFloorType(parsedFloorType);
    setCityName(city);
  }, [title, floorTypeProp, cityNameProp]);

  useEffect(() => {
    const source = projectList.length ? projectList : initialProjects;
    let filteredData = getListOfProjectFromBkType(source, floorType, cityName);
    filteredData = applyListingCategoryFilter(filteredData, categorySlug);
    setFilteredProjectsByBrType(filteredData);
  }, [projectList, floorType, cityName, categorySlug, initialProjects]);

  const { pageItems, currentPage, totalPages, totalItems, setPage } =
    useProjectListingPagination(filteredProjectsByBrType);

  const showLoading = siteDataLoading && filteredProjectsByBrType.length === 0;

  return (
    <>
      <div className="container my-5">
        <h2 className="master-bhk-section-heading mb-3 mb-md-4">Projects</h2>
        <div className="row g-3">
          {showLoading ? (
            <div className="d-flex justify-content-center align-items-center w-100">
              <LoadingSpinner show={showLoading} />
            </div>
          ) : pageItems.length > 0 ? (
            pageItems.map((project, index) => (
              <div key={project.id ?? index} className="col-12 col-sm-6 col-md-4">
                <PropertyContainer data={project} />
              </div>
            ))
          ) : null}
        </div>
        {!showLoading && filteredProjectsByBrType.length > 0 && (
          <ProjectListingPaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setPage}
          />
        )}
      </div>
    </>
  );
}
