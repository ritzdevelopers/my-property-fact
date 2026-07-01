"use client";

import PropertyContainer from "../components/common/page";
import "./project.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CommonHeaderBanner from "../components/common/commonheaderbanner";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import { useSiteData } from "@/app/_global_components/contexts/SiteDataContext";
import {
  PROJECT_BUDGET_OPTIONS,
  matchesBudgetRangeForProject,
  normalizeBudgetSelection,
} from "@/app/_global_components/projectFilterUtils";
import { ProjectListingPaginationControls } from "@/app/_global_components/projectListingPagination";
import {
  findBestProjectBySearch,
  projectNameMatchesSearch,
  scoreProjectSearchMatch,
} from "@/app/_global_components/projectSearchUtils";
import { Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faTimes,
  faSlidersH,
  faHome,
  faSearch,
  faMicrophone,
  faTimesCircle,
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

const PROJECT_BHK_FILTER_OPTIONS = [
  "1 BHK",
  "2 BHK",
  "3 BHK",
  "4 BHK",
  "5 BHK",
  "6 BHK",
  "7 BHK",
  "8 BHK",
  "1 RK Studio",
  
];

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/** Quick tab + New Launch segment so the chosen project is visible in the grid. */
function deriveQuickFilterAndSegmentFromProject(item) {
  if (!item) return { quickTab: "All", segment: "all" };
  const itemType = normalizeText(item?.propertyTypeName || "");
  const itemStatus = normalizeText(item?.projectStatusName || "");
  const isNewLaunch = itemStatus.includes("new launch");

  if (isNewLaunch) {
    let segment = "all";
    if (itemType.includes("residential")) segment = "residential";
    else if (itemType.includes("commercial")) segment = "commercial";
    return { quickTab: "New Launched", segment };
  }
  if (itemType.includes("commercial")) {
    return { quickTab: "Commercial", segment: "all" };
  }
  if (itemType.includes("residential")) {
    return { quickTab: "Residential", segment: "all" };
  }
  return { quickTab: "All", segment: "all" };
}

/** Map API project type label (home search / query sync) to the same quick tabs as the listing. */
function deriveQuickTabFromProjectTypeName(typeNameRaw) {
  const n = normalizeText(typeNameRaw || "");
  if (!n) return { quickTab: "All", segment: "all" };
  if (n.includes("new launch")) {
    return { quickTab: "New Launched", segment: "all" };
  }
  if (n.includes("commercial")) {
    return { quickTab: "Commercial", segment: "all" };
  }
  if (n.includes("residential")) {
    return { quickTab: "Residential", segment: "all" };
  }
  return { quickTab: "All", segment: "all" };
}

export default function Projects() {
  const PROJECTS_PER_PAGE = 12;
  const [pageName] = useState("Projects");
  const {
    cityList: cities,
    projectTypes: propertyTypes,
    projectStatuses,
    projectList: allProjectsList,
    loading: siteDataLoading,
    queryFilters,
    clearQueryFilters,
  } = useSiteData();
  const [quickProjectFilter, setQuickProjectFilter] = useState("All");
  const [filters, setFilters] = useState(EMPTY_PROJECT_FILTERS);
  const isActive = quickProjectFilter || "All";
  const [fadeKey, setFadeKey] = useState(0);
  const hasUrlParams = false;

  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [draftFilters, setDraftFilters] = useState(filters);
  const [listLoading, setListLoading] = useState(false);
  const [desktopTabTransitionLoading, setDesktopTabTransitionLoading] =
    useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  /** New Launch tab only: "all" | "residential" | "commercial" */
  const [newLaunchTypeSegment, setNewLaunchTypeSegment] = useState("all");
  const [newLaunchSwitchLoading, setNewLaunchSwitchLoading] = useState(false);
  const [projectSearchTerm, setProjectSearchTerm] = useState("");
  const [appliedProjectSearchTerm, setAppliedProjectSearchTerm] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchSuggestionsLoading, setSearchSuggestionsLoading] = useState(false);
  const [searchSuggestionsQuery, setSearchSuggestionsQuery] = useState("");
  const [searchPlaceholderIndex, setSearchPlaceholderIndex] = useState(0);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [voiceLiveText, setVoiceLiveText] = useState("");
  const searchLoadingTimeoutRef = useRef(null);
  const searchWrapperRef = useRef(null);
  const projectsResultsRef = useRef(null);
  const suggestionsTimeoutRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const voiceShouldApplyOnEndRef = useRef(true);
  const voiceFinalTextRef = useRef("");
  const rotatingSearchPlaceholders = [
    "Eldeco Camelot",
    "Saya Gold Avenue",
    "Godrej Majesty",
    "M3M The Line",
    "AIPL Joy Central",
  ];

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
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setShowSearchSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const budgetOptions = PROJECT_BUDGET_OPTIONS;

  const scrollDesktopToProjectsGrid = () => {
    if (typeof window === "undefined" || window.innerWidth < 992) return;
    requestAnimationFrame(() => {
      projectsResultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const startDesktopFilterTransition = useCallback(() => {
    if (typeof window === "undefined" || window.innerWidth < 992) return;
    setDesktopTabTransitionLoading(true);
    scrollDesktopToProjectsGrid();
    if (searchLoadingTimeoutRef.current) {
      clearTimeout(searchLoadingTimeoutRef.current);
    }
    searchLoadingTimeoutRef.current = setTimeout(() => {
      setDesktopTabTransitionLoading(false);
    }, 550);
  }, []);

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

    const { quickTab, segment } = selectedType?.projectTypeName
      ? deriveQuickTabFromProjectTypeName(selectedType.projectTypeName)
      : { quickTab: "All", segment: "all" };
    setQuickProjectFilter(quickTab);
    setNewLaunchTypeSegment(segment);
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
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (error) {
          // no-op
        }
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
    setCurrentPage(1);
    setNewLaunchTypeSegment("all");
    setProjectSearchTerm("");
    setAppliedProjectSearchTerm("");
    setShowSearchSuggestions(false);
    setDesktopTabTransitionLoading(false);
  };

  const applySelectedFilters = (closeMobile = false) => {
    setListLoading(true);
    setFilters(draftFilters);
    setCurrentPage(1);
    setFadeKey((prev) => prev + 1);
    scrollDesktopToProjectsGrid();
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
    if (typeof window !== "undefined" && window.innerWidth < 992) {
      window.scrollTo({ top: 260, behavior: "smooth" });
    }
  };

  const applySearchFilter = () => {
    setCurrentPage(1);
    setFadeKey((prev) => prev + 1);
    setShowSearchSuggestions(false);
  };

  useEffect(() => {
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }
    const nextQuery = projectSearchTerm.trim();
    if (!nextQuery) {
      setSearchSuggestionsLoading(false);
      setSearchSuggestionsQuery("");
      return;
    }
    setSearchSuggestionsLoading(true);
    suggestionsTimeoutRef.current = setTimeout(() => {
      setSearchSuggestionsQuery(nextQuery);
      setSearchSuggestionsLoading(false);
    }, 350);
  }, [projectSearchTerm]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSearchPlaceholderIndex(
        (prev) => (prev + 1) % rotatingSearchPlaceholders.length
      );
    }, 2500);
    return () => clearInterval(intervalId);
  }, [rotatingSearchPlaceholders.length]);

  const handleVoiceSearch = () => {
    if (!speechRecognitionRef.current || !isVoiceSupported) return;
    voiceShouldApplyOnEndRef.current = true;
    voiceFinalTextRef.current = "";
    setVoiceLiveText("");
    setShowVoiceOverlay(true);
    try {
      speechRecognitionRef.current.start();
    } catch (error) {
      // If already started, let current session continue.
    }
  };

  const handleCloseVoiceOverlay = () => {
    voiceShouldApplyOnEndRef.current = false;
    setShowVoiceOverlay(false);
    setIsVoiceListening(false);
    setVoiceLiveText("");
    voiceFinalTextRef.current = "";
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (error) {
        // no-op
      }
    }
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
    setNewLaunchTypeSegment("all");
    setFadeKey((prev) => prev + 1);
    setCurrentPage(1);
    startDesktopFilterTransition();
    if (typeof window !== "undefined" && window.innerWidth < 992) {
      window.scrollTo({ top: 260, behavior: "smooth" });
    }
  };

  const selectNewLaunchSegment = (segment) => {
    const nextSegment =
      newLaunchTypeSegment === segment ? "all" : segment;
    if (nextSegment === newLaunchTypeSegment) return;
    setNewLaunchSwitchLoading(true);
    setCurrentPage(1);
    scrollDesktopToProjectsGrid();
    if (searchLoadingTimeoutRef.current) {
      clearTimeout(searchLoadingTimeoutRef.current);
    }
    searchLoadingTimeoutRef.current = setTimeout(() => {
      setNewLaunchTypeSegment(nextSegment);
      setFadeKey((prev) => prev + 1);
      setNewLaunchSwitchLoading(false);
    }, 400);
  };

  /**
   * Apply project search.
   * @param {string} raw - typed or spoken query
   * @param {{ exactSelection?: boolean }} [options] - true when user picked a suggestion (full name)
   */
  const applySearchFromProjectName = useCallback(
    (raw, options = {}) => {
      const trimmed = String(raw || "").trim();
      if (!trimmed) return;
      const pool = Array.isArray(allProjectsList) ? allProjectsList : [];
      const exactSelection = options.exactSelection === true;
      const trimmedNorm = normalizeText(trimmed);

      let item = null;
      if (exactSelection) {
        item =
          pool.find(
            (p) => normalizeText(p?.projectName) === trimmedNorm,
          ) || findBestProjectBySearch(trimmed, pool);
      } else {
        item = pool.find((p) => normalizeText(p?.projectName) === trimmedNorm);
        if (!item) {
          const matches = pool.filter((p) =>
            projectNameMatchesSearch(p?.projectName, trimmed),
          );
          if (matches.length === 1) item = matches[0];
        }
      }

      if (item) {
        const { quickTab, segment } = deriveQuickFilterAndSegmentFromProject(item);
        setQuickProjectFilter(quickTab);
        setFilters(EMPTY_PROJECT_FILTERS);
        setDraftFilters(EMPTY_PROJECT_FILTERS);
        setNewLaunchTypeSegment(segment);
        startDesktopFilterTransition();
        if (typeof window !== "undefined" && window.innerWidth < 992) {
          window.scrollTo({ top: 260, behavior: "smooth" });
        }
      }

      const displayName =
        exactSelection && item
          ? String(item.projectName || "").trim()
          : trimmed;
      setProjectSearchTerm(displayName);
      setAppliedProjectSearchTerm(trimmed);
      setCurrentPage(1);
      setFadeKey((prev) => prev + 1);
      setShowSearchSuggestions(false);
    },
    [allProjectsList, startDesktopFilterTransition]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setIsVoiceSupported(false);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const text = event.results[i][0]?.transcript?.trim() || "";
        if (!text) continue;
        if (event.results[i].isFinal) {
          const nextFinal = `${voiceFinalTextRef.current} ${text}`.trim();
          voiceFinalTextRef.current = nextFinal;
        } else {
          interimText = `${interimText} ${text}`.trim();
        }
      }
      const mergedText = `${voiceFinalTextRef.current} ${interimText}`.trim();
      setVoiceLiveText(mergedText);
    };

    recognition.onstart = () => setIsVoiceListening(true);
    recognition.onend = () => {
      setIsVoiceListening(false);
      setShowVoiceOverlay(false);
      const spoken = (voiceFinalTextRef.current || voiceLiveText).trim();
      if (voiceShouldApplyOnEndRef.current && spoken) {
        applySearchFromProjectName(spoken);
      }
      voiceFinalTextRef.current = "";
      setVoiceLiveText("");
      voiceShouldApplyOnEndRef.current = true;
    };
    recognition.onerror = () => {
      setIsVoiceListening(false);
      setShowVoiceOverlay(false);
      voiceFinalTextRef.current = "";
      setVoiceLiveText("");
      voiceShouldApplyOnEndRef.current = true;
    };

    speechRecognitionRef.current = recognition;
    setIsVoiceSupported(true);
  }, [applySearchFromProjectName, voiceLiveText]);

  const projectsAfterQuickAndFilters = useMemo(() => {
    const sourceProjects = Array.isArray(allProjectsList) ? allProjectsList : [];
    const quickFilterNorm = normalizeText(quickProjectFilter);

    return sourceProjects.filter((item) => {
      const itemType = normalizeText(item?.propertyTypeName);
      const itemCity = normalizeText(item?.cityName);
      const itemAddress = normalizeText(item?.projectAddress);
      const itemStatus = normalizeText(item?.projectStatusName);
      const itemBuilder = normalizeText(item?.builderName);
      const itemConfig = normalizeText(item?.projectConfiguration);
      const itemName = normalizeText(item?.projectName);
      const searchText = normalizeText(appliedProjectSearchTerm);

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

      if (
        searchText &&
        !projectNameMatchesSearch(item?.projectName, searchText)
      ) {
        return false;
      }

      return true;
    });
  }, [allProjectsList, quickProjectFilter, filters, appliedProjectSearchTerm]);

  const searchSuggestions = useMemo(() => {
    const query = normalizeText(searchSuggestionsQuery);
    if (!query) return [];
    const pool = Array.isArray(allProjectsList) ? allProjectsList : [];
    const ranked = [];
    for (const item of pool) {
      const name = String(item?.projectName || "").trim();
      if (!name) continue;
      const score = scoreProjectSearchMatch(name, query);
      if (score < 0) continue;
      ranked.push({ name, score });
    }
    ranked.sort((a, b) => a.score - b.score || a.name.localeCompare(b.name));
    const seen = new Set();
    const results = [];
    for (const { name } of ranked) {
      const key = normalizeText(name);
      if (seen.has(key)) continue;
      seen.add(key);
      results.push(name);
      if (results.length >= 8) break;
    }
    return results;
  }, [searchSuggestionsQuery, allProjectsList]);

  const displayProjects = useMemo(() => {
    if (normalizeText(quickProjectFilter) !== "new launched") {
      return projectsAfterQuickAndFilters;
    }
    return projectsAfterQuickAndFilters.filter((item) => {
      const t = normalizeText(item?.propertyTypeName);
      if (newLaunchTypeSegment === "residential") return t.includes("residential");
      if (newLaunchTypeSegment === "commercial") return t.includes("commercial");
      return true;
    });
  }, [projectsAfterQuickAndFilters, quickProjectFilter, newLaunchTypeSegment]);

  const newLaunchTypeCounts = useMemo(() => {
    if (normalizeText(quickProjectFilter) !== "new launched") return null;
    let residential = 0;
    let commercial = 0;
    let other = 0;
    for (const item of projectsAfterQuickAndFilters) {
      const t = normalizeText(item?.propertyTypeName);
      if (t.includes("commercial")) commercial += 1;
      else if (t.includes("residential")) residential += 1;
      else other += 1;
    }
    return { residential, commercial, other };
  }, [projectsAfterQuickAndFilters, quickProjectFilter]);

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some(Boolean),
    [filters]
  );
  const activeFiltersCount = useMemo(
    () => Object.values(filters).filter(Boolean).length,
    [filters]
  );
  const hasQuickFilter = isActive !== "" && isActive !== "All";
  const sectionHeading = useMemo(() => {
    const normalized = normalizeText(isActive);
    if (normalized === "commercial") return "Browse commercial projects";
    if (normalized === "residential") return "Browse residential projects";
    if (normalized === "new launched" || normalized === "new launch") {
      const base = "Browse new launch projects";
      if (newLaunchTypeSegment === "residential") return `${base} (Residential)`;
      if (newLaunchTypeSegment === "commercial") return `${base} (Commercial)`;
      return base;
    }
    return "Browse all projects";
  }, [isActive, newLaunchTypeSegment]);
  const totalPages = Math.max(1, Math.ceil(displayProjects.length / PROJECTS_PER_PAGE));
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * PROJECTS_PER_PAGE;
    return displayProjects.slice(start, start + PROJECTS_PER_PAGE);
  }, [displayProjects, currentPage, PROJECTS_PER_PAGE]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="projects-page-wrapper">
      <CommonHeaderBanner
        headerText={pageName}
        image={"realestate-bg.jpg"}
        firstPage={"projects"}
      />
      <div className="container py-4">
        {showVoiceOverlay && (
          <div className="projects-voice-overlay" role="dialog" aria-modal="true">
            <button
              type="button"
              className="projects-voice-overlay-close"
              onClick={handleCloseVoiceOverlay}
              aria-label="Close voice input"
            >
              <FontAwesomeIcon icon={faTimesCircle} />
            </button>
            <div className="projects-voice-overlay-content">
              <div className={`projects-voice-overlay-mic ${isVoiceListening ? "listening" : ""}`}>
                <FontAwesomeIcon icon={faMicrophone} />
              </div>
              <p className="projects-voice-overlay-title">
                {isVoiceListening ? "Listening..." : "Processing..."}
              </p>
              <p className="projects-voice-overlay-text">
                {voiceLiveText || "Speak project name clearly"}
              </p>
            </div>
          </div>
        )}
        {/* Page Header - minimal; project count in pills row for all category tabs */}
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

              <div className="projects-mobile-top-search" ref={searchWrapperRef}>
                <FontAwesomeIcon icon={faSearch} className="projects-top-search-icon" />
                <input
                  type="text"
                  value={projectSearchTerm}
                  onChange={(e) => {
                    setProjectSearchTerm(e.target.value);
                    setAppliedProjectSearchTerm("");
                    setShowSearchSuggestions(Boolean(e.target.value.trim()));
                  }}
                  onFocus={() =>
                    setShowSearchSuggestions(Boolean(projectSearchTerm.trim()))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applySearchFromProjectName(projectSearchTerm);
                    }
                  }}
                  className="projects-top-search-input"
                  placeholder={`Search "${rotatingSearchPlaceholders[searchPlaceholderIndex]}"`}
                />
                {isVoiceSupported && (
                  <button
                    type="button"
                    className={`projects-voice-btn ${isVoiceListening ? "is-listening" : ""}`}
                    onClick={handleVoiceSearch}
                    aria-label="Start voice search"
                  >
                    <FontAwesomeIcon icon={faMicrophone} />
                  </button>
                )}
                {showSearchSuggestions && (
                  <div className="projects-search-suggestions-dropdown">
                    {searchSuggestionsLoading ? (
                      <div className="projects-search-suggestion-loading" aria-live="polite">
                        <span className="projects-inline-loader" />
                      </div>
                    ) : searchSuggestions.length > 0 ? (
                      searchSuggestions.map((suggestion) => (
                        <button
                          key={`mobile-${suggestion}`}
                          type="button"
                          className="projects-search-suggestion-item"
                          onClick={() =>
                            applySearchFromProjectName(suggestion, {
                              exactSelection: true,
                            })
                          }
                        >
                          {suggestion}
                        </button>
                      ))
                    ) : (
                      <div className="projects-search-suggestion-empty">No matching projects found</div>
                    )}
                  </div>
                )}
              </div>

              {isActive === "New Launched" && newLaunchTypeCounts && (
                <div
                  className="projects-mobile-newlaunch-stats"
                  aria-label="New launch projects by type"
                >
                  <div className="projects-newlaunch-mini-buttons projects-newlaunch-mini-buttons--mobile">
                    <button
                      type="button"
                      className={`projects-newlaunch-mini-btn projects-newlaunch-mini-btn--residential ${newLaunchTypeSegment === "residential" ? "is-active" : ""}`}
                      onClick={() => selectNewLaunchSegment("residential")}
                      aria-pressed={newLaunchTypeSegment === "residential"}
                    >
                      Residential <span>{newLaunchTypeCounts.residential}</span>
                    </button>
                    <button
                      type="button"
                      className={`projects-newlaunch-mini-btn projects-newlaunch-mini-btn--commercial ${newLaunchTypeSegment === "commercial" ? "is-active" : ""}`}
                      onClick={() => selectNewLaunchSegment("commercial")}
                      aria-pressed={newLaunchTypeSegment === "commercial"}
                    >
                      Commercial <span>{newLaunchTypeCounts.commercial}</span>
                    </button>
                  </div>
                  {newLaunchTypeCounts.other > 0 && (
                    <div className="projects-newlaunch-mini-other">
                      Other <strong>{newLaunchTypeCounts.other}</strong>
                    </div>
                  )}
                  <p className="projects-newlaunch-total-foot text-muted mb-0">
                    {displayProjects.length}{" "}
                    {displayProjects.length === 1 ? "project" : "projects"} total
                  </p>
                </div>
              )}

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
                  {/* Unified top filter bar */}
                  <div className="projects-unified-filterbar">
                    <div
                      className={`projects-unified-filterbar-top ${isActive === "New Launched" ? "projects-unified-filterbar-top--newlaunch" : ""}`}
                    >
                      <span className="projects-count-in-pills text-muted">
                        Showing <strong>{displayProjects.length}</strong>{" "}
                        {isActive === "New Launched"
                          ? `new launch ${displayProjects.length === 1 ? "project" : "projects"}`
                          : displayProjects.length === 1
                            ? "project"
                            : "projects"}
                      </span>
                      {isActive === "New Launched" && newLaunchTypeCounts && (
                        <div className="projects-newlaunch-mini-buttons">
                          <button
                            type="button"
                            className={`projects-newlaunch-mini-btn projects-newlaunch-mini-btn--residential ${newLaunchTypeSegment === "residential" ? "is-active" : ""}`}
                            onClick={() => selectNewLaunchSegment("residential")}
                          >
                            Residential <span>{newLaunchTypeCounts.residential}</span>
                          </button>
                          <button
                            type="button"
                            className={`projects-newlaunch-mini-btn projects-newlaunch-mini-btn--commercial ${newLaunchTypeSegment === "commercial" ? "is-active" : ""}`}
                            onClick={() => selectNewLaunchSegment("commercial")}
                          >
                            Commercial <span>{newLaunchTypeCounts.commercial}</span>
                          </button>
                        </div>
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
                    </div>

                    <div className="projects-unified-filterbar-bottom">
                      <button
                        className={`btn btn-outline-primary btn-sm projects-inline-filter-toggle ${showFilters ? "active" : ""}`}
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        <FontAwesomeIcon icon={faSlidersH} className="me-2" />
                        {showFilters ? "Hide Filters" : "Show Filters"}
                      </button>

                      <div className="projects-top-search projects-top-search-centered" ref={searchWrapperRef}>
                        <FontAwesomeIcon icon={faSearch} className="projects-top-search-icon" />
                        <input
                          type="text"
                          value={projectSearchTerm}
                          onChange={(e) => {
                            setProjectSearchTerm(e.target.value);
                            setAppliedProjectSearchTerm("");
                            setShowSearchSuggestions(Boolean(e.target.value.trim()));
                          }}
                          onFocus={() =>
                            setShowSearchSuggestions(Boolean(projectSearchTerm.trim()))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              applySearchFromProjectName(projectSearchTerm);
                            }
                          }}
                          className="projects-top-search-input"
                          placeholder={`Search "${rotatingSearchPlaceholders[searchPlaceholderIndex]}"`}
                        />
                        {isVoiceSupported && (
                          <button
                            type="button"
                            className={`projects-voice-btn ${isVoiceListening ? "is-listening" : ""}`}
                            onClick={handleVoiceSearch}
                            aria-label="Start voice search"
                          >
                            <FontAwesomeIcon icon={faMicrophone} />
                          </button>
                        )}
                        {showSearchSuggestions && (
                          <div className="projects-search-suggestions-dropdown">
                            {searchSuggestionsLoading ? (
                              <div className="projects-search-suggestion-loading" aria-live="polite">
                                <span className="projects-inline-loader" />
                              </div>
                            ) : searchSuggestions.length > 0 ? (
                              searchSuggestions.map((suggestion) => (
                                <button
                                  key={suggestion}
                                  type="button"
                                  className="projects-search-suggestion-item"
                                  onClick={() =>
                            applySearchFromProjectName(suggestion, {
                              exactSelection: true,
                            })
                          }
                                >
                                  {suggestion}
                                </button>
                              ))
                            ) : (
                              <div className="projects-search-suggestion-empty">No matching projects found</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

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
                        options: PROJECT_BHK_FILTER_OPTIONS,
                      })}
                    </Form.Group>
                    <div className="projects-filter-actions-inside">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={clearFilters}
                      >
                        <FontAwesomeIcon icon={faTimes} className="me-2" />
                        Clear
                      </button>
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => {
                          applySelectedFilters(false);
                          const q = projectSearchTerm.trim();
                          if (q) applySearchFromProjectName(q);
                          else applySearchFilter();
                        }}
                      >
                        Search
                      </button>
                    </div>

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
            <div
              ref={projectsResultsRef}
              key={fadeKey}
              className="col-12 projects-content-wrapper"
            >
            <h2 className="projects-page-section-heading mb-3 mb-md-4">
              {sectionHeading}
            </h2>
            {(loading ||
              listLoading ||
              newLaunchSwitchLoading ||
              desktopTabTransitionLoading) ? (
              <div className="projects-loading-state">
                <LoadingSpinner show={true} height="auto" />
                <p className="text-muted mt-3">
                  {(newLaunchSwitchLoading || desktopTabTransitionLoading) &&
                  !loading &&
                  !listLoading
                    ? "Updating list..."
                    : "Loading projects..."}
                </p>
              </div>
            ) : (displayProjects.length >= 1) ? (
              <>
                <div className="projects-grid-layout">
                  {paginatedProjects.map((item, index) => (
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
                {displayProjects.length > PROJECTS_PER_PAGE && (
                  <ProjectListingPaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={displayProjects.length}
                    pageSize={PROJECTS_PER_PAGE}
                    scrollAfterPageChange={false}
                    onPageChange={(p) => {
                      setCurrentPage(p);
                      scrollDesktopToProjectsGrid();
                    }}
                  />
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
                      options: PROJECT_BHK_FILTER_OPTIONS,
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
