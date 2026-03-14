"use client";
import PropertyContainer from "@/app/(home)/components/common/page";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import { useEffect, useState } from "react";
import { fetchAllProjects } from "../masterFunction";

const normalizeFloorType = (value = "") => {
  // Handle "3 BHK", "3-bhk" etc. -> "3 bhk"
  const normalized = value.toLowerCase().trim().replace(/-/g, " ").replace(/\s+/g, " ");
  if (normalized === "shop" || normalized === "shops") return "shops";
  if (normalized === "food courts") return "food court";
  return normalized;
};

// Extract individual BHK types (splits "3 BHK 4 BHK" into ["3 BHK", "4 BHK"])
const extractIndividualBHKTypes = (value = "") => {
  if (!value || typeof value !== "string") return [];
  const matches = value.match(/\d+\s*BHK/gi);
  return matches ? [...new Set(matches.map((m) => m.trim()))] : [];
};

export default function ProjectListByFloorTypeClient({ title }) {
  const [projects, setProjects] = useState([]);
  const [filteredProjectsByBrType, setFilteredProjectsByBrType] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityName, setCityName] = useState("");
  const getListOfProjectFromBkType = (projects, floorType, city) => {
    if (!projects.length) return [];
    const cityNorm = (city || "").replace(/%20/g, " ").trim().toLowerCase();
    let filtered = projects.filter(
      (item) => (item.cityName || "").toLowerCase() === cityNorm
    );
    if (!floorType) return filtered;
    const floorNorm = normalizeFloorType(floorType);
    // Handle "Offices And Shop" - match projects with both office and shop
    const floorParts = floorNorm.split(/\s+and\s+/).map((p) => p.trim()).filter(Boolean);
    filtered = filtered.filter((item) => {
      if (!item.projectConfiguration) return false;
      const configs = item.projectConfiguration
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const allTypes = configs.flatMap((c) => {
        const bhks = extractIndividualBHKTypes(c);
        return bhks.length > 0 ? bhks.map(normalizeFloorType) : [normalizeFloorType(c)];
      });
      if (floorParts.length > 1) {
        return floorParts.every((part) =>
          allTypes.some((t) => t.includes(part) || part.includes(t))
        );
      }
      return allTypes.some((t) => t === floorNorm || t.includes(floorNorm) || floorNorm.includes(t));
    });
    return filtered;
  };

  useEffect(() => {
    const parts = (title || "").split(/\s+In\s+/);
    const floorType = parts[0]?.trim() || "";
    const city = (parts[1] || "").replace(/%20/g, " ").trim();
    setCityName(city);
    async function fetchData() {
      try {
        const data = await fetchAllProjects();
        const filteredData = getListOfProjectFromBkType(
          data || [],
          floorType,
          city
        );
        setFilteredProjectsByBrType(filteredData);
        setProjects(data || []);
      } catch (err) {
        console.error("ProjectListByFloorType fetch error:", err);
        setFilteredProjectsByBrType([]);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [title]);
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
    </>
  );
}
