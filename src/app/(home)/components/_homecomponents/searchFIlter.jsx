"use client";

import { useProjectContext } from "@/app/_global_components/contexts/projectsContext";
import { useSiteData } from "@/app/_global_components/contexts/SiteDataContext";
import { PROJECT_BUDGET_OPTIONS } from "@/app/_global_components/projectFilterUtils";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Spinner } from "react-bootstrap";

export default function SearchFilter({ projectTypeList = [], cityList = [] }) {
  const { setProjectData } = useProjectContext();
  const {
    projectTypes: contextProjectTypes = [],
    cityList: contextCityList = [],
    setQueryFilters,
    setQuickProjectFilter,
    resetProjectFilters,
  } = useSiteData();
  const [propertType, setPropertyType] = useState("");
  const [propertyLocation, setPropertyLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState(null);
  const effectiveProjectTypes = useMemo(
    () =>
      Array.isArray(contextProjectTypes) && contextProjectTypes.length > 0
        ? contextProjectTypes
        : projectTypeList,
    [contextProjectTypes, projectTypeList]
  );
  const effectiveCityList = useMemo(
    () =>
      Array.isArray(contextCityList) && contextCityList.length > 0
        ? contextCityList
        : cityList,
    [contextCityList, cityList]
  );
  //defining project range
  const projectRange = PROJECT_BUDGET_OPTIONS;
  const handleSubmit = async (e) => {
    e.preventDefault();
    const paramsObj = {
      propertyType: propertType,
      propertyLocation: propertyLocation,
      budget: budget,
    };

    try {
      setLoading(true);
      const selectedTypeMeta = propertType
        ? effectiveProjectTypes.find((o) => String(o.id) === String(propertType))
        : null;
      const typeNorm = String(selectedTypeMeta?.projectTypeName || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");
      let quickTab = "All";
      if (typeNorm.includes("new launch")) quickTab = "New Launched";
      else if (typeNorm.includes("commercial")) quickTab = "Commercial";
      else if (typeNorm.includes("residential")) quickTab = "Residential";
      setQuickProjectFilter(quickTab);
      resetProjectFilters();
      setQueryFilters(paramsObj);
      sessionStorage.setItem("mpf-querry", JSON.stringify(paramsObj));
      // Projects page consumes SiteDataContext and applies client-side filtering.
      setProjectData([]);
      router.push(`/projects`);
    } catch (error) {
      // Error handled - user will see notification or empty results
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (sessionStorage.getItem("mpf-querry")) {
      sessionStorage.removeItem("mpf-querry");
    }
  }, []);
  useEffect(() => {
    const onDocClick = (e) => {
      const inside = e.target.closest && e.target.closest(".custom-sort-dropdown");
      if (!inside) setOpenDropdown(null);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);
  const renderDropdown = (id, value, setValue, placeholder, options, getLabel, getVal) => {
    const isOpen = openDropdown === id;
    const currentLabel = (() => {
      if (!value) return "Select";
      const found = options.find((o) => (getVal ? getVal(o) : o) === value);
      return found ? (getLabel ? getLabel(found) : found) : "Select";
    })();
    return (
      <div className="custom-sort-dropdown">
        <button
          type="button"
          className={`custom-sort-trigger custom-select-trigger ${isOpen ? "active" : ""}`}
          onClick={() => setOpenDropdown(isOpen ? null : id)}
        >
          <span className="custom-sort-value">{value ? currentLabel : placeholder}</span>
          <svg className={`custom-sort-arrow ${isOpen ? "rotated" : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {isOpen && (
          <div className={`custom-sort-options ${id === "location" ? "with-scroll" : ""}`}>
            {options.map((opt, idx) => {
              const val = getVal ? getVal(opt) : opt;
              const label = getLabel ? getLabel(opt) : opt;
              const selected = value === val;
              return (
                <button
                  key={`${id}-${idx}`}
                  className={`custom-sort-option ${selected ? "selected" : ""}`}
                  onClick={() => {
                    setValue(val);
                    setOpenDropdown(null);
                  }}
                  type="button"
                >
                  {label}
                  {selected && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="#0d5834" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="home-search-container container">
      {/* <div className="container bg-white border rounded-2 custom-shadow">*/}
      <div className="container border rounded-1 search-filter-shadow">
        <form
          method="get"
          action="/projects"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
        >
          <div className="d-flex flex-wrap flex-md-row flex-column p-3 p-md-4 gap-2 gap-md-3 plus-jakarta-sans-regular">
            <div className="col">{renderDropdown(
              "type",
              propertType,
              setPropertyType,
              "Property Type",
              effectiveProjectTypes,
              (o) => o.projectTypeName,
              (o) => o.id
            )}</div>
            <div className="col">{renderDropdown(
              "location",
              propertyLocation,
              setPropertyLocation,
              "Select Location",
              effectiveCityList,
              (o) => o.cityName,
              (o) => o.id
            )}</div>
            <div className="col">{renderDropdown(
              "price",
              budget,
              setBudget,
              "Price Range",
              projectRange,
              (o) => o,
              (o) => o
            )}</div>

            <div className="d-flex align-items-end">
              <button
                type="submit"
                className="search-btn-home-page"
                aria-label="Search"
              >
                {/* <button
                type="submit"
                className="home-search-filter-button btn-background"
                onClick={handleSubmit}
                aria-label="Search"
              > */}
                {loading ? (
                  <Spinner animation="border" variant="light" />
                ) : (
                  // <FontAwesomeIcon icon={faSearch} fixedWidth />
                  <span>Search</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
