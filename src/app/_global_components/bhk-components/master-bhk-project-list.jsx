"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useRef } from "react";
import PropertyContainer from "@/app/(home)/components/common/page";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import {
  ProjectListingPaginationControls,
  useProjectListingPagination,
} from "@/app/_global_components/projectListingPagination";
import {
  cityNameMatchesFilter,
  resolveCitySlug,
} from "@/app/_global_components/cityAliasUtils";
import { isBhkFloorSlugSegment } from "@/app/_global_components/masterFunction";
import { projectMatchesListingHubCategory } from "@/lib/listingFloorValidation";
import Link from "next/link";
import { useSiteData } from "../contexts/SiteDataContext";

const HUB_CITY_SLUG_PREFIXES = [
  "/flats-in-",
  "/apartments-in-",
  "/commercial-property-in-",
  "/new-projects-in-",
  "/offices-and-shop-in-",
];

function parseHubCityName(pathName) {
  if (!pathName) return "";
  for (const slug of HUB_CITY_SLUG_PREFIXES) {
    if (pathName.startsWith(slug)) {
      return pathName.replace(slug, "").replace(/-/g, " ").trim();
    }
  }
  return "";
}

function resolveListingCategory(pathName) {
  if (pathName.startsWith("/offices-and-shop-in-")) {
    return { cat: "offices-and-shop", urlCategorySegment: "offices-and-shop" };
  }
  if (pathName.startsWith("/commercial-property-in-")) {
    return { cat: "commercial", urlCategorySegment: "commercial" };
  }
  if (pathName.startsWith("/flats-in-")) {
    return { cat: "flats", urlCategorySegment: "flats" };
  }
  if (pathName.startsWith("/new-projects-in-")) {
    return { cat: "new-projects", urlCategorySegment: "new-projects" };
  }
  if (pathName.startsWith("/apartments-in-")) {
    return { cat: "apartments", urlCategorySegment: "apartments" };
  }
  return { cat: "apartments", urlCategorySegment: "apartments" };
}

export default function MasterBHKProjectList() {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const { projectList: projects = [], loading: siteDataLoading } = useSiteData();
  const cityName = useMemo(() => parseHubCityName(pathName), [pathName]);
  const { cat, urlCategorySegment } = useMemo(
    () => resolveListingCategory(pathName),
    [pathName],
  );
  const bkType = searchParams.get("type");

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
      const cleanedPart = part
        .replace(/\s*-\s*\d+\s*(?:sq\.?\s*ft|sq\.?ft)\s*/gi, "")
        .trim();
      if (!cleanedPart) return;

      // SCO-900 sq.ft style unit sizes are not "SCO Plots" property type.
      if (/^sco$/i.test(cleanedPart)) return;

      ingestScoPlotsType(cleanedPart, types);

      const bhkRegex = /(\d+)\s*(?:\/|&|and|-)?\s*(\d+)?\s*BHK/gi;
      let bhkMatch;
      let foundBhk = false;
      while ((bhkMatch = bhkRegex.exec(cleanedPart)) !== null) {
        foundBhk = true;
        if (bhkMatch[1]) types.add(`${bhkMatch[1]} bhk`);
        if (bhkMatch[2]) types.add(`${bhkMatch[2]} bhk`);
      }

      if (!foundBhk) {
        const sqFtStandalone = cleanedPart.match(/^(\d+)\s*sq\.?\s*ft$/i);
        if (sqFtStandalone?.[1]) {
          types.add(`${sqFtStandalone[1]} sq ft`);
          return;
        }
        const norm = normalizeType(cleanedPart);
        if (
          norm === "shop and sco plots" ||
          norm === "shops and sco plots" ||
          (/\bshops?\b/i.test(cleanedPart) && /\bsco\s*plots?\b/i.test(cleanedPart))
        ) {
          if (/\bshops?\b/i.test(cleanedPart)) types.add("shop");
          if (/\boffices?\b/i.test(cleanedPart)) types.add("office");
          return;
        }
        if (norm === "offices and shop" || norm === "office and shop") {
          types.add("office");
          types.add("shop");
          return;
        }
        types.add(norm);
      }
    });

    return Array.from(types);
  };

  const matchesProjectConfigurationType = (projectConfiguration, selectedType) => {
    const wanted = normalizeType(selectedType);
    if (!wanted) return true;
    const configTypes = extractTypesFromProjectConfiguration(projectConfiguration);
    if (!configTypes.length) return false;

    const bhkWanted = wanted.match(/(\d+)\s*bhk/i);
    if (bhkWanted?.[1]) {
      return configTypes.includes(`${bhkWanted[1]} bhk`);
    }

    const sqFtWanted = wanted.match(/(\d+)\s*sq\.?\s*ft/i);
    if (sqFtWanted?.[1]) {
      return configTypes.includes(`${sqFtWanted[1]} sq ft`);
    }

    if (wanted === "sco plots" || wanted === "sco plot") {
      return configTypes.includes("sco plots");
    }

    return configTypes.some(
      (type) => type === wanted || type.includes(wanted) || wanted.includes(type)
    );
  };

  const isHubBhkSlug = (slugType) => /^\d+-bhk$/i.test(String(slugType || ""));

  const isHubRkStudioSlug = (slugType) =>
    /^\d+-rk-studio$/i.test(String(slugType || ""));

  const isHubSqFtSlug = (slugType) =>
    /^\d+-sq\.ft$/i.test(String(slugType || ""));

  const isHubFlatFloorSlug = (slugType) =>
    isHubBhkSlug(slugType) ||
    isHubRkStudioSlug(slugType) ||
    isHubSqFtSlug(slugType);

  const HUB_COMMERCIAL_SLUGS = new Set([
    "shops",
    "office",
    "kiosk",
    "food-court",
    "restaurant",
    "showroom",
    "sco-plots",
  ]);

  const ingestScoPlotsType = (cleanedPart, types) => {
    if (/\bsco\s*plots?\b/i.test(cleanedPart)) {
      types.add("sco plots");
    }
  };

  const includeFloorTypeInHubCategory = (slugType, category) => {
    const slug = String(slugType || "").toLowerCase();
    if (category === "flats") {
      return isHubFlatFloorSlug(slug);
    }
    if (category === "apartments") {
      return isHubBhkSlug(slug);
    }
    if (category === "commercial") {
      return HUB_COMMERCIAL_SLUGS.has(slug);
    }
    if (category === "offices-and-shop") {
      return slug === "office" || slug === "shops";
    }
    if (category === "new-projects") {
      return true;
    }
    return true;
  };

  const normalizeFloorType = (value = "") => {
    if (value == null || typeof value !== "string") return null;
    // Remove number and sq.ft from project config
    const withoutSqft = value
      .replace(/\s*-\s*\d+\s*(?:sq\.ft|sq\s*ft)\s*/gi, "")
      .trim();
    const normalized = withoutSqft.toLowerCase().trim().replace(/\s+/g, " ");
    if (normalized === "shop" || normalized === "shops") {
      return { label: "Shops", slugType: "shops" };
    }
    if (normalized === "food courts" || normalized === "food court") {
      return { label: "Food Court", slugType: "food-court" };
    }
    if (normalized === "plot" || normalized === "plots") {
      return { label: "Plot", slugType: "plot" };
    }
    if (normalized === "office" || normalized === "offices") {
      return { label: "Office", slugType: "office" };
    }
    if (normalized === "kiosk" || normalized === "kiosks") {
      return { label: "Kiosk", slugType: "kiosk" };
    }
    if (normalized === "restaurant" || normalized === "restaurants") {
      return { label: "Restaurant", slugType: "restaurant" };
    }
    if (normalized === "showroom" || normalized === "showrooms") {
      return { label: "Showroom", slugType: "showroom" };
    }
    if (normalized === "sco plots" || normalized === "sco plot") {
      return { label: "SCO Plots", slugType: "sco-plots" };
    }
    if (normalized === "sco") return null;
    // Normalize "N RK Studio" variants → `1-rk-studio`, `2-rk-studio`, etc.
    const rkStudio = normalized.match(/^(\d+)\s*rk\s*studio(?:\s*apartment)?$/);
    if (rkStudio?.[1]) {
      return {
        label: `${rkStudio[1]} RK Studio`,
        slugType: `${rkStudio[1]}-rk-studio`,
      };
    }
    // Legacy: "1 rk studio apartment" / "1 rk studio"
    if (normalized === "1 rk studio apartment" || normalized === "1 rk studio") {
      return { label: "1 RK Studio", slugType: "1-rk-studio" };
    }
    const sqFtOnly = normalized.match(/^(\d+)\s*sq\.?\s*ft$/);
    if (sqFtOnly?.[1]) {
      return {
        label: `${sqFtOnly[1]} Sq.ft`,
        slugType: `${sqFtOnly[1]}-sq.ft`,
      };
    }
    // Exclude combined types - we already have Office, Shops, SCO Plots separately
    if (
      normalized === "offices and shop" ||
      normalized === "office and shop" ||
      normalized === "shop and sco plots" ||
      normalized === "shops and sco plots"
    ) {
      return null;
    }
    let slugType = normalized.replace(/\s+/g, "-");
    // Normalize "3bhk" -> "3-bhk" so "3 BHK" and "3BHK" map to same slug (avoid duplicates)
    if (/^\d+bhk$/i.test(slugType)) {
      slugType = slugType.replace(/^(\d+)(bhk)$/i, "$1-$2");
    }
    // Use consistent label "X BHK" for BHK types (avoid "3bhk" vs "3 BHK" display)
    const label = /^\d+[- ]?bhk$/i.test(slugType)
      ? slugType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : normalized.replace(/\b\w/g, (char) => char.toUpperCase());
    return { label, slugType };
  };

  const cityMatches = (item, cityKey) => cityNameMatchesFilter(cityKey, item);

  const buildFloorTypeList = (projectData, city, category = "") => {
    const cityKey = city.trim().toLowerCase();
    const floorTypesMap = new Map();

    projectData
      .filter((item) => cityMatches(item, cityKey))
      .forEach((item) => {
        if (!item.projectConfiguration || typeof item.projectConfiguration !== "string") return;
        extractTypesFromProjectConfiguration(item.projectConfiguration).forEach(
          (configType) => {
            const normalized = normalizeFloorType(configType);
            if (normalized && !floorTypesMap.has(normalized.slugType)) {
              floorTypesMap.set(normalized.slugType, {
                label: normalized.label,
                slugType: normalized.slugType,
                city: city,
              });
            }
          },
        );
      });

    // Exclude 1 BHK, 2 BHK, 1 BR, 2 BR, bare numbers (3, 4, 5), standalone "BHK", "Offices and Shop"; exclude SCO Plots for new-projects and apartments/flats
    const excludeSlugTypes = ["1-br", "2-br", "1br", "2br", "bhk", "offices-and-shop", "office-and-shop"];
    if (category === "new-projects" || category === "apartments" || category === "flats") {
      excludeSlugTypes.push("sco-plots");
    }
    const isBareNumber = (slug) => /^\d+$/.test(slug.replace(/-/g, ""));
    return Array.from(floorTypesMap.values())
      .filter(
        (ft) =>
          includeFloorTypeInHubCategory(ft.slugType, category) &&
          !excludeSlugTypes.includes(ft.slugType.toLowerCase()) &&
          !isBareNumber(ft.slugType),
      )
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  /** Filter key + URL segment for BHK pill links (`{floor}-{segment}-in-{city}`). */
  const { filteredProjectsByBrType, floorTypeList } = useMemo(() => {
    if (!projects.length || !cityName) {
      return { filteredProjectsByBrType: [], floorTypeList: [] };
    }

    const cityKey = cityName.trim().toLowerCase();
    const matchesHubCategory = (item) =>
      projectMatchesListingHubCategory(item, cat);

    let filteredData = projects.filter(
      (item) => cityMatches(item, cityKey) && matchesHubCategory(item),
    );

    if (bkType) {
      filteredData = filteredData.filter((item) =>
        matchesProjectConfigurationType(item.projectConfiguration, bkType),
      );
    }

    return {
      filteredProjectsByBrType: filteredData,
      floorTypeList: buildFloorTypeList(filteredData, cityName, cat),
    };
  }, [projects, cityName, cat, bkType]);

  const getSectionHeadingFromPath = () => {
    if (pathName.startsWith("/commercial-property-in-")) return "Commercial Property";
    if (pathName.startsWith("/new-projects-in-")) return "New Projects";
    if (pathName.startsWith("/flats-in-")) return "Flats";
    if (pathName.startsWith("/apartments-in-")) return "Apartments";
    if (pathName.startsWith("/offices-and-shop-in-")) return "Offices and Shop";
    return "Projects";
  };

  const showLoading = siteDataLoading;

  const { pageItems, currentPage, totalPages, totalItems, setPage } =
    useProjectListingPagination(filteredProjectsByBrType);
  const listingsRef = useRef(null);

  return (
    <>
      <div className="container my-5">
        <h2 className="master-bhk-section-heading mb-3 mb-md-4">
          {getSectionHeadingFromPath()}
        </h2>
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
          ) : (
            <p>
              No projects found for the selected {cityName.toUpperCase()} type.
            </p>
          )}
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
      {!showLoading && floorTypeList.length > 0 && (
        <div
          className="bg-light py-5 mt-5 text-center font-gotham-medium fs-4 text-uppercase text-dark d-flex justify-content-center align-items-center
        gap-3 flex-wrap"
        >
          {floorTypeList.map((floorType) => {
            const citySlug = resolveCitySlug(
              floorType.city.trim().replace(/\s+/g, "-").toLowerCase(),
            );
            const pathSegment =
              isBhkFloorSlugSegment(floorType.slugType) &&
              urlCategorySegment !== "flats"
                ? `${floorType.slugType}-${urlCategorySegment}-in-${citySlug}`
                : `${floorType.slugType}-in-${citySlug}`;
            const href = `/${pathSegment}`;
            return (
              <Link
                title={floorType.label}
                key={`${floorType.slugType}|${urlCategorySegment}|${floorType.city}`}
                className="text-dark text-decoration-none bg-secondary rounded-3 px-3 py-2 fs-6 border border-secondary bg-white"
                href={href}
              >
                {floorType.label} in {floorType.city}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
