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

  const normalizeFloorType = (value = "") => {
    const normalized = value.toLowerCase().trim().replace(/\s+/g, " ");
    if (normalized === "shop" || normalized === "shops") {
      return { label: "Shops", slugType: "shops" };
    }
    if (normalized === "food courts") {
      return { label: "Food Court", slugType: "food-court" };
    }
    return {
      label: normalized.replace(/\b\w/g, (char) => char.toUpperCase()),
      slugType: normalized.replace(/\s+/g, "-"),
    };
  };

  const buildFloorTypeList = (projectData, city) => {
    const cityKey = city.trim().toLowerCase();
    const floorTypesMap = new Map();

    projectData
      .filter((item) => item.cityName.toLowerCase() === cityKey)
      .forEach((item) => {
        item.projectConfiguration
          .split(",")
          .map((type) => type.trim())
          .filter(Boolean)
          .forEach((type) => {
            const normalized = normalizeFloorType(type);
            if (!floorTypesMap.has(normalized.slugType)) {
              floorTypesMap.set(normalized.slugType, {
                label: normalized.label,
                slugType: normalized.slugType,
                city: item.cityName,
              });
            }
          });
      });

    return Array.from(floorTypesMap.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  };
  const getListOfProjectFromBkType = async () => {
    const bkType = searchParams.get("type");
    let cat = "";
    if(pathName.includes("commercial")) {
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
          const types = item.projectConfiguration
            .split(",")
            .map((type) => type.trim());
          setLoading(false);
          return types?.includes(bkType);
        });
      }
      switch (cat) {
        case "apartments":
          filteredData = projects.filter(
            (item) =>
              item.propertyTypeName.toLowerCase() === "residential" &&
              item.cityName.toLowerCase() === cityName.trim().toLowerCase()
          );
          setFloorTypeList(buildFloorTypeList(filteredData, cityName));
          break;
        case "new-projects":
          filteredData = projects.filter(
            (item) =>
              item.projectStatusName === "New Launched" &&
              item.cityName.toLowerCase() === cityName.toLowerCase()
          );
          setFloorTypeList(buildFloorTypeList(filteredData, cityName));
          break;
        case "flats":
          filteredData = projects.filter(
            (item) =>
              item.cityName.toLowerCase() === cityName.trim().toLowerCase() &&
              item.propertyTypeName.toLowerCase() === "residential"
          );
          setFloorTypeList(buildFloorTypeList(filteredData, cityName));
          break;
        case "commercial":
          filteredData = projects.filter(
            (item) =>
              item.propertyTypeName.toLowerCase() === "commercial" &&
              item.cityName.toLowerCase() === cityName.toLowerCase()
          );
          setFloorTypeList(buildFloorTypeList(filteredData, cityName));
          break;
        default:
          filteredData = projects.filter(
            (item) =>
              item.cityName.toLowerCase() === cityName.trim().toLowerCase()
          );
          setFloorTypeList(buildFloorTypeList(filteredData, cityName));
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
    ];
    async function fetchData() {
      const data = await fetchAllProjects();
      setProjects(data);
      let foundCity = "";
      slugPrefix.map((slug) => {
        if (pathName.includes(slug)) {
          foundCity = pathName.replace(slug, "").replace(/-/g, " ");
        }
      });
      setCityName(foundCity);
    }
    fetchData();
  }, [pathName]);

  useEffect(() => {
    if (!projects.length || !cityName) return;
    setLoading(true);
    async function updateFilteredProjects() {
      const filteredData = await getListOfProjectFromBkType();
      setFilteredProjectsByBrType(filteredData);
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
