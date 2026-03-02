"use client";

import PropertyContainer from "../components/common/page";
import "./project.css";
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import CommonBreadCrum from "../components/common/breadcrum";
import CommonHeaderBanner from "../components/common/commonheaderbanner";
import { LoadingSpinner } from "../contact-us/page";
import { useProjectContext } from "@/app/_global_components/contexts/projectsContext";
import { useSiteData } from "@/app/_global_components/contexts/SiteDataContext";
import {
  fetchProjectStatus,
} from "@/app/_global_components/masterFunction";
import { Form, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faTimes,
  faSlidersH,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import { useSearchParams } from "next/navigation";

export default function Projects() {
  const searchParams = useSearchParams();
  const [allProjectsList, setAllProjectsList] = useState([]);
  const [pageName, setPageName] = useState("Projects");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const { projectData, setProjectData } = useProjectContext();
  const {
    cityList: siteCityList,
    builderList: siteBuilderList,
    projectTypes: siteProjectTypes,
    projectList: siteProjectList,
    loading: siteDataLoading,
  } = useSiteData();
  const observer = useRef(null);
  const loadMoreRef = useRef(null);
  const [isActive, setIsActive] = useState("");
  // Smaller page size for fast first load on mobile (was 150); load more on scroll
  const pageSize = 150;
  const [fadeKey, setFadeKey] = useState(0);
  const [filteredProjectData, setFilteredProjectData] = useState([]);
  const [hasUrlParams, setHasUrlParams] = useState(false);

  // Filter states
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [cities, setCities] = useState([]);
  const [projectStatuses, setProjectStatuses] = useState([]);
  const [builders, setBuilders] = useState([]);
  const [filters, setFilters] = useState({
    propertyType: "",
    city: "",
    budget: "",
    projectStatus: "",
    builder: "",
    bhkType: "",
    possession: "",
    occupancy: "",
    facing: "",
  });

  // Extract unique BHK types from projects
  const [bhkTypes, setBhkTypes] = useState([]);

  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [pendingQueryFilters, setPendingQueryFilters] = useState(null);

  const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const matchesBudgetRange = (projectPrice, budgetFilter) => {
    const price = Number(projectPrice);
    if (!Number.isFinite(price)) return false;

    switch (budgetFilter) {
      case "Up to 1Cr*":
        return price <= 1;
      case "1-3 Cr*":
        return price >= 1 && price < 3;
      case "3-5 Cr*":
        return price >= 3 && price < 5;
      case "Above 5 Cr*":
        return price >= 5;
      default:
        return true;
    }
  };

  // Fetch projects with pagination
  const fetchProjects = useCallback(
    async (pageNum = 0, append = false) => {
      try {
        if (!append) {
          setLoading(true);
          setInitialLoad(true);
        } else {
          setLoadingMore(true);
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}projects/get-projects-in-parts`,
          {
            params: {
              page: pageNum,
              size: pageSize,
            },
          }
        );

        const newProjects = response.data || [];

        if (append) {
          setAllProjectsList((prev) => {
            return [...prev, ...newProjects];
          });
          setHasMore(newProjects.length === pageSize);
        } else {
          setAllProjectsList(newProjects);
          setHasMore(newProjects.length === pageSize);
          setIsActive("All"); // Always set to "All" after initial load
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setInitialLoad(false);
      }
    },
    [setProjectData, pageSize]
  );

  // Filter projects locally using SiteDataContext (same source as chatbot).
  const fetchParamsData = useCallback(
    (queryP) => {
      setLoading(true);
      setInitialLoad(true);

      let filtered = Array.isArray(siteProjectList) ? [...siteProjectList] : [];

      if (queryP?.propertyType) {
        const selectedType = siteProjectTypes.find(
          (pt) => toNumber(pt.id) === toNumber(queryP.propertyType)
        );
        if (selectedType) {
          if (selectedType.projectTypeName === "New Launches") {
            filtered = filtered.filter(
              (item) => item.projectStatusName === "New Launched"
            );
          } else {
            filtered = filtered.filter(
              (item) =>
                item.propertyTypeName === selectedType.projectTypeName ||
                toNumber(item.propertyTypeId) === toNumber(selectedType.id)
            );
          }
        } else {
          filtered = filtered.filter(
            (item) => toNumber(item.propertyTypeId) === toNumber(queryP.propertyType)
          );
        }
      }

      if (queryP?.propertyLocation) {
        const selectedCity = siteCityList.find(
          (city) => toNumber(city.id) === toNumber(queryP.propertyLocation)
        );
        if (selectedCity) {
          filtered = filtered.filter(
            (item) =>
              item.cityName === selectedCity.cityName ||
              toNumber(item.cityId) === toNumber(selectedCity.id)
          );
        } else {
          filtered = filtered.filter(
            (item) =>
              toNumber(item.cityId) === toNumber(queryP.propertyLocation) ||
              String(item.cityName || "").toLowerCase() ===
                String(queryP.propertyLocation || "").toLowerCase()
          );
        }
      }

      if (queryP?.budget) {
        filtered = filtered.filter((item) =>
          matchesBudgetRange(item.projectPrice, queryP.budget)
        );
      }

      setAllProjectsList(filtered);
      setHasMore(false); // Query-based results are not paginated
      setLoading(false);
      setInitialLoad(false);
    },
    [siteProjectList, siteProjectTypes, siteCityList]
  );

  // Extract BHK types from projects
  useEffect(() => {
    if (allProjectsList.length > 0) {
      const uniqueBHKTypes = new Set();
      allProjectsList.forEach((project) => {
        if (project.projectConfiguration) {
          const configs = project.projectConfiguration
            .split(",")
            .map((config) => config.trim())
            .filter((config) => /BHK/i.test(config));
          configs.forEach((bhk) => uniqueBHKTypes.add(bhk));
        }
      });
      const sortedBHKTypes = Array.from(uniqueBHKTypes).sort((a, b) => {
        const aNum = parseInt(a.match(/\d+/)?.[0] || "0");
        const bNum = parseInt(b.match(/\d+/)?.[0] || "0");
        return aNum - bNum;
      });
      setBhkTypes(sortedBHKTypes);
    }
  }, [allProjectsList]);

  // Load filter options from SiteDataContext, and status from API.
  useEffect(() => {
    setPropertyTypes(Array.isArray(siteProjectTypes) ? siteProjectTypes : []);
    setCities(Array.isArray(siteCityList) ? siteCityList : []);
    setBuilders(Array.isArray(siteBuilderList) ? siteBuilderList : []);
  }, [siteProjectTypes, siteCityList, siteBuilderList]);

  useEffect(() => {
    const loadProjectStatuses = async () => {
      try {
        const statusData = await fetchProjectStatus();
        setProjectStatuses(statusData?.data || statusData || []);
      } catch (error) {
        console.error("Error loading project statuses:", error);
      }
    };
    loadProjectStatuses();
  }, []);

  // Sync context with allProjectsList state
  useEffect(() => {
    setProjectData(allProjectsList);
  }, [allProjectsList, setProjectData]);

  // Initial decision: URL/session filters or default paginated projects.
  useEffect(() => {
    const propertyType = searchParams.get("propertyType");
    const propertyLocation = searchParams.get("propertyLocation");
    const budget = searchParams.get("budget");

    if (propertyType || propertyLocation || budget) {
      setHasUrlParams(true);
      setShowFilters(false);
      const queryParams = {};

      if (propertyType) queryParams.propertyType = propertyType;
      if (propertyLocation) queryParams.propertyLocation = propertyLocation;
      if (budget) queryParams.budget = budget;

      setPendingQueryFilters(queryParams);
      setIsActive("All");
    } else {
      setHasUrlParams(false);
      setShowFilters(false);
      const searched_query = sessionStorage.getItem("mpf-querry");
      if (searched_query) {
        try {
          const queryP = JSON.parse(searched_query);
          setPendingQueryFilters(queryP);
          setIsActive("All");
        } catch (error) {
          setPendingQueryFilters(null);
          fetchProjects(0, false);
        }
      } else {
        setPendingQueryFilters(null);
        fetchProjects(0, false);
      }
    }
  }, [fetchProjects, searchParams]);

  // Apply query-based filters only after SiteDataContext is ready.
  useEffect(() => {
    if (!pendingQueryFilters) return;

    if (siteDataLoading) {
      setLoading(true);
      setInitialLoad(true);
      return;
    }

    fetchParamsData(pendingQueryFilters);
  }, [pendingQueryFilters, siteDataLoading, fetchParamsData]);

  // Load more handler
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || loading || isActive !== "All") return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProjects(nextPage, true);
  }, [page, hasMore, loading, loadingMore, isActive, fetchProjects]);

  // Setup scroll observer for load more
  useEffect(() => {
    // Disable observer if conditions aren't met
    if (
      !hasMore ||
      loading ||
      initialLoad ||
      loadingMore ||
      isActive !== "All"
    ) {
      if (observer.current) {
        observer.current.disconnect();
      }
      return;
    }

    // Use requestAnimationFrame to ensure DOM is ready
    const rafId = requestAnimationFrame(() => {
      // Don't set up observer if loadMoreRef doesn't exist yet
      if (!loadMoreRef.current) {
        return;
      }

      if (observer.current) {
        observer.current.disconnect();
      }

      const handleIntersection = (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loadingMore &&
          !loading &&
          isActive === "All"
        ) {
          loadMore();
        }
      };

      observer.current = new IntersectionObserver(handleIntersection, {
        rootMargin: "300px", // Start loading 300px before reaching the bottom
        threshold: 0.01, // Trigger when element is visible
      });

      observer.current.observe(loadMoreRef.current);
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [hasMore, loading, loadingMore, initialLoad, isActive, loadMore]);

  // Apply filters
  const applyFilters = useCallback(() => {
    if (allProjectsList.length === 0) {
      setFilteredProjectData([]);
      return;
    }

    let filtered = [...allProjectsList];

    if (filters.propertyType && propertyTypes.length > 0) {
      const selectedType = propertyTypes.find(
        (pt) => pt.id === parseInt(filters.propertyType)
      );
      if (selectedType) {
        if (selectedType.projectTypeName === 'New Launches') {
          // "New Launches" is a special case - filter by project status instead of property type
          filtered = filtered.filter(
            (item) => item.projectStatusName === 'New Launched'
          );
        } else {
          // For other property types, filter by propertyTypeName or propertyTypeId
          filtered = filtered.filter(
            (item) => item.propertyTypeName === selectedType.projectTypeName || item.propertyTypeId === selectedType.id
          );
        }
      } else {
        // If type not found, filter by ID directly
        filtered = filtered.filter(
          (item) => item.propertyTypeId === parseInt(filters.propertyType)      
        );
      }
    }

    if (filters.city && cities.length > 0) {
      const selectedCity = cities.find((c) => c.id === parseInt(filters.city));
      if (selectedCity) {
        filtered = filtered.filter(
          (item) => item.cityName === selectedCity.cityName
        );
      } else {
        // If city not found, filter by ID directly
        filtered = filtered.filter(
          (item) => item.cityId === parseInt(filters.city)
        );
      }
    }

    if (filters.budget) {
      const budgetFilter = filters.budget;
      filtered = filtered.filter((item) => {
        const price = parseFloat(item.projectPrice);
        if (isNaN(price)) return false;

        switch (budgetFilter) {
          case "Up to 1Cr*":
            return price <= 1;
          case "1-3 Cr*":
            return price >= 1 && price < 3;
          case "3-5 Cr*":
            return price >= 3 && price < 5;
          case "Above 5 Cr*":
            return price >= 5;
          default:
            return true;
        }
      });
    }

    if (filters.projectStatus && projectStatuses.length > 0) {
      const selectedStatus = projectStatuses.find(
        (ps) => ps.id === parseInt(filters.projectStatus)
      );
      if (selectedStatus) {
        filtered = filtered.filter(
          (item) => item.projectStatusName === selectedStatus.statusName
        );
      } else {
        // If status not found, filter by ID directly
        filtered = filtered.filter(
          (item) => item.projectStatusId === parseInt(filters.projectStatus)
        );
      }
    }

    if (filters.builder && builders.length > 0) {
      const selectedBuilder = builders.find(
        (b) =>
          b.id === parseInt(filters.builder) ||
          b.builderName === filters.builder
      );
      if (selectedBuilder) {
        filtered = filtered.filter(
          (item) =>
            item.builderName === selectedBuilder.builderName ||
            item.builderId === selectedBuilder.id
        );
      }
    }

    // BHK Type filter
    if (filters.bhkType) {
      filtered = filtered.filter((item) => {
        if (!item.projectConfiguration) return false;
        const configs = item.projectConfiguration
          .split(",")
          .map((config) => config.trim());
        return configs.includes(filters.bhkType);
      });
    }

    // Possession filter (if available)
    if (filters.possession) {
      filtered = filtered.filter((item) => {
        if (!item.possession) return false;
        const possessionLower = item.possession.toLowerCase();
        const filterLower = filters.possession.toLowerCase();

        // Handle different possession filter types
        if (filterLower === "ready") {
          return (
            possessionLower.includes("ready") ||
            possessionLower.includes("ready to move")
          );
        } else if (filterLower === "under-construction") {
          return (
            possessionLower.includes("under") ||
            possessionLower.includes("construction")
          );
        } else if (filterLower.startsWith("q")) {
          return possessionLower.includes(filterLower);
        }
        return possessionLower.includes(filterLower);
      });
    }

    // Occupancy filter (if available)
    if (filters.occupancy) {
      filtered = filtered.filter((item) => {
        if (!item.occupancy) return false;
        return item.occupancy.toLowerCase() === filters.occupancy.toLowerCase();
      });
    }

    // Facing filter (if available)
    if (filters.facing) {
      filtered = filtered.filter((item) => {
        if (!item.facing) return false;
        return item.facing.toLowerCase() === filters.facing.toLowerCase();
      });
    }

    setFilteredProjectData(filtered);
    setHasMore(false); // Filters don't support pagination
    setFadeKey((prev) => prev + 1);
    window.scrollTo({ top: 260, behavior: "smooth" });
  }, [
    allProjectsList,
    filters,
    propertyTypes,
    cities,
    projectStatuses,
    builders,
  ]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      propertyType: "",
      city: "",
      budget: "",
      projectStatus: "",
      builder: "",
      bhkType: "",
      possession: "",
      occupancy: "",
      facing: "",
    });
    setFilteredProjectData([]);
    setHasMore(true);
    setIsActive("All");
    const totalLoaded = allProjectsList.length;
    setHasMore(totalLoaded >= pageSize && totalLoaded % pageSize === 0);
    setFadeKey((prev) => prev + 1);
  };

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Apply filters when filter values change (only for advanced filters)
  useEffect(() => {
    const hasActiveFilters = Object.values(filters).some(
      (value) => value !== ""
    );
    const hasQuickFilter = isActive !== "" && isActive !== "All";

    // Only handle advanced filters, not quick filter tabs
    if (hasActiveFilters) {
      // Apply filters when there are active filters
      applyFilters();
    } else if (!hasQuickFilter && isActive !== "All") {
      // Only clear filtered data if no quick filter is active and not "All" tab
      // (quick filters handle their own filteredProjectData)
      setFilteredProjectData([]);
      const totalLoaded = allProjectsList.length;
      setHasMore(totalLoaded >= pageSize && totalLoaded % pageSize === 0);
    }
  }, [filters, allProjectsList, applyFilters, isActive]);

  const filterSectionTab = (tabName) => {
    setIsActive(tabName);
    setPage(0);

    // Clear advanced filters
    setFilters({
      propertyType: "",
      city: "",
      budget: "",
      projectStatus: "",
      builder: "",
      bhkType: "",
      possession: "",
      occupancy: "",
      facing: "",
    });

    // Use setTimeout to ensure state updates don't conflict
    setTimeout(() => {
      let filtered = [];
      if (tabName === "All") {
        filtered = allProjectsList;
        const totalLoaded = allProjectsList.length;
        setHasMore(totalLoaded >= pageSize && totalLoaded % pageSize === 0);
      } else if (tabName === "Commercial") {
        filtered = allProjectsList.filter(
          (item) => item.propertyTypeName === "Commercial"
        );
        setHasMore(false);
      } else if (tabName === "Residential") {
        filtered = allProjectsList.filter(
          (item) => item.propertyTypeName === "Residential"
        );
        setHasMore(false);
      } else if (tabName === "New Launched") {
        filtered = allProjectsList.filter(
          (item) => item.projectStatusName === "New Launched"
        );
        setHasMore(false);
      }

      // Set filtered data
      setFilteredProjectData(filtered);
      setFadeKey((prev) => prev + 1);
    }, 0);

    window.scrollTo({ top: 260, behavior: "smooth" });
  };

  // Use filtered data if filter is active or advanced filters are applied
  const hasActiveFilters = Object.values(filters).some((value) => value !== "");
  const hasQuickFilterActive = isActive !== "" && isActive !== "All";

  // Determine which projects to display
  let displayProjects = [];

  // If URL params are present, always show all projects from API directly
  if (hasUrlParams) {
    displayProjects = allProjectsList;
  } else if (isActive === "All") {
    // Show all projects when "All" is selected and no advanced filters
    displayProjects = hasActiveFilters ? filteredProjectData : allProjectsList;
  } else if (hasQuickFilterActive) {
    // Show filtered results for quick filter tabs (Commercial, Residential, New Launch)
    displayProjects = filteredProjectData;
  } else if (hasActiveFilters) {
    // Show filtered results for advanced filters
    displayProjects = filteredProjectData.length > 0 ? filteredProjectData : [];
  } else {
    // No filters active, show all projects
    displayProjects = allProjectsList;
  }

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== ""
  ).length;
  const hasQuickFilter = isActive !== "" && isActive !== "All";

  return (
    <div className="projects-page-wrapper">
      <CommonHeaderBanner 
      headerText={pageName} 
      image={"realestate-bg.jpg"}
      firstPage={"projects"}
      />
      {/* <CommonBreadCrum pageName={pageName} /> */}

      <div className="container py-4">
        {/* Page Header with Quick Filters */}
        <div className="page-header-section mb-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
            <div>
              {/* <h1 className="page-main-title">
                <FontAwesomeIcon icon={faHome} className="me-2 text-success" />
                {pageName}
              </h1> */}
              <p className="page-subtitle mb-0">
                Showing <strong>{displayProjects.length}</strong>{" "}
                {displayProjects.length === 1 ? "project" : "projects"}
                {!hasUrlParams && (hasQuickFilter || activeFiltersCount > 0) && (
                  <span className="ms-2">
                    <Badge bg="success" className="ms-1">
                      {activeFiltersCount + (hasQuickFilter ? 1 : 0)} active
                    </Badge>
                  </span>
                )}
              </p>
            </div>
            {!hasUrlParams && (
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FontAwesomeIcon icon={faSlidersH} className="me-2" />
                  {showFilters ? "Hide" : "Show"} Filters
                  {activeFiltersCount > 0 && (
                    <Badge bg="danger" className="ms-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </button>
                {(hasQuickFilter || activeFiltersCount > 0) && (
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={clearFilters}
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-2" />
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Filter Pills - Hide when URL params are present */}
          {!hasUrlParams && (
            <div className="quick-filters-row">
              <div className="filter-pills-container">
                <button
                  className={`filter-pill-btn ${
                    isActive === "All" ? "active" : ""
                  }`}
                  onClick={() => filterSectionTab("All")}
                >
                  All Projects
                </button>
                <button
                  className={`filter-pill-btn ${
                    isActive === "Commercial" ? "active" : ""
                  }`}
                  onClick={() => filterSectionTab("Commercial")}
                >
                  Commercial
                </button>
                <button
                  className={`filter-pill-btn ${
                    isActive === "Residential" ? "active" : ""
                  }`}
                  onClick={() => filterSectionTab("Residential")}
                >
                  Residential
                </button>
                <button
                  className={`filter-pill-btn ${
                    isActive === "New Launched" ? "active" : ""
                  }`}
                  onClick={() => filterSectionTab("New Launched")}
                >
                  New Launch
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="row g-4">
          {/* Collapsible Filter Sidebar */}
          {!hasUrlParams && showFilters && (
            <div className="col-12 col-lg-3">
              <div className="filter-sidebar-card">
                <div className="filter-card-header">
                  <h5 className="mb-0">
                    <FontAwesomeIcon
                      icon={faFilter}
                      className="me-2 text-success"
                    />
                    Refine Search
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowFilters(false)}
                    aria-label="Close filters"
                  ></button>
                </div>
                <div className="filter-card-body">
                  <Form className="filter-form">
                    <Form.Group className="filter-group">
                      <Form.Label className="filter-label">
                        Property Type
                      </Form.Label>
                      <Form.Select
                        size="sm"
                        value={filters.propertyType}
                        onChange={(e) =>
                          handleFilterChange("propertyType", e.target.value)
                        }
                      >
                        <option value="">All Types</option>
                        {propertyTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.projectTypeName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="filter-group">
                      <Form.Label className="filter-label">Location</Form.Label>
                      <Form.Select
                        size="sm"
                        value={filters.city}
                         onChange={(e) =>
                           handleFilterChange("city", e.target.value)
                         }
                      >
                        <option value="">All Cities</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.cityName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="filter-group">
                      <Form.Label className="filter-label">
                        Budget Range
                      </Form.Label>
                      <Form.Select
                        size="sm"
                        value={filters.budget}
                        onChange={(e) =>
                          handleFilterChange("budget", e.target.value)
                        }
                      >
                        <option value="">All Budgets</option>
                        <option value="Up to 1Cr*">Up to 1Cr*</option>
                        <option value="1-3 Cr*">1-3 Cr*</option>
                        <option value="3-5 Cr*">3-5 Cr*</option>
                        <option value="Above 5 Cr*">Above 5 Cr*</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="filter-group">
                      <Form.Label className="filter-label">
                        Project Status
                      </Form.Label>
                      <Form.Select
                        size="sm"
                        value={filters.projectStatus}
                        onChange={(e) =>
                          handleFilterChange("projectStatus", e.target.value)
                        }
                      >
                        <option value="">All Status</option>
                        {projectStatuses.map((status) => (
                          <option key={status.id} value={status.id}>
                            {status.statusName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="filter-group">
                      <Form.Label className="filter-label">BHK Type</Form.Label>
                      <Form.Select
                        size="sm"
                        value={filters.bhkType}
                        onChange={(e) =>
                          handleFilterChange("bhkType", e.target.value)
                        }
                      >
                        <option value="">All BHK Types</option>
                        {bhkTypes.map((bhk, index) => (
                          <option key={`${bhk}-${index}`} value={bhk}>
                            {bhk}
                          </option>
                        ))}
                      </Form.Select>
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
              </div>
            </div>
          )}

          {/* Projects Grid */}
          <div
            key={fadeKey}
            className={`col-12 ${
              showFilters ? "col-lg-9" : "col-lg-12"
            } projects-content-wrapper`}
          >
            {initialLoad && loading ? (
              <div className="projects-loading-state">
                <LoadingSpinner show={true} height="auto" />
                <p className="text-muted mt-3">Loading projects...</p>
              </div>
            ) : displayProjects.length > 0 ? (
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
                {/* Load More Section */}
                {hasMore &&
                  isActive === "All" &&
                  !initialLoad &&
                  displayProjects.length > 0 && (
                    <div ref={loadMoreRef} className="load-more-section">
                      {loadingMore && (
                        <div className="load-more-spinner">
                          <LoadingSpinner show={true} height="auto" />
                          <span className="ms-3">Loading more projects...</span>
                        </div>
                      )}
                    </div>
                  )}
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
  );
}
