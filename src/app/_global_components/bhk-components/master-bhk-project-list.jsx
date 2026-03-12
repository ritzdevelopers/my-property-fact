"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchAllProjects } from "../masterFunction";
import PropertyContainer from "@/app/(home)/components/common/page";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import Link from "next/link";

export default function MasterBHKProjectList() {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [filteredProjectsByBrType, setFilteredProjectsByBrType] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityName, setCityName] = useState("");
  const [floorTypeList, setFloorTypeList] = useState([]);

  // Extract individual BHK types from string (handles "3 BHK 4 BHK" -> ["3 BHK", "4 BHK"])
  const extractIndividualBHKTypes = (value = "") => {
    if (!value || typeof value !== "string") return [];
    const matches = value.match(/\d+\s*BHK/gi);
    return matches ? [...new Set(matches.map((m) => m.trim()))] : [];
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
    if (normalized === "food courts") {
      return { label: "Food Court", slugType: "food-court" };
    }
    if (normalized === "plot" || normalized === "plots") {
      return { label: "Plot", slugType: "plot" };
    }
    if (normalized === "office" || normalized === "offices") {
      return { label: "Office", slugType: "office" };
    }
    // Normalize "1 RK Studio" and "1 RK Studio Apartment" to same slug (avoid duplicates)
    if (normalized === "1 rk studio apartment" || normalized === "1 rk studio") {
      return { label: "1 RK Studio", slugType: "1-rk-studio" };
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

  const cityMatches = (item, cityKey) => {
    const ck = (cityKey || "").trim().toLowerCase();
    if (!ck) return false;
    const cityNorm = (item.cityName || "").toLowerCase();
    const addrNorm = (item.projectAddress || "").toLowerCase();
    const localityNorm = (item.projectLocality || "").toLowerCase();
    if (ck === "noida") {
      const hasGreaterNoida =
        cityNorm.includes("greater noida") ||
        addrNorm.includes("greater noida") ||
        localityNorm.includes("greater noida");
      if (hasGreaterNoida) return false;
    }
    return (
      cityNorm === ck ||
      cityNorm.includes(ck) ||
      addrNorm.includes(ck) ||
      localityNorm.includes(ck)
    );
  };

  const buildFloorTypeList = (projectData, city, category = "") => {
    const cityKey = city.trim().toLowerCase();
    const floorTypesMap = new Map();

    projectData
      .filter((item) => cityMatches(item, cityKey))
      .forEach((item) => {
        if (!item.projectConfiguration || typeof item.projectConfiguration !== "string") return;
        item.projectConfiguration
          .split(",")
          .map((type) => type.trim())
          .filter(Boolean)
          .forEach((type) => {
            // Split "3 BHK 4 BHK" into individual BHK types
            const bhkMatches = extractIndividualBHKTypes(type);
            if (bhkMatches.length > 0) {
              bhkMatches.forEach((bhk) => {
                const normalized = normalizeFloorType(bhk);
                if (normalized && !floorTypesMap.has(normalized.slugType)) {
                  floorTypesMap.set(normalized.slugType, {
                    label: normalized.label,
                    slugType: normalized.slugType,
                    city: city,
                  });
                }
              });
            } else {
              const normalized = normalizeFloorType(type);
              if (normalized && !floorTypesMap.has(normalized.slugType)) {
                floorTypesMap.set(normalized.slugType, {
                  label: normalized.label,
                  slugType: normalized.slugType,
                  city: city,
                });
              }
            }
          });
      });

    // Exclude 1 BHK, 2 BHK, 1 BR, 2 BR, bare numbers (3, 4, 5), standalone "BHK", "Offices and Shop"; exclude SCO Plots for new-projects and apartments/flats
    const excludeSlugTypes = ["1-bhk", "2-bhk", "1-br", "2-br", "1br", "2br", "bhk", "offices-and-shop", "office-and-shop"];
    if (category === "new-projects" || category === "apartments" || category === "flats") {
      excludeSlugTypes.push("sco-plots");
    }
    const isBareNumber = (slug) => /^\d+$/.test(slug.replace(/-/g, ""));
    return Array.from(floorTypesMap.values())
      .filter((ft) => !excludeSlugTypes.includes(ft.slugType.toLowerCase()) && !isBareNumber(ft.slugType))
      .sort((a, b) => a.label.localeCompare(b.label));
  };
  const getListOfProjectFromBkType = async () => {
    const bkType = searchParams.get("type");
    let cat = "";
    if(pathName.includes("commercial") || pathName.includes("offices-and-shop") || pathName.includes("offices") || pathName.includes("shop")) {
      cat = "commercial";
    }else if(pathName.includes("flats")) {
      cat = "flats";
    }else if(pathName.includes("new-projects")){
      cat = "new-projects";
    }else {
      cat = "apartments";
    }
    if (projects.length > 0) {
      let filteredData = projects;
      if (bkType) {
        filteredData = projects.filter((item) => {
          if (!item.projectConfiguration) return false;
          const configs = item.projectConfiguration
            .split(",")
            .map((type) => type.trim());
          const allTypes = configs.flatMap((c) => {
            const bhks = extractIndividualBHKTypes(c);
            return bhks.length > 0 ? bhks : [c];
          });
          const bkTypeNormalized = bkType.replace(/-/g, " ").trim();
          const matches = allTypes.some(
            (t) =>
              t === bkType ||
              t.replace(/\s+/g, "-").toLowerCase() ===
                bkType.replace(/\s+/g, "-").toLowerCase()
          );
          setLoading(false);
          return matches;
        });
      }
      const cityKey = cityName.trim().toLowerCase();
      switch (cat) {
        case "apartments":
          filteredData = projects.filter(
            (item) =>
              item.propertyTypeName?.toLowerCase() === "residential" &&
              cityMatches(item, cityKey)
          );
          setFloorTypeList(buildFloorTypeList(filteredData, cityName, cat));
          break;
        case "new-projects":
          filteredData = projects.filter(
            (item) =>
              item.projectStatusName === "New Launched" &&
              cityMatches(item, cityKey)
          );
          setFloorTypeList(buildFloorTypeList(filteredData, cityName, cat));
          break;
        case "flats":
          filteredData = projects.filter(
            (item) =>
              cityMatches(item, cityKey) &&
              item.propertyTypeName?.toLowerCase() === "residential"
          );
          setFloorTypeList(buildFloorTypeList(filteredData, cityName, cat));
          break;
        case "commercial":
          filteredData = projects.filter(
            (item) =>
              item.propertyTypeName?.toLowerCase() === "commercial" &&
              cityMatches(item, cityKey)
          );
          setFloorTypeList(buildFloorTypeList(filteredData, cityName, cat));
          break;
        default:
          filteredData = projects.filter((item) => cityMatches(item, cityKey));
          setFloorTypeList(buildFloorTypeList(filteredData, cityName, cat));
          break;
      }
      setLoading(false);
      return filteredData;
    }
    return [];
  };

  useEffect(() => {
    const slugPrefix = [
      "/flats-in-",
      "/apartments-in-",
      "/commercial-property-in-",
      "/new-projects-in-",
      "/offices-and-shop-in-",
    ];
    async function fetchData() {
      const data = await fetchAllProjects();
      setProjects(data);
      let foundCity = "";
      slugPrefix.forEach((slug) => {
        if (pathName.includes(slug)) {
          foundCity = pathName.replace(slug, "").replace(/-/g, " ").trim();
        }
      });
      setCityName(foundCity);
    }
    fetchData();
  }, [pathName]);

  useEffect(() => {
    if (!projects.length || !cityName) {
      setLoading(false);
      setFilteredProjectsByBrType([]);
      return;
    }
    setLoading(true);
    async function updateFilteredProjects() {
      try {
        const filteredData = await getListOfProjectFromBkType();
        setFilteredProjectsByBrType(filteredData);
      } finally {
        setLoading(false);
      }
    }
    updateFilteredProjects();
  }, [projects, cityName]);

  return (
    <>
      <div className="container my-5">
        <div className="row g-3">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center w-100">
              <LoadingSpinner show={loading} />
            </div>
          ) : filteredProjectsByBrType.length > 0 ? (
            filteredProjectsByBrType.map((project, index) => (
              <div key={index} className="col-12 col-sm-6 col-md-4">
                <PropertyContainer data={project} />
              </div>
            ))
          ) : (
            !loading && (
              <p>
                No projects found for the selected {cityName.toUpperCase()}{" "}
                type.
              </p>
            )
          )}
        </div>
      </div>
      {floorTypeList.length > 0 && (
        <div
          className="bg-light py-5 mt-5 text-center font-gotham-medium fs-4 text-uppercase text-dark d-flex justify-content-center align-items-center
        gap-3 flex-wrap"
        >
          {floorTypeList.map((floorType) => {
            return (
              <Link
                key={`${floorType.slugType}|${floorType.city}`}
                className="text-dark text-decoration-none bg-secondary rounded-3 px-3 py-2 fs-6 border border-secondary bg-white"
                href={`${floorType.slugType}-in-${floorType.city
                  .trim()
                  .replace(/\s+/g, "-")
                  .toLowerCase()}`}
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
