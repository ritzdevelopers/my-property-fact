"use client";
import PropertyContainer from "@/app/(home)/components/common/page";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import {
  ProjectListingPaginationControls,
  useProjectListingPagination,
} from "@/app/_global_components/projectListingPagination";
import { useMemo, useRef } from "react";
import { cityNameMatchesFilter } from "../cityAliasUtils";
import { useSiteData } from "../contexts/SiteDataContext";
import {
  configTypeMatchesWanted,
  configTypesForFloorSlug,
  extractTypesFromProjectConfiguration,
  normalizeFloorSlugSegment,
  normalizeListingConfigType,
  projectMatchesCompoundCategory,
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
  return items.filter((item) =>
    projectMatchesCompoundCategory(item, categorySlug),
  );
}

function resolveFloorTypeAndCity({ title, floorTypeProp, cityNameProp }) {
  if (floorTypeProp != null && floorTypeProp !== "" && cityNameProp != null) {
    return { floorType: floorTypeProp, cityName: cityNameProp };
  }
  const parts = (title || "").split(/\s+In\s+/);
  return {
    floorType: parts[0]?.trim() || "",
    cityName: (parts[1] || "").replace(/%20/g, " ").trim(),
  };
}

export default function ProjectListByFloorTypeClient({
  title,
  floorType: floorTypeProp,
  cityName: cityNameProp,
  categorySlug = null,
  initialProjects = [],
}) {
  const { projectList = [], loading: siteDataLoading } = useSiteData();
  const { floorType, cityName } = useMemo(
    () => resolveFloorTypeAndCity({ title, floorTypeProp, cityNameProp }),
    [title, floorTypeProp, cityNameProp],
  );

  const filteredProjectsByBrType = useMemo(() => {
    const source = projectList.length ? projectList : initialProjects;
    if (!source.length || !cityName) return [];

    const cityNorm = normalizeListingConfigType(cityName);
    let filtered = source.filter((item) => cityMatches(item, cityNorm));
    if (floorType) {
      filtered = filtered.filter((item) =>
        matchesProjectConfigurationType(item.projectConfiguration, floorType),
      );
    }
    return applyListingCategoryFilter(filtered, categorySlug);
  }, [projectList, initialProjects, floorType, cityName, categorySlug]);

  const { pageItems, currentPage, totalPages, totalItems, setPage } =
    useProjectListingPagination(filteredProjectsByBrType);
  const listingsRef = useRef(null);

  const showLoading = siteDataLoading;

  return (
    <>
      <div className="container my-5">
        <h2 className="master-bhk-section-heading mb-3 mb-md-4">Projects</h2>
        <div className="row g-3" ref={listingsRef}>
          {showLoading ? (
            <div className="d-flex justify-content-center align-items-center w-100 py-5">
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
            scrollTargetRef={listingsRef}
          />
        )}
      </div>
    </>
  );
}
