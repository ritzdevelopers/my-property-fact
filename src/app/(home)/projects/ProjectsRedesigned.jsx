"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faSort,
  faSearch,
  faHome,
  faTimes,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { useSiteData } from "@/app/_global_components/contexts/SiteDataContext";
import {
  PROJECT_BUDGET_OPTIONS,
  matchesBudgetRangeForProject,
  normalizeBudgetSelection,
} from "@/app/_global_components/projectFilterUtils";
import { projectNameMatchesSearch } from "@/app/_global_components/projectSearchUtils";

import ProjectCard from "./components/ProjectCard";
import MobileFilterDrawer from "./components/MobileFilterDrawer";
import "./projects-redesign.css";

const EMPTY_FILTERS = {
  propertyType: "",
  city: "",
  budget: "",
  projectStatus: "",
  bhkType: "",
};

const BHK_OPTIONS = ["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK", "5+ BHK"];
const PROJECTS_PER_PAGE = 10;

function normalizeText(value) {
  return String(value || "").toLowerCase().trim().replace(/\s+/g, " ");
}

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mpf-sidebar-section">
      <button
        type="button"
        className="mpf-sidebar-section-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
      </button>
      {isOpen && <div className="mpf-sidebar-section-body">{children}</div>}
    </div>
  );
};

export default function ProjectsRedesigned() {
  const {
    cityList: cities,
    projectTypes: propertyTypes,
    projectStatuses,
    projectList: allProjectsList,
    loading: siteDataLoading,
    queryFilters,
    clearQueryFilters,
  } = useSiteData();

  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState("");
  const [isSortPending, startSortTransition] = useTransition();
  const [sortLoaderVisible, setSortLoaderVisible] = useState(false);
  const sortLoaderHideAtRef = useRef(0);
  const sortLoaderTimerRef = useRef(null);
  const SORT_LOADER_MIN_MS = 1900;

  const budgetOptions = PROJECT_BUDGET_OPTIONS;

  useEffect(() => {
    // If a removed quick-filter key is still active, clear it.
    if (activeQuickFilter === "rera") setActiveQuickFilter("");
  }, [activeQuickFilter]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const root = document.documentElement;
    const header = document.querySelector(".header");
    if (!header) return undefined;

    let raf = null;
    const compute = () => {
      const rect = header.getBoundingClientRect?.();
      const hRaw = rect?.height || header.offsetHeight || 0;
      const h = Math.max(0, Math.round(hRaw));
      if (h) root.style.setProperty("--mpf-site-header-height", `${h}px`);
    };
    const schedule = () => {
      if (raf != null) return;
      raf = window.requestAnimationFrame(() => {
        raf = null;
        compute();
      });
    };

    // Initial sync
    compute();

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    ro?.observe(header);

    window.addEventListener("resize", schedule);

    return () => {
      if (raf != null) window.cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, []);

  useEffect(() => {
    const hasFilters = queryFilters?.propertyType || queryFilters?.propertyLocation || queryFilters?.budget;
    if (!hasFilters) return;
    if (queryFilters?.propertyType && (!propertyTypes || propertyTypes.length === 0)) return;
    if (queryFilters?.propertyLocation && (!cities || cities.length === 0)) return;

    const selectedType = propertyTypes?.find(
      (t) => String(t?.id) === String(queryFilters.propertyType)
    );
    const selectedCity = cities?.find(
      (c) => String(c?.id) === String(queryFilters.propertyLocation)
    );

    setFilters({
      ...EMPTY_FILTERS,
      propertyType: selectedType?.projectTypeName || "",
      city: selectedCity?.cityName || "",
      budget: normalizeBudgetSelection(queryFilters?.budget, "web") || "",
    });
    clearQueryFilters();
  }, [queryFilters, propertyTypes, cities, clearQueryFilters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? "" : value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setActiveTab("all");
    setSearchTerm("");
    setActiveQuickFilter("");
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const filteredProjects = useMemo(() => {
    const source = Array.isArray(allProjectsList) ? allProjectsList : [];
    const searchNorm = normalizeText(searchTerm);

    return source.filter((item) => {
      const typeNorm = normalizeText(item?.propertyTypeName);
      const cityNorm = normalizeText(item?.cityName);
      const addressNorm = normalizeText(item?.projectAddress);
      const statusNorm = normalizeText(item?.projectStatusName);
      const configNorm = normalizeText(item?.projectConfiguration);

      // Tab filter
      if (activeTab === "residential" && !typeNorm.includes("residential")) return false;
      if (activeTab === "commercial" && !typeNorm.includes("commercial")) return false;

      // Quick filters
      if (activeQuickFilter) {
        if (activeQuickFilter === "ready" && !statusNorm.includes("ready")) return false;
        if (
          activeQuickFilter === "new" &&
          !(statusNorm.includes("new launch") || statusNorm.includes("new launched"))
        ) {
          return false;
        }
        if (activeQuickFilter === "under-construction" && !statusNorm.includes("under construction")) return false;
        if (activeQuickFilter === "ultra-luxury" && !statusNorm.includes("ultra luxury")) return false;
      }

      // City filter
      if (filters.city) {
        const filterCity = normalizeText(filters.city);
        if (!cityNorm.includes(filterCity) && !addressNorm.includes(filterCity)) return false;
      }

      // Budget filter
      if (filters.budget && !matchesBudgetRangeForProject(item, filters.budget)) return false;

      // BHK filter
      if (filters.bhkType && !configNorm.includes(normalizeText(filters.bhkType))) return false;

      // Status filter
      if (filters.projectStatus && !statusNorm.includes(normalizeText(filters.projectStatus))) return false;

      // Search filter
      if (searchNorm && !projectNameMatchesSearch(item?.projectName, searchNorm)) return false;

      return true;
    });
  }, [allProjectsList, activeTab, activeQuickFilter, filters, searchTerm]);

  const sortedProjects = useMemo(() => {
    const projects = [...filteredProjects];
    switch (sortBy) {
      case "price-low":
        return projects.sort((a, b) => parseFloat(a.projectPrice || 0) - parseFloat(b.projectPrice || 0));
      case "price-high":
        return projects.sort((a, b) => parseFloat(b.projectPrice || 0) - parseFloat(a.projectPrice || 0));
      case "newest":
        return projects.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      default:
        return projects;
    }
  }, [filteredProjects, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedProjects.length / PROJECTS_PER_PAGE));
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * PROJECTS_PER_PAGE;
    return sortedProjects.slice(start, start + PROJECTS_PER_PAGE);
  }, [sortedProjects, currentPage]);

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;
  const isLoading = siteDataLoading;

  const quickFilters = [
    { key: "ready", label: "Ready to Move" },
    { key: "new", label: "New Launch" },
    { key: "under-construction", label: "Under Construction" },
    { key: "ultra-luxury", label: "Ultra Luxury" },
  ];

  const sortDropdownRef = useRef(null);

  const showSortLoader = useCallback(() => {
    const now = Date.now();
    sortLoaderHideAtRef.current = Math.max(sortLoaderHideAtRef.current, now + SORT_LOADER_MIN_MS);
    setSortLoaderVisible(true);
    if (sortLoaderTimerRef.current) {
      window.clearTimeout(sortLoaderTimerRef.current);
      sortLoaderTimerRef.current = null;
    }
  }, []);

  const applyPropertyTypeFromDropdown = useCallback((nextTab) => {
    setShowSortDropdown(false);
    showSortLoader();
    startSortTransition(() => {
      setActiveTab(nextTab);
      setCurrentPage(1);
    });
  }, [showSortLoader]);

  const applySortFromDropdown = useCallback((nextSort) => {
    setShowSortDropdown(false);
    showSortLoader();
    startSortTransition(() => {
      setSortBy(nextSort);
      setCurrentPage(1);
    });
  }, [showSortLoader]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setShowSortDropdown(false);
      }
    };
    if (showSortDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSortDropdown]);

  // Prevent background scroll while loader is visible
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const prev = document.body.style.overflow;
    if (sortLoaderVisible) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sortLoaderVisible]);

  // Keep loader visible for a minimum duration (best UX)
  useEffect(() => {
    if (!sortLoaderVisible) return undefined;

    // While pending, never hide.
    if (isSortPending) return undefined;

    const now = Date.now();
    const remaining = Math.max(0, sortLoaderHideAtRef.current - now);

    if (sortLoaderTimerRef.current) window.clearTimeout(sortLoaderTimerRef.current);
    sortLoaderTimerRef.current = window.setTimeout(() => {
      setSortLoaderVisible(false);
      sortLoaderTimerRef.current = null;
    }, remaining);

    return () => {
      if (sortLoaderTimerRef.current) {
        window.clearTimeout(sortLoaderTimerRef.current);
        sortLoaderTimerRef.current = null;
      }
    };
  }, [isSortPending, sortLoaderVisible]);

  return (
    <div className="mpf-projects-page">
      {sortLoaderVisible && (
        <div className="mpf-screen-loader" aria-live="polite" aria-busy="true" role="status">
          <div className="mpf-screen-loader__backdrop" />
          <div className="mpf-screen-loader__card">
            <div className="mpf-screen-loader__spinner" />
            <div className="mpf-screen-loader__text">
              <div className="mpf-screen-loader__title">Updating projects</div>
              <div className="mpf-screen-loader__subtitle">Please wait…</div>
            </div>
          </div>
        </div>
      )}
      <div className="mpf-container">
        {/* Breadcrumb & Title */}
        <div className="mpf-page-header">
          <nav className="mpf-breadcrumb">
            <Link href="/">Home</Link>
            <span>›</span>
            <span>Projects in India</span>
          </nav>
          <h1 className="mpf-page-title">
            {sortedProjects.length} Projects | Projects for Sale
          </h1>
        </div>

        {/* Quick Filters */}
        <div className="mpf-quick-filters">
          {quickFilters.map((qf) => (
            <button
              key={qf.key}
              type="button"
              className={`mpf-quick-filter-btn ${activeQuickFilter === qf.key ? "active" : ""}`}
              onClick={() => {
                setActiveQuickFilter((prev) => (prev === qf.key ? "" : qf.key));
                setCurrentPage(1);
              }}
            >
              {qf.label}
            </button>
          ))}
          <div className="mpf-sort-wrapper" ref={sortDropdownRef}>
            <button
              className="mpf-sort-btn"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
            >
              Sort By
              <FontAwesomeIcon icon={showSortDropdown ? faChevronUp : faChevronDown} />
            </button>
            {showSortDropdown && (
              <div className="mpf-sort-dropdown">
                <div className="mpf-dropdown-section">
                  <span className="mpf-dropdown-label">Property Type</span>
                  {[
                    { value: "all", label: "All Projects" },
                    { value: "residential", label: "Residential" },
                    { value: "commercial", label: "Commercial" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      className={activeTab === opt.value ? "active" : ""}
                      onClick={() => applyPropertyTypeFromDropdown(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="mpf-dropdown-divider"></div>
                <div className="mpf-dropdown-section">
                  <span className="mpf-dropdown-label">Sort By</span>
                  {[
                    { value: "relevance", label: "Relevance" },
                    { value: "price-low", label: "Price: Low to High" },
                    { value: "price-high", label: "Price: High to Low" },
                    { value: "newest", label: "Newest First" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      className={sortBy === opt.value ? "active" : ""}
                      onClick={() => applySortFromDropdown(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Layout */}
        <div className="mpf-main-layout">
          {/* Sidebar Filters */}
          <aside className="mpf-filters-sidebar">
            <div className="mpf-sidebar-header">
              <h2>Filters</h2>
              {activeFiltersCount > 0 && (
                <button className="mpf-clear-btn" onClick={handleClearFilters}>
                  Clear All
                </button>
              )}
            </div>

            <FilterSection title="Budget">
              <div className="mpf-budget-inputs">
                <input type="text" placeholder="Min" className="mpf-budget-input" />
                <span>-</span>
                <input type="text" placeholder="Max" className="mpf-budget-input" />
              </div>
              <div className="mpf-budget-options">
                {budgetOptions.slice(0, 6).map((opt, idx) => (
                  <button
                    key={idx}
                    className={`mpf-budget-btn ${filters.budget === opt ? "active" : ""}`}
                    onClick={() => handleFilterChange("budget", opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Bedroom">
              <div className="mpf-checkbox-list">
                {BHK_OPTIONS.map((bhk, idx) => (
                  <label key={idx} className="mpf-checkbox-item">
                    <input
                      type="checkbox"
                      checked={filters.bhkType === bhk}
                      onChange={() => handleFilterChange("bhkType", bhk)}
                    />
                    <span className="mpf-checkbox-label">{bhk}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Possession In">
              <div className="mpf-checkbox-list">
                {["Ready to move", "New Launch", "2030", "2029", "2028", "2027"].map((opt, idx) => (
                  <label key={idx} className="mpf-checkbox-item">
                    <input
                      type="checkbox"
                      checked={filters.projectStatus === opt}
                      onChange={() => handleFilterChange("projectStatus", opt)}
                    />
                    <span className="mpf-checkbox-label">{opt}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Location" defaultOpen={false}>
              <div className="mpf-checkbox-list mpf-checkbox-scrollable">
                {(cities || []).slice(0, 15).map((city, idx) => (
                  <label key={idx} className="mpf-checkbox-item">
                    <input
                      type="checkbox"
                      checked={filters.city === city.cityName}
                      onChange={() => handleFilterChange("city", city.cityName)}
                    />
                    <span className="mpf-checkbox-label">{city.cityName}</span>
                  </label>
                ))}
              </div>
            </FilterSection>
          </aside>

          {/* Listings */}
          <main className="mpf-listings">
            {/* Mobile Filter Button */}
            <button
              className="mpf-mobile-filter-btn"
              onClick={() => setIsMobileFilterOpen(true)}
            >
              <FontAwesomeIcon icon={faFilter} />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>

            {/* Search Bar */}
            <form className="mpf-search-form" onSubmit={handleSearch}>
              <FontAwesomeIcon icon={faSearch} className="mpf-search-icon" />
              <input
                type="text"
                placeholder="Search Project"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mpf-search-input"
              />
            </form>

            {/* Loading */}
            {isLoading && (
              <div className="mpf-loading">
                <div className="mpf-spinner"></div>
                <p>Loading projects...</p>
              </div>
            )}

            {/* No Results */}
            {!isLoading && sortedProjects.length === 0 && (
              <div className="mpf-no-results">
                <FontAwesomeIcon icon={faHome} className="mpf-no-results-icon" />
                <h3>No Projects Found</h3>
                <p>Try adjusting your filters to find more projects.</p>
                <button onClick={handleClearFilters} className="mpf-clear-filters-btn">
                  Clear Filters
                </button>
              </div>
            )}

            {/* Project Listings */}
            {!isLoading && sortedProjects.length > 0 && (
              <div className="mpf-listings-list">
                {paginatedProjects.map((project, idx) => (
                  <ProjectCard
                    key={project.id || idx}
                    project={project}
                    imagePriority={idx < 3}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="mpf-pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      className={currentPage === page ? "active" : ""}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}
                {totalPages > 5 && <span>...</span>}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onApplyFilters={() => setIsMobileFilterOpen(false)}
        cities={cities || []}
        propertyTypes={propertyTypes || []}
        projectStatuses={projectStatuses || []}
        budgetOptions={budgetOptions}
        bhkOptions={BHK_OPTIONS}
        activeFiltersCount={activeFiltersCount}
      />
    </div>
  );
}
