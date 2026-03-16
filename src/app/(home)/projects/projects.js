"use client";

import PropertyContainer from "../components/common/page";
import "./project.css";
import { useEffect, useMemo, useRef, useState } from "react";
import CommonHeaderBanner from "../components/common/commonheaderbanner";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import { useSiteData } from "@/app/_global_components/contexts/SiteDataContext";
import {
  PROJECT_BUDGET_OPTIONS,
  matchesBudgetRangeForProject,
  normalizeBudgetSelection,
} from "@/app/_global_components/projectFilterUtils";
import { Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faTimes,
  faSlidersH,
  faHome,
} from "@fortawesome/free-solid-svg-icons";

const EMPTY_PROJECT_FILTERS = {
  propertyType: "",
  city: "",
  budget: "",
  projectStatus: "",
  builder: "",
  bhkType: "",
  possession: "",
  occupancy: "",
  facing: "",
};

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export default function Projects() {
  const [pageName] = useState("Projects");
  const {
    cityList: cities,
    projectTypes: propertyTypes,
    projectStatuses,
    projectList: allProjectsList,
    bhkTypes,
    loading: siteDataLoading,
    queryFilters,
    clearQueryFilters,
  } = useSiteData();
  const [quickProjectFilter, setQuickProjectFilter] = useState("All");
  const [filters, setFilters] = useState(EMPTY_PROJECT_FILTERS);
  const isActive = quickProjectFilter || "All";
  // Used to decide when to show "You've viewed all projects"
  const pageSize = 150;
  const [fadeKey, setFadeKey] = useState(0);
  const hasUrlParams = false;

  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [draftFilters, setDraftFilters] = useState(filters);
  const [listLoading, setListLoading] = useState(false);
  const searchLoadingTimeoutRef = useRef(null);

  // Toggle mobile filter modal (like properties page)
  const toggleMobileFilter = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
    if (!isMobileFilterOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("projects-filter-modal-open");
    } else {
      document.body.style.overflow = "unset";
      document.body.classList.remove("projects-filter-modal-open");
    }
  };

  const closeMobileFilter = () => {
    setIsMobileFilterOpen(false);
    setOpenDropdown(null);
    document.body.style.overflow = "unset";
    document.body.classList.remove("projects-filter-modal-open");
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = "unset";
      document.body.classList.remove("projects-filter-modal-open");
    };
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      const inside = e.target.closest && e.target.closest(".custom-sort-dropdown");
      if (!inside) setOpenDropdown(null);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const budgetOptions = PROJECT_BUDGET_OPTIONS;

  const renderFilterDropdown = ({
    id,
    filterKey,
    placeholder,
    value,
    options,
    getLabel = (option) => option,
    getValue = (option) => option,
    scroll = false,
  }) => {
    const isOpen = openDropdown === id;
    const selectedOption = options.find(
      (option) => String(getValue(option)) === String(value)
    );
    const selectedLabel = selectedOption ? getLabel(selectedOption) : placeholder;

    return (
      <div className="custom-sort-dropdown projects-custom-dropdown">
        <button
          type="button"
          className={`custom-sort-trigger custom-select-trigger ${isOpen ? "active" : ""}`}
          onClick={() => setOpenDropdown(isOpen ? null : id)}
        >
          <span className="custom-sort-value">{selectedLabel}</span>
          <svg
            className={`custom-sort-arrow ${isOpen ? "rotated" : ""}`}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M6 9L12 15L18 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {isOpen && (
          <div className={`custom-sort-options ${scroll ? "with-scroll" : ""}`}>
            <button
              type="button"
              className={`custom-sort-option ${!value ? "selected" : ""}`}
              onClick={() => {
                handleFilterChange(filterKey, "");
                setOpenDropdown(null);
              }}
            >
              {placeholder}
            </button>
            {options.map((option, index) => {
              const optionValue = String(getValue(option));
              const isSelected = String(value) === optionValue;
              return (
                <button
                  key={`${id}-${optionValue}-${index}`}
                  type="button"
                  className={`custom-sort-option ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    handleFilterChange(filterKey, optionValue);
                    setOpenDropdown(null);
                  }}
                >
                  {getLabel(option)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const hasMore = false;
  const loading = siteDataLoading;
  const initialLoad = siteDataLoading;

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  useEffect(() => {
    const hasIncomingQueryFilters =
      queryFilters?.propertyType || queryFilters?.propertyLocation || queryFilters?.budget;
    if (!hasIncomingQueryFilters) return;

    // Wait until lookup lists are loaded so id->name mapping works.
    if (queryFilters?.propertyType && (!Array.isArray(propertyTypes) || propertyTypes.length === 0)) {
      return;
    }
    if (queryFilters?.propertyLocation && (!Array.isArray(cities) || cities.length === 0)) {
      return;
    }

    const selectedType = propertyTypes.find(
      (item) => String(item?.id) === String(queryFilters.propertyType)
    );
    const selectedCity = cities.find(
      (item) => String(item?.id) === String(queryFilters.propertyLocation)
    );

    const syncedFilters = {
      ...EMPTY_PROJECT_FILTERS,
      propertyType: selectedType?.projectTypeName || "",
      city: selectedCity?.cityName || "",
      budget: normalizeBudgetSelection(queryFilters?.budget, "web") || "",
    };

    setQuickProjectFilter("All");
    setFilters(syncedFilters);
    setDraftFilters(syncedFilters);
    setFadeKey((prev) => prev + 1);
    clearQueryFilters();
  }, [queryFilters, propertyTypes, cities, clearQueryFilters]);

  useEffect(() => {
    if (!listLoading) return;
    setListLoading(false);
  }, [allProjectsList, quickProjectFilter, filters, listLoading]);

  useEffect(() => {
    return () => {
      if (searchLoadingTimeoutRef.current) {
        clearTimeout(searchLoadingTimeoutRef.current);
      }
    };
  }, []);

  // Clear all filters
  const clearFilters = () => {
    setQuickProjectFilter("All");
    setFilters(EMPTY_PROJECT_FILTERS);
    setDraftFilters(EMPTY_PROJECT_FILTERS);
    clearQueryFilters();
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("mpf-querry");
    }
    setOpenDropdown(null);
    setFadeKey((prev) => prev + 1);
  };

  const applySelectedFilters = (closeMobile = false) => {
    setListLoading(true);
    setFilters(draftFilters);
    setFadeKey((prev) => prev + 1);
    if (searchLoadingTimeoutRef.current) {
      clearTimeout(searchLoadingTimeoutRef.current);
    }
    // Safety fallback in case filtered list reference doesn't change.
    searchLoadingTimeoutRef.current = setTimeout(() => {
      setListLoading(false);
    }, 500);
    if (closeMobile) {
      closeMobileFilter();
    }
    window.scrollTo({ top: 260, behavior: "smooth" });
  };

  // Handle filter draft change
  const handleFilterChange = (filterName, value) => {
    setDraftFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const filterSectionTab = (tabName) => {
    setQuickProjectFilter(tabName);
    setFilters(EMPTY_PROJECT_FILTERS);
    setDraftFilters(EMPTY_PROJECT_FILTERS);
    setFadeKey((prev) => prev + 1);
    window.scrollTo({ top: 260, behavior: "smooth" });
  };

  const displayProjects = useMemo(() => {
    const sourceProjects = Array.isArray(allProjectsList) ? allProjectsList : [];
    const quickFilterNorm = normalizeText(quickProjectFilter);

    return sourceProjects.filter((item) => {
      const itemType = normalizeText(item?.propertyTypeName);
      const itemCity = normalizeText(item?.cityName);
      const itemAddress = normalizeText(item?.projectAddress);
      const itemStatus = normalizeText(item?.projectStatusName);
      const itemBuilder = normalizeText(item?.builderName);
      const itemConfig = normalizeText(item?.projectConfiguration);

      if (quickFilterNorm && quickFilterNorm !== "all") {
        if (quickFilterNorm === "new launched" || quickFilterNorm === "new launch") {
          if (!itemStatus.includes("new launch")) return false;
        } else if (!itemType.includes(quickFilterNorm)) {
          return false;
        }
      }

      if (
        filters.propertyType
      ) {
        const selectedType = normalizeText(filters.propertyType);
        const isNewLaunchType =
          selectedType.includes("new launch") || selectedType.includes("new launches");

        if (isNewLaunchType) {
          if (!itemStatus.includes("new launch")) return false;
        } else if (itemType !== selectedType) {
          return false;
        }
      }

      if (filters.city) {
        const selectedCity = normalizeText(filters.city);
        const cityMatched =
          itemCity === selectedCity ||
          itemCity.includes(selectedCity) ||
          itemAddress.includes(selectedCity);
        if (!cityMatched) return false;
      }

      if (filters.budget && !matchesBudgetRangeForProject(item, filters.budget)) {
        return false;
      }

      if (
        filters.projectStatus &&
        !itemStatus.includes(normalizeText(filters.projectStatus))
      ) {
        return false;
      }

      if (filters.builder && itemBuilder !== normalizeText(filters.builder)) {
        return false;
      }

      if (
        filters.bhkType &&
        !itemConfig.includes(normalizeText(filters.bhkType))
      ) {
        return false;
      }

      return true;
    });
  }, [allProjectsList, quickProjectFilter, filters]);
  const hasActiveFilters = useMemo(
    () => Object.values(filters).some(Boolean),
    [filters]
  );
  const activeFiltersCount = useMemo(
    () => Object.values(filters).filter(Boolean).length,
    [filters]
  );
  const hasQuickFilter = isActive !== "" && isActive !== "All";

  return (
    <div className="projects-page-wrapper">
      <CommonHeaderBanner
        headerText={pageName}
        image={"realestate-bg.jpg"}
        firstPage={"projects"}
      />
      <div className="container py-4">
        {/* Page Header - minimal, project count shown in pills block for All/Commercial only */}
        {/* <div className="page-header-section mb-4">
          {!hasUrlParams && (hasQuickFilter || activeFiltersCount > 0) && (
            <div className="d-flex justify-content-end mb-2">
              <Badge bg="success" className="ms-1">
                {activeFiltersCount + (hasQuickFilter ? 1 : 0)} active
              </Badge>
            </div>
          )}
        </div> */}

        <div className="row g-4">
        {/* Mobile controls: quick tabs + filter icon button */}
        {!hasUrlParams && (
          <div className="col-12 projects-mobile-controls-wrapper">
            <div className="projects-mobile-controls-bar">
              <div className="projects-mobile-tabs-scroll" role="tablist" aria-label="Project categories">
                <button
                  className={`projects-mobile-tab-btn ${isActive === "All" ? "active" : ""}`}
                  onClick={() => filterSectionTab("All")}
                >
                  All Projects  
                </button>
                <button
                  className={`projects-mobile-tab-btn ${isActive === "Commercial" ? "active" : ""}`}
                  onClick={() => filterSectionTab("Commercial")}
                >
                  Commercial
                </button>
                <button
                  className={`projects-mobile-tab-btn ${isActive === "Residential" ? "active" : ""}`}
                  onClick={() => filterSectionTab("Residential")}
                >
                  Residential
                </button>
                <button
                  className={`projects-mobile-tab-btn ${isActive === "New Launched" ? "active" : ""}`}
                  onClick={() => filterSectionTab("New Launched")}
                >
                  New Launch
                </button>
              </div>

              <button
                className="projects-mobile-filter-btn"
                onClick={toggleMobileFilter}
                aria-label="Open filters"
              >
                <FontAwesomeIcon icon={faFilter} />
                <span className="projects-mobile-filter-text">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="projects-mobile-filter-count">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

          {/* Projects column: pills + filters in same sticky block */}
          <div className="col-12 projects-main-with-filter">
            {/* Wrapper so sticky filter has tall parent - extends to include grid */}
            <div className="projects-sticky-wrapper">
              {/* Pills + Filters - direct child of wrapper so sticky works on large screens */}
              {!hasUrlParams ? (
                <div className="projects-filter-inline-card projects-sticky-filters projects-desktop-filters projects-filters-below mb-4">
                  {/* Pills row: project count (All/Commercial only) + tabs + Show Filters + Clear */}
                  <div className="quick-filters-row filter-pills-in-card">
                    {(isActive === "All" || isActive === "Commercial") && (
                      <span className="projects-count-in-pills text-muted">
                        Showing <strong>{displayProjects.length}</strong>{" "}
                        {displayProjects.length === 1 ? "project" : "projects"}
                      </span>
                    )}
                    <div className="filter-pills-container">
                      <button
                        className={`filter-pill-btn ${isActive === "All" ? "active" : ""}`}
                        onClick={() => filterSectionTab("All")}
                      >
                        All Projects
                      </button>
                      <button
                        className={`filter-pill-btn ${isActive === "Commercial" ? "active" : ""}`}
                        onClick={() => filterSectionTab("Commercial")}
                      >
                        Commercial
                      </button>
                      <button
                        className={`filter-pill-btn ${isActive === "Residential" ? "active" : ""}`}
                        onClick={() => filterSectionTab("Residential")}
                      >
                        Residential
                      </button>
                      <button
                        className={`filter-pill-btn ${isActive === "New Launched" ? "active" : ""}`}
                        onClick={() => filterSectionTab("New Launched")}
                      >
                        New Launch
                      </button>
                    </div>
                    <button
                      className="btn btn-outline-primary btn-sm ms-auto align-self-center"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <FontAwesomeIcon icon={faSlidersH} className="me-2" />
                      {showFilters ? "Hide" : "Show"} Filters
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-sm align-self-center"
                      onClick={clearFilters}
                    >
                      <FontAwesomeIcon icon={faTimes} className="me-2" />
                      Clear
                    </button>
                    <button
                      className="btn btn-success btn-sm align-self-center"
                      onClick={() => applySelectedFilters(false)}
                    >
                      Search
                    </button>
                  </div>
                  {showFilters && (
                  <div className="filter-card-body">
                <Form className="filter-form filter-form-inline">
                    <Form.Group className="filter-group">
                      <Form.Label className="filter-label">
                        Property Type
                      </Form.Label>
                      {renderFilterDropdown({
                        id: "desktop-propertyType",
                        filterKey: "propertyType",
                        placeholder: "All Types",
                        value: draftFilters.propertyType,
                        options: propertyTypes,
                        getLabel: (type) => type.projectTypeName,
                        getValue: (type) => type.projectTypeName,
                      })}
                    </Form.Group>

                    <Form.Group className="filter-group">
                      <Form.Label className="filter-label">Location</Form.Label>
                      {renderFilterDropdown({
                        id: "desktop-city",
                        filterKey: "city",
                        placeholder: "All Cities",
                        value: draftFilters.city,
                        options: cities,
                        getLabel: (city) => city.cityName,
                        getValue: (city) => city.cityName,
                        scroll: true,
                      })}
                    </Form.Group>

                    <Form.Group className="filter-group">
                      <Form.Label className="filter-label">
                        Budget Range
                      </Form.Label>
                      {renderFilterDropdown({
                        id: "desktop-budget",
                        filterKey: "budget",
                        placeholder: "All Budgets",
                        value: draftFilters.budget,
                        options: budgetOptions,
                      })}
                    </Form.Group>

                    <Form.Group className="filter-group">
                      <Form.Label className="filter-label">
                        Project Status
                      </Form.Label>
                      {renderFilterDropdown({
                        id: "desktop-projectStatus",
                        filterKey: "projectStatus",
                        placeholder: "All Status",
                        value: draftFilters.projectStatus,
                        options: projectStatuses,
                        getLabel: (status) => status.statusName,
                        getValue: (status) => status.statusName,
                        scroll: true,
                      })}
                    </Form.Group>

                    <Form.Group className="filter-group">
                      <Form.Label className="filter-label">BHK Type</Form.Label>
                      {renderFilterDropdown({
                        id: "desktop-bhkType",
                        filterKey: "bhkType",
                        placeholder: "All BHK Types",
                        value: draftFilters.bhkType,
                        options: bhkTypes,
                        scroll: true,
                      })}
                    </Form.Group>

                    {/* <Form.Group className="filter-group">
                  <Form.Label className="filter-label">Possession</Form.Label>
                <Form.Select
                  size="sm"
                  value={filters.possession}
                  onChange={(e) => handleFilterChange("possession", e.target.value)}
                >
                  <option value="">All</option>
                  <option value="ready">Ready to Move</option>
                  <option value="under-construction">Under Construction</option>
                  <option value="q1">Q1</option>
                  <option value="q2">Q2</option>
                  <option value="q3">Q3</option>
                  <option value="q4">Q4</option>
                </Form.Select>
              </Form.Group> */}

                    {/* <Form.Group className="filter-group">
                      <Form.Label className="filter-label">
                        Occupancy
                      </Form.Label>
                      <Form.Select
                        size="sm"
                        value={filters.occupancy}
                        onChange={(e) =>
                          handleFilterChange("occupancy", e.target.value)
                        }
                      >
                        <option value="">All</option>
                        <option value="vacant">Vacant</option>
                        <option value="self-occupied">Self-occupied</option>
                        <option value="tenanted">Tenanted</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="filter-group">
                      <Form.Label className="filter-label">Facing</Form.Label>
                      <Form.Select
                        size="sm"
                        value={filters.facing}
                        onChange={(e) =>
                          handleFilterChange("facing", e.target.value)
                        }
                      >
                        <option value="">All Directions</option>
                        <option value="north">North</option>
                        <option value="south">South</option>
                        <option value="east">East</option>
                        <option value="west">West</option>
                        <option value="north-east">North-East</option>
                        <option value="north-west">North-West</option>
                        <option value="south-east">South-East</option>
                        <option value="south-west">South-West</option>
                      </Form.Select>
                    </Form.Group> */}
                  </Form>
                </div>
                  )}
                </div>
              ) : null}

            {/* Projects Grid */}
            <div key={fadeKey} className="col-12 projects-content-wrapper">
            {(loading || listLoading) ? (
              <div className="projects-loading-state">
                <LoadingSpinner show={true} height="auto" />
                <p className="text-muted mt-3">Loading projects...</p>
              </div>
            ) : (displayProjects.length >= 1) ? (
              <>
                <div className="projects-grid-layout">
                  {displayProjects.map((item, index) => (
                    <div
                      key={item.id + "_" + index}
                      className="project-card-wrapper"
                    >
                      <PropertyContainer
                        data={item}
                        imagePriority={index < 6}
                      />
                    </div>
                  ))}
                </div>
                {!hasMore &&
                  !initialLoad &&
                  allProjectsList.length >= pageSize &&
                  isActive === "All" && (
                    <div className="load-complete">
                      <div className="divider-line"></div>
                      <p className="text-muted mb-0">
                        You&apos;ve viewed all projects
                      </p>
                      <div className="divider-line"></div>
                    </div>
                  )}
              </>
            ) : !loading ? (
              <div className="no-projects-state">
                <div className="no-projects-icon">
                  <FontAwesomeIcon icon={faHome} />
                </div>
                <h3>No Projects Found</h3>
                <p>
                  {hasActiveFilters || hasQuickFilter
                    ? "Try adjusting your filters or clear them to see all projects"
                    : "No projects are currently available"}
                </p>
                {(hasActiveFilters || hasQuickFilter) && (
                  <button
                    className="btn btn-success mt-3"
                    onClick={clearFilters}
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-2" />
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
        </div>
        </div>

        {/* Mobile Filter Modal - like properties page */}
        {!hasUrlParams && isMobileFilterOpen && (
          <div className="projects-mobile-filter-overlay" onClick={closeMobileFilter}>
            <div className="projects-mobile-filter-modal" onClick={(e) => e.stopPropagation()}>
              <div className="projects-mobile-filter-header">
                <div className="projects-mobile-filter-title">
                  <FontAwesomeIcon icon={faFilter} className="me-2" />
                  <span>Filters</span>
                </div>
                <button className="projects-mobile-filter-close" onClick={closeMobileFilter} aria-label="Close">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="projects-mobile-filter-body">
                <Form className="filter-form">
                  <Form.Group className="filter-group">
                    <Form.Label className="filter-label">Property Type</Form.Label>
                    {renderFilterDropdown({
                      id: "mobile-propertyType",
                      filterKey: "propertyType",
                      placeholder: "All Types",
                      value: draftFilters.propertyType,
                      options: propertyTypes,
                      getLabel: (type) => type.projectTypeName,
                      getValue: (type) => type.projectTypeName,
                    })}
                  </Form.Group>
                  <Form.Group className="filter-group">
                    <Form.Label className="filter-label">Location</Form.Label>
                    {renderFilterDropdown({
                      id: "mobile-city",
                      filterKey: "city",
                      placeholder: "All Cities",
                      value: draftFilters.city,
                      options: cities,
                      getLabel: (city) => city.cityName,
                      getValue: (city) => city.cityName,
                      scroll: true,
                    })}
                  </Form.Group>
                  <Form.Group className="filter-group">
                    <Form.Label className="filter-label">Budget Range</Form.Label>
                    {renderFilterDropdown({
                      id: "mobile-budget",
                      filterKey: "budget",
                      placeholder: "All Budgets",
                      value: draftFilters.budget,
                      options: budgetOptions,
                    })}
                  </Form.Group>
                  <Form.Group className="filter-group">
                    <Form.Label className="filter-label">Project Status</Form.Label>
                    {renderFilterDropdown({
                      id: "mobile-projectStatus",
                      filterKey: "projectStatus",
                      placeholder: "All Status",
                      value: draftFilters.projectStatus,
                      options: projectStatuses,
                      getLabel: (status) => status.statusName,
                      getValue: (status) => status.statusName,
                      scroll: true,
                    })}
                  </Form.Group>
                  <Form.Group className="filter-group">
                    <Form.Label className="filter-label">BHK Type</Form.Label>
                    {renderFilterDropdown({
                      id: "mobile-bhkType",
                      filterKey: "bhkType",
                      placeholder: "All BHK Types",
                      value: draftFilters.bhkType,
                      options: bhkTypes,
                      scroll: true,
                    })}
                  </Form.Group>
                </Form>
              </div>
              <div className="projects-mobile-filter-footer">
                <button className="projects-mobile-filter-reset" onClick={clearFilters}>Reset</button>
                <button className="projects-mobile-filter-apply" onClick={() => applySelectedFilters(true)}>Apply Filters</button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
  );
}
