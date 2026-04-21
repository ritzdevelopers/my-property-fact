"use client";
import PropertyContainer from "@/app/(home)/components/common/page";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import {
  ProjectListingPaginationControls,
  useProjectListingPagination,
} from "@/app/_global_components/projectListingPagination";
import { useEffect, useState } from "react";
import { useSiteData } from "../contexts/SiteDataContext";

const normalizeType = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/%20/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractTypesFromProjectConfiguration = (value = "") => {
  if (!value || typeof value !== "string") return [];
  const types = new Set();
  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  parts.forEach((part) => {
    // Drop trailing area text: "3 BHK - 1450 sq.ft"
    const cleanedPart = part
      .replace(/\s*-\s*\d+\s*(?:sq\.?\s*ft|sq\.?ft)\s*/gi, "")
      .trim();
    if (!cleanedPart) return;

    // Pull all BHK types from mixed strings.
    const bhkRegex = /(\d+)\s*(?:\/|&|and|-)?\s*(\d+)?\s*BHK/gi;
    let bhkMatch;
    let foundBhk = false;
    while ((bhkMatch = bhkRegex.exec(cleanedPart)) !== null) {
      foundBhk = true;
      if (bhkMatch[1]) types.add(`${bhkMatch[1]} bhk`);
      if (bhkMatch[2]) types.add(`${bhkMatch[2]} bhk`);
    }

    if (!foundBhk) {
      types.add(normalizeType(cleanedPart));
    }
  });

  return Array.from(types);
};

const matchesProjectConfigurationType = (projectConfiguration, floorType) => {
  const wanted = normalizeType(floorType);
  if (!wanted) return true;
  const configTypes = extractTypesFromProjectConfiguration(projectConfiguration);
  if (!configTypes.length) return false;

  const bhkWanted = wanted.match(/(\d+)\s*bhk/i);
  if (bhkWanted?.[1]) {
    return configTypes.includes(`${bhkWanted[1]} bhk`);
  }

  return configTypes.some(
    (type) => type === wanted || type.includes(wanted) || wanted.includes(type)
  );
};

const cityMatches = (item, cityKey) => {
  const ck = normalizeType(cityKey);
  if (!ck) return false;

  const cityNorm = normalizeType(item?.cityName || "");
  const addrNorm = normalizeType(item?.projectAddress || "");
  const localityNorm = normalizeType(item?.projectLocality || "");

  return (
    cityNorm === ck ||
    cityNorm.includes(ck) ||
    addrNorm.includes(ck) ||
    localityNorm.includes(ck)
  );
};

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
}) {
  const { projectList = [], loading: siteDataLoading } = useSiteData();
  const [filteredProjectsByBrType, setFilteredProjectsByBrType] = useState([]);
  const [floorType, setFloorType] = useState(floorTypeProp || "");
  const [cityName, setCityName] = useState(cityNameProp || "");
  const getListOfProjectFromBkType = (projects, floorType, city) => {
    if (!projects.length) return [];
    const cityNorm = normalizeType(city);
    let filtered = projects.filter(
      (item) => cityMatches(item, cityNorm)
    );
    if (!floorType) return filtered;
    filtered = filtered.filter((item) =>
      matchesProjectConfigurationType(item.projectConfiguration, floorType)
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
    let filteredData = getListOfProjectFromBkType(
      projectList,
      floorType,
      cityName,
    );
    filteredData = applyListingCategoryFilter(filteredData, categorySlug);
    setFilteredProjectsByBrType(filteredData);
  }, [projectList, floorType, cityName, categorySlug]);

  const { pageItems, currentPage, totalPages, totalItems, setPage } =
    useProjectListingPagination(filteredProjectsByBrType);

  return (
    <>
      <div className="container my-5">
        <h2 className="master-bhk-section-heading mb-3 mb-md-4">
          Projects
        </h2>
        <div className="row g-3">
          {siteDataLoading ? (
            <div className="d-flex justify-content-center align-items-center w-100">
              <LoadingSpinner show={siteDataLoading} />
            </div>
          ) : pageItems.length > 0 ? (
            pageItems.map((project, index) => (
              <div key={project.id ?? index} className="col-12 col-sm-6 col-md-4">
                <PropertyContainer data={project} />
              </div>
            ))
          ) : (
            !siteDataLoading && (
              <p>
                No projects found for the selected {cityName.toUpperCase()}{" "}
                type.
              </p>
            )
          )}
        </div>
        {!siteDataLoading && filteredProjectsByBrType.length > 0 && (
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
