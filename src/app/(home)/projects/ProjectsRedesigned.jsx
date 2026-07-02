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
import { cityNameMatchesFilter } from "@/app/_global_components/cityAliasUtils";
import { usePathname, useRouter } from "next/navigation";
import {
  PROJECT_BUDGET_OPTIONS,
  matchesBudgetRangeForProject,
  normalizeBudgetSelection,
} from "@/app/_global_components/projectFilterUtils";
import {
  findBestProjectBySearch,
  scoreProjectSearchMatch,
} from "@/app/_global_components/projectSearchUtils";
import {
  extractTypesFromProjectConfiguration,
  projectMatchesListingHubCategory,
} from "@/lib/listingFloorValidation";

import ProjectCard from "./components/ProjectCard";
import MobileFilterDrawer from "./components/MobileFilterDrawer";
import "./projects-redesign.css";

const EMPTY_FILTERS = {
  propertyType: "",
  city: "",
  budget: "",
  projectStatus: "",
  bhkType: "",
  configType: "",
};

const RESIDENTIAL_CONFIG_OPTIONS = [
  "1 RK",
  "1 BHK",
  "2 BHK",
  "3 BHK",
  "4 BHK",
  "5 BHK",
  "5+ BHK",
  "Villa",
  "Plots",
];
const DEFAULT_COMMERCIAL_FILTER_OPTIONS = [
  { key: "office", label: "Office" },
  { key: "shops", label: "Shops" },
  { key: "showroom", label: "Showroom" },
  { key: "food-court", label: "Food Court" },
  { key: "kiosk", label: "Kiosk" },
  { key: "restaurant", label: "Restaurant" },
  { key: "sco-plots", label: "SCO Plots" },
];
const PROJECTS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_SUGGESTION_LIMIT = 8;

const PROPERTY_TYPE_TAG_LABELS = {
  residential: "Residential",
  commercial: "Commercial",
};

const SORT_TAG_LABELS = {
  relevance: "Relevance",
  "price-low": "Price: Low to High",
  "price-high": "Price: High to Low",
  newest: "Newest First",
};

function normalizeText(value) {
  return String(value || "").toLowerCase().trim().replace(/\s+/g, " ");
}

function getProjectKey(project) {
  if (project?.id != null) return `id:${project.id}`;
  const slug = String(project?.slugURL || project?.slug || "").trim();
  if (slug) return `slug:${slug}`;
  return `name:${String(project?.projectName || "").trim()}`;
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

export default function ProjectsRedesigned({
  initialCity = "",
  initialActiveTab = "all",
  initialQuickFilter = "",
  initialBhkType = "",
  initialConfigType = "",
  breadcrumbLabel = "Projects in India",
  breadcrumbParent = null,
  pageHeading = "",
  pageIntro = "",
  showBreadcrumb = true,
  hubCategory = "",
} = {}) {
  const {
    cityList: cities,
    projectTypes: propertyTypes,
    projectStatuses,
    projectList: allProjectsList,
    loading: siteDataLoading,
    queryFilters,
    clearQueryFilters,
  } = useSiteData();

  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [filters, setFilters] = useState(() => ({
    ...EMPTY_FILTERS,
    city: initialCity || "",
    bhkType: initialBhkType || "",
    configType: initialConfigType || "",
  }));
  const [sortBy, setSortBy] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [selectedSearchProjectKey, setSelectedSearchProjectKey] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState(initialQuickFilter);
  const [isSortPending, startSortTransition] = useTransition();
  const [isListingsPinPending, startListingsPinTransition] = useTransition();
  const [sortLoaderVisible, setSortLoaderVisible] = useState(false);
  const [listingsLoaderVisible, setListingsLoaderVisible] = useState(false);
  const sortLoaderHideAtRef = useRef(0);
  const sortLoaderTimerRef = useRef(null);
  const listingsLoaderHideAtRef = useRef(0);
  const listingsLoaderTimerRef = useRef(null);
  const SORT_LOADER_MIN_MS = 2300;
  const LISTINGS_LOADER_MIN_MS = 1200;

  const showOverlayLoader = useCallback(() => {
    const now = Date.now();
    sortLoaderHideAtRef.current = Math.max(sortLoaderHideAtRef.current, now + SORT_LOADER_MIN_MS);
    setSortLoaderVisible(true);
    if (sortLoaderTimerRef.current) {
      window.clearTimeout(sortLoaderTimerRef.current);
      sortLoaderTimerRef.current = null;
    }
  }, []);

  const showListingsLoader = useCallback(() => {
    const now = Date.now();
    listingsLoaderHideAtRef.current = Math.max(
      listingsLoaderHideAtRef.current,
      now + LISTINGS_LOADER_MIN_MS,
    );
    setListingsLoaderVisible(true);
    if (listingsLoaderTimerRef.current) {
      window.clearTimeout(listingsLoaderTimerRef.current);
      listingsLoaderTimerRef.current = null;
    }
  }, []);

  const [relatedExpanded, setRelatedExpanded] = useState(false);
  const searchWrapRef = useRef(null);

  const router = useRouter();
  const pathname = usePathname();

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
    const willToggleTo = filters[key] === value ? "" : value;

    // Listing pages: selecting BHK or Commercial Type should show loader and sync URL
    if (isListingPage && (key === "bhkType" || key === "configType")) {
      showOverlayLoader();
      if (key === "bhkType") {
        setFilters((prev) => ({ ...prev, bhkType: willToggleTo, configType: "" }));
      } else {
        setFilters((prev) => ({ ...prev, configType: willToggleTo, bhkType: "" }));
      }
      if (key === "bhkType") {
        pushHubTypeToPath({ nextBhkType: willToggleTo, nextConfigType: "" });
      } else {
        pushHubTypeToPath({ nextBhkType: "", nextConfigType: willToggleTo });
      }
      setCurrentPage(1);
      return;
    }

    if (key === "bhkType") {
      setFilters((prev) => ({ ...prev, bhkType: willToggleTo, configType: "" }));
      setCurrentPage(1);
      return;
    }

    if (key === "configType") {
      setFilters((prev) => ({ ...prev, configType: willToggleTo, bhkType: "" }));
      setCurrentPage(1);
      return;
    }

    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? "" : value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setActiveTab("all");
    setSortBy("relevance");
    setSearchInput("");
    setDebouncedSearch("");
    setSelectedSearchProjectKey("");
    setSearchDropdownOpen(false);
    setActiveQuickFilter("");
    setCurrentPage(1);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!searchWrapRef.current?.contains(e.target)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const QUICK_FILTERS_ALL = useMemo(
    () => [
      { key: "ready", label: "Ready to Move" },
      { key: "new", label: "New Launch" },
      { key: "under-construction", label: "Under Construction" },
      { key: "ultra-luxury", label: "Ultra Luxury" },
    ],
    [],
  );

  const matchesQuickFilter = useCallback((statusNorm, key) => {
    if (!key) return true;
    if (key === "ready") return statusNorm.includes("ready");
    if (key === "new") {
      return statusNorm.includes("new launch") || statusNorm.includes("new launched");
    }
    if (key === "under-construction") return statusNorm.includes("under construction");
    if (key === "ultra-luxury") return statusNorm.includes("ultra luxury");
    return true;
  }, []);

  const hubUrlCategorySegment = useMemo(() => {
    const key = String(hubCategory || "").toLowerCase().trim();
    if (key === "newprojects" || key === "new-projects") return "new-projects";
    if (key === "commercial") return "commercial";
    if (key === "offices-and-shop") return "offices-and-shop";
    if (key === "flats") return "flats";
    if (key === "apartments") return "apartments";
    return "";
  }, [hubCategory]);

  const isHubPage = Boolean(hubUrlCategorySegment);
  const isListingPage = isHubPage || Boolean(pathname && pathname.includes("-in-"));

  const relatedCityLabel = useMemo(() => {
    const c = String(filters.city || initialCity || "").trim();
    if (!c) return "";
    return c.replace(/\b\w/g, (ch) => ch.toUpperCase());
  }, [filters.city, initialCity]);

  const isCommercialContext = useMemo(() => {
    const hub = String(hubUrlCategorySegment || "");
    if (hub === "commercial" || hub === "offices-and-shop") return true;
    if (filters.configType) return true;
    return activeTab === "commercial";
  }, [activeTab, hubUrlCategorySegment, filters.configType]);

  // If user switches to Commercial, clear Bedroom filter (not applicable)
  useEffect(() => {
    if (!isCommercialContext) return;
    setFilters((prev) => (prev.bhkType ? { ...prev, bhkType: "" } : prev));
  }, [isCommercialContext]);

  const matchesListingContext = useCallback(
    (item) => {
      const typeNorm = normalizeText(item?.propertyTypeName);
      const statusNorm = normalizeText(item?.projectStatusName);
      const hubKey = String(hubCategory || "").trim();

      if (hubKey && !projectMatchesListingHubCategory(item, hubKey)) return false;
      if (activeTab === "residential" && !typeNorm.includes("residential")) return false;
      if (activeTab === "commercial" && !typeNorm.includes("commercial")) return false;
      if (filters.city && !cityNameMatchesFilter(filters.city, item)) return false;
      if (filters.budget && !matchesBudgetRangeForProject(item, filters.budget)) return false;
      if (filters.projectStatus && !statusNorm.includes(normalizeText(filters.projectStatus))) {
        return false;
      }
      return true;
    },
    [activeTab, filters, hubCategory],
  );

  const baseProjectsBeforeQuickFilter = useMemo(() => {
    const source = Array.isArray(allProjectsList) ? allProjectsList : [];
    return source.filter((item) => matchesListingContext(item));
  }, [allProjectsList, matchesListingContext]);

  const projectsAfterQuickFilter = useMemo(() => {
    if (!activeQuickFilter) return baseProjectsBeforeQuickFilter;
    return baseProjectsBeforeQuickFilter.filter((item) => {
      const statusNorm = normalizeText(item?.projectStatusName);
      return matchesQuickFilter(statusNorm, activeQuickFilter);
    });
  }, [activeQuickFilter, baseProjectsBeforeQuickFilter, matchesQuickFilter]);

  const searchSuggestionPool = useMemo(() => {
    if (!activeQuickFilter) return baseProjectsBeforeQuickFilter;
    return baseProjectsBeforeQuickFilter.filter((item) => {
      const statusNorm = normalizeText(item?.projectStatusName);
      return matchesQuickFilter(statusNorm, activeQuickFilter);
    });
  }, [activeQuickFilter, baseProjectsBeforeQuickFilter, matchesQuickFilter]);

  const searchSuggestions = useMemo(() => {
    const q = debouncedSearch.trim();
    if (q.length < 2) return [];

    const ranked = [];
    for (const item of searchSuggestionPool) {
      const name = String(item?.projectName || "").trim();
      if (!name) continue;
      const score = scoreProjectSearchMatch(name, q);
      if (score < 0) continue;
      ranked.push({ item, score });
    }

    ranked.sort(
      (a, b) =>
        a.score - b.score ||
        String(a.item?.projectName || "").localeCompare(String(b.item?.projectName || "")),
    );

    return ranked.slice(0, SEARCH_SUGGESTION_LIMIT).map(({ item }) => item);
  }, [debouncedSearch, searchSuggestionPool]);

  const pinSearchProject = useCallback(
    (project) => {
      if (!project) return;
      showListingsLoader();
      startListingsPinTransition(() => {
        const name = String(project?.projectName || "").trim();
        setSelectedSearchProjectKey(getProjectKey(project));
        if (name) {
          setSearchInput(name);
          setDebouncedSearch(name);
        }
        setSearchDropdownOpen(false);
        setCurrentPage(1);
      });
    },
    [showListingsLoader],
  );

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchInput.trim();
    setDebouncedSearch(q);
    if (!q) {
      setSelectedSearchProjectKey("");
      setSearchDropdownOpen(false);
      return;
    }

    const match =
      searchSuggestions[0] || findBestProjectBySearch(q, searchSuggestionPool);
    if (match) {
      pinSearchProject(match);
      return;
    }

    if (q.length >= 2) setSearchDropdownOpen(true);
  };

  const matchesBhkFilter = useCallback((projectConfiguration, selected) => {
    const wanted = String(selected || "").trim();
    if (!wanted) return true;
    const config = String(projectConfiguration || "");
    if (!config) return false;

    // 1 RK / Studio
    if (/\brk\b/i.test(wanted)) {
      return /\brk\b/i.test(config) || /\bstudio\b/i.test(config);
    }

    if (/^villa$/i.test(wanted)) {
      return /\bvilla\b/i.test(config);
    }

    if (/^plots?$/i.test(wanted)) {
      return /\bplot(s)?\b/i.test(config);
    }

    const bhk = wanted.match(/^(\d+)\s*BHK/i);
    if (bhk?.[1]) {
      const types = extractTypesFromProjectConfiguration(config);
      return types.includes(`${bhk[1]} bhk`);
    }

    if (/^5\+\s*BHK/i.test(wanted)) {
      const types = extractTypesFromProjectConfiguration(config);
      return types.some((t) => {
        const m = String(t || "").match(/^(\d+)\s+bhk$/i);
        return Number(m?.[1] || 0) >= 5;
      });
    }

    // Fallback: substring match for custom configuration values
    return normalizeText(config).includes(normalizeText(wanted));
  }, []);

  const normalizeConfigType = useCallback((rawType) => {
    const t = String(rawType || "").toLowerCase().trim().replace(/\s+/g, " ");
    if (!t) return null;

    if (t === "shop" || t === "shops") return { key: "shops", label: "Shops" };
    if (t === "office" || t === "offices") return { key: "office", label: "Office" };
    if (t === "kiosk" || t === "kiosks") return { key: "kiosk", label: "Kiosk" };
    if (t === "food court" || t === "food courts") return { key: "food-court", label: "Food Court" };
    if (t === "restaurant" || t === "restaurants") return { key: "restaurant", label: "Restaurant" };
    if (t === "showroom" || t === "showrooms") return { key: "showroom", label: "Showroom" };
    if (t === "sco plots" || t === "sco plot") return { key: "sco-plots", label: "SCO Plots" };

    return null;
  }, []);

  const matchesConfigTypeFilter = useCallback((projectConfiguration, selectedKey) => {
    const wanted = String(selectedKey || "").trim();
    if (!wanted) return true;
    const config = String(projectConfiguration || "");
    if (!config) return false;

    const types = extractTypesFromProjectConfiguration(config);
    const keys = new Set();
    for (const type of types) {
      const norm = normalizeConfigType(type);
      if (norm?.key) keys.add(norm.key);
    }
    return keys.has(wanted);
  }, [normalizeConfigType]);

  const visibleQuickFilters = useMemo(() => {
    // Only hide “empty” quick filters on internal listing pages.
    if (!isListingPage) return QUICK_FILTERS_ALL;

    // For internal pages, the quick-filter bar should only reflect the actually-visible
    // dataset AFTER configType/BHK (but before the quick-filter itself).
    const sourceForCounts = baseProjectsBeforeQuickFilter.filter((item) => {
      if (!matchesBhkFilter(item?.projectConfiguration, filters.bhkType)) return false;
      if (!matchesConfigTypeFilter(item?.projectConfiguration, filters.configType)) return false;
      return true;
    });

    const counts = new Map();
    for (const qf of QUICK_FILTERS_ALL) counts.set(qf.key, 0);

    for (const item of sourceForCounts) {
      const statusNorm = normalizeText(item?.projectStatusName);
      for (const qf of QUICK_FILTERS_ALL) {
        if (matchesQuickFilter(statusNorm, qf.key)) {
          counts.set(qf.key, (counts.get(qf.key) || 0) + 1);
        }
      }
    }

    return QUICK_FILTERS_ALL.filter((qf) => (counts.get(qf.key) || 0) > 0);
  }, [
    QUICK_FILTERS_ALL,
    baseProjectsBeforeQuickFilter,
    filters.bhkType,
    filters.configType,
    isListingPage,
    matchesBhkFilter,
    matchesConfigTypeFilter,
    matchesQuickFilter,
  ]);

  useEffect(() => {
    if (!isListingPage) return;
    if (!activeQuickFilter) return;
    const stillVisible = visibleQuickFilters.some((qf) => qf.key === activeQuickFilter);
    if (!stillVisible) setActiveQuickFilter("");
  }, [activeQuickFilter, isListingPage, visibleQuickFilters]);

  const availableBhkOptions = useMemo(() => {
    const set = new Set();
    let hasRk = false;
    let hasVilla = false;
    let hasPlots = false;

    for (const item of projectsAfterQuickFilter) {
      const config = String(item?.projectConfiguration || "");
      if (!config) continue;
      if (/\brk\b/i.test(config) || /\bstudio\b/i.test(config)) hasRk = true;
      if (/\bvilla\b/i.test(config)) hasVilla = true;
      if (/\bplot(s)?\b/i.test(config)) hasPlots = true;
      const types = extractTypesFromProjectConfiguration(config);
      for (const t of types) {
        const m = String(t || "").match(/^(\d+)\s+bhk$/i);
        if (m?.[1]) set.add(Number(m[1]));
      }
    }

    const list = Array.from(set).sort((a, b) => a - b).map((n) => `${n} BHK`);
    const withRk = hasRk ? ["1 RK", ...list] : list;
    if (hasVilla) withRk.push("Villa");
    if (hasPlots) withRk.push("Plots");
    // Extra safety: no duplicates
    return Array.from(new Set(withRk));
  }, [projectsAfterQuickFilter]);

  const availableConfigTypeOptions = useMemo(() => {
    const map = new Map();
    for (const item of projectsAfterQuickFilter) {
      const config = String(item?.projectConfiguration || "");
      if (!config) continue;
      const types = extractTypesFromProjectConfiguration(config);
      for (const t of types) {
        const norm = normalizeConfigType(t);
        if (norm?.key && !map.has(norm.key)) {
          map.set(norm.key, norm);
        }
      }
    }
    const dynamic = Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
    if (dynamic.length > 0) return dynamic;
    return DEFAULT_COMMERCIAL_FILTER_OPTIONS;
  }, [normalizeConfigType, projectsAfterQuickFilter]);

  const configurationFilterOptions = useMemo(() => {
    const residential = (isHubPage ? availableBhkOptions : RESIDENTIAL_CONFIG_OPTIONS).map(
      (value) => ({
        kind: "bhk",
        value,
        label: value,
      }),
    );

    const commercialSource = isHubPage
      ? availableConfigTypeOptions
      : DEFAULT_COMMERCIAL_FILTER_OPTIONS;

    const commercial = commercialSource.map((opt) => ({
      kind: "config",
      value: opt.key,
      label: opt.label,
    }));

    return [...residential, ...commercial];
  }, [availableBhkOptions, availableConfigTypeOptions, isHubPage]);

  const citySlugForUrl = useMemo(() => {
    const c = String(filters.city || initialCity || "").trim();
    return c ? c.replace(/\s+/g, "-").toLowerCase() : "";
  }, [filters.city, initialCity]);

  const relatedGroups = useMemo(() => {
    if (!isListingPage || !citySlugForUrl || !relatedCityLabel) return [];

    const cap = relatedExpanded ? 14 : 6;
    const dedupe = (arr) => Array.from(new Map(arr.map((x) => [x.href, x])).values());

    const buildBhkHref = (bhkLabel) => {
      const m = String(bhkLabel).match(/^(\d+)\s*BHK/i);
      const n = m?.[1];
      if (!n) return null;
      const floorSlug = `${n}-bhk`;
      return hubUrlCategorySegment && hubUrlCategorySegment !== "flats"
        ? `/${floorSlug}-${hubUrlCategorySegment}-in-${citySlugForUrl}`
        : `/${floorSlug}-in-${citySlugForUrl}`;
    };

    const otherBhkLinks = (isCommercialContext ? [] : availableBhkOptions)
      .filter((b) => b && b !== filters.bhkType)
      .map((b) => {
        const href = buildBhkHref(b);
        return href ? { href, label: `${b} in ${relatedCityLabel}` } : null;
      })
      .filter(Boolean)
      .slice(0, cap);

    const otherCommercialTypeLinks = availableConfigTypeOptions
      .filter((o) => o?.key && o.key !== filters.configType)
      .map((o) => ({ href: `/${o.key}-in-${citySlugForUrl}`, label: `${o.label} in ${relatedCityLabel}` }))
      .slice(0, cap);

    const exploreLinks = dedupe([
      { href: `/flats-in-${citySlugForUrl}`, label: `Flats in ${relatedCityLabel}` },
      { href: `/apartments-in-${citySlugForUrl}`, label: `Apartments in ${relatedCityLabel}` },
      { href: `/new-projects-in-${citySlugForUrl}`, label: `New Projects in ${relatedCityLabel}` },
      { href: `/commercial-property-in-${citySlugForUrl}`, label: `Commercial Property in ${relatedCityLabel}` },
    ])
      .filter((l) => l.href !== pathname)
      .slice(0, cap);

    const groups = [];
    if (otherBhkLinks.length) groups.push({ title: `Other BHKs in ${relatedCityLabel}`, links: otherBhkLinks });
    if (otherCommercialTypeLinks.length) groups.push({ title: `Commercial options in ${relatedCityLabel}`, links: otherCommercialTypeLinks });
    if (exploreLinks.length) groups.push({ title: `Explore ${relatedCityLabel}`, links: exploreLinks });
    return groups;
  }, [
    availableBhkOptions,
    availableConfigTypeOptions,
    citySlugForUrl,
    filters.bhkType,
    filters.configType,
    hubUrlCategorySegment,
    isCommercialContext,
    isListingPage,
    pathname,
    relatedCityLabel,
    relatedExpanded,
  ]);

  const pushHubTypeToPath = useCallback(
    ({ nextBhkType = "", nextConfigType = "" }) => {
      if (!isListingPage || !citySlugForUrl) return;

      // config types (food-court, kiosk...) -> /food-court-in-delhi
      if (nextConfigType) {
        router.push(`/${nextConfigType}-in-${citySlugForUrl}`, { scroll: false });
        return;
      }

      // bhk -> /3-bhk-new-projects-in-delhi OR /3-bhk-in-delhi for flats
      if (nextBhkType) {
        // RK should navigate to /1-rk-studio-in-city (live behavior)
        if (/\brk\b/i.test(String(nextBhkType))) {
          router.push(`/1-rk-studio-in-${citySlugForUrl}`, { scroll: false });
          return;
        }
        const m = String(nextBhkType).match(/^(\d+)\s*BHK/i);
        const n = m?.[1];
        if (!n) return;
        const floorSlug = `${n}-bhk`;
        const path =
          hubUrlCategorySegment && hubUrlCategorySegment !== "flats"
            ? `/${floorSlug}-${hubUrlCategorySegment}-in-${citySlugForUrl}`
            : `/${floorSlug}-in-${citySlugForUrl}`;
        router.push(path, { scroll: false });
      }
    },
    [citySlugForUrl, hubUrlCategorySegment, isListingPage, router],
  );

  const filteredProjects = useMemo(() => {
    const list = projectsAfterQuickFilter.filter((item) => {
      if (!matchesBhkFilter(item?.projectConfiguration, filters.bhkType)) return false;
      if (!matchesConfigTypeFilter(item?.projectConfiguration, filters.configType)) return false;
      return true;
    });

    if (!selectedSearchProjectKey) return list;
    return list.filter((item) => getProjectKey(item) === selectedSearchProjectKey);
  }, [
    filters.bhkType,
    filters.configType,
    matchesBhkFilter,
    matchesConfigTypeFilter,
    projectsAfterQuickFilter,
    selectedSearchProjectKey,
  ]);

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

  const paginationItems = useMemo(() => {
    if (totalPages <= 1) return [];

    // Live-style: 1 ... (window around current) ... last
    const windowSize = 2;
    const pages = new Set([1, totalPages]);
    for (let p = currentPage - windowSize; p <= currentPage + windowSize; p += 1) {
      if (p >= 1 && p <= totalPages) pages.add(p);
    }

    // If close to start/end, show a few more
    for (let p = 2; p <= Math.min(4, totalPages - 1); p += 1) pages.add(p);
    for (let p = Math.max(totalPages - 3, 2); p <= totalPages - 1; p += 1) pages.add(p);

    const sorted = Array.from(pages).sort((a, b) => a - b);
    const items = [];
    let prev = 0;
    for (const p of sorted) {
      if (prev && p - prev > 1) items.push("ellipsis");
      items.push(p);
      prev = p;
    }
    return items;
  }, [currentPage, totalPages]);

  const appliedFilterTags = useMemo(() => {
    const tags = [];

    if (activeTab === "residential" || activeTab === "commercial") {
      tags.push({
        key: `property-type:${activeTab}`,
        label: PROPERTY_TYPE_TAG_LABELS[activeTab],
        kind: "propertyType",
      });
    }

    if (sortBy !== "relevance") {
      tags.push({
        key: `sort:${sortBy}`,
        label: SORT_TAG_LABELS[sortBy] || sortBy,
        kind: "sort",
      });
    }

    if (filters.budget) {
      tags.push({ key: "budget", label: filters.budget, kind: "budget" });
    }

    if (filters.bhkType) {
      tags.push({ key: "bhkType", label: filters.bhkType, kind: "bhkType" });
    }

    if (filters.configType) {
      const configLabel =
        configurationFilterOptions.find(
          (opt) => opt.kind === "config" && opt.value === filters.configType,
        )?.label || filters.configType;
      tags.push({ key: "configType", label: configLabel, kind: "configType" });
    }

    if (filters.city) {
      tags.push({ key: "city", label: filters.city, kind: "city" });
    }

    if (filters.propertyType) {
      tags.push({
        key: "sidebarPropertyType",
        label: filters.propertyType,
        kind: "sidebarPropertyType",
      });
    }

    if (filters.projectStatus) {
      tags.push({
        key: "projectStatus",
        label: filters.projectStatus,
        kind: "projectStatus",
      });
    }

    return tags;
  }, [activeTab, configurationFilterOptions, filters, sortBy]);

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;
  const isLoading = siteDataLoading;
  const hasAnyAppliedFilter =
    activeFiltersCount > 0 ||
    Boolean(activeQuickFilter) ||
    Boolean(selectedSearchProjectKey) ||
    activeTab !== "all" ||
    sortBy !== "relevance";

  const sortDropdownRef = useRef(null);

  const handleSuggestionSelect = useCallback(
    (project) => {
      pinSearchProject(project);
    },
    [pinSearchProject],
  );

  const formatSuggestionLocation = useCallback((project) => {
    const parts = [project?.projectLocality, project?.cityName || project?.city]
      .map((part) => String(part || "").trim())
      .filter(Boolean);
    return parts.join(", ") || "India";
  }, []);

  const applyPropertyTypeFromDropdown = useCallback((nextTab) => {
    setShowSortDropdown(false);
    showOverlayLoader();
    startSortTransition(() => {
      setActiveTab(nextTab);
      setCurrentPage(1);
    });
  }, [showOverlayLoader]);

  const applySortFromDropdown = useCallback((nextSort) => {
    setShowSortDropdown(false);
    showOverlayLoader();
    startSortTransition(() => {
      setSortBy(nextSort);
      setCurrentPage(1);
    });
  }, [showOverlayLoader]);

  const clearAppliedFilterTag = useCallback(
    (tag) => {
      switch (tag.kind) {
        case "propertyType":
          applyPropertyTypeFromDropdown("all");
          break;
        case "sort":
          applySortFromDropdown("relevance");
          break;
        case "budget":
          handleFilterChange("budget", filters.budget);
          break;
        case "bhkType":
          handleFilterChange("bhkType", filters.bhkType);
          break;
        case "configType":
          handleFilterChange("configType", filters.configType);
          break;
        case "city":
          handleFilterChange("city", filters.city);
          break;
        case "sidebarPropertyType":
          handleFilterChange("propertyType", filters.propertyType);
          break;
        case "projectStatus":
          handleFilterChange("projectStatus", filters.projectStatus);
          break;
        default:
          break;
      }
    },
    [applyPropertyTypeFromDropdown, applySortFromDropdown, filters, handleFilterChange],
  );

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

  // Keep listings-area loader visible for a minimum duration
  useEffect(() => {
    if (!listingsLoaderVisible) return undefined;

    if (isListingsPinPending) return undefined;

    const now = Date.now();
    const remaining = Math.max(0, listingsLoaderHideAtRef.current - now);

    if (listingsLoaderTimerRef.current) window.clearTimeout(listingsLoaderTimerRef.current);
    listingsLoaderTimerRef.current = window.setTimeout(() => {
      setListingsLoaderVisible(false);
      listingsLoaderTimerRef.current = null;
    }, remaining);

    return () => {
      if (listingsLoaderTimerRef.current) {
        window.clearTimeout(listingsLoaderTimerRef.current);
        listingsLoaderTimerRef.current = null;
      }
    };
  }, [isListingsPinPending, listingsLoaderVisible]);

  const showListingsAreaLoader = listingsLoaderVisible || isListingsPinPending;

  const displayHeading = pageHeading || breadcrumbLabel;
  const projectCountLabel = `${sortedProjects.length} ${
    sortedProjects.length === 1 ? "Project" : "Projects"
  }`;

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
        <div className="mpf-page-hero">
          {/* Breadcrumb & Title */}
          <div className="mpf-page-header">
            {showBreadcrumb && (
              <nav className="mpf-breadcrumb">
                <Link href="/">Home</Link>
                <span>›</span>
                {breadcrumbParent?.href && breadcrumbParent?.label ? (
                  <>
                    <Link href={breadcrumbParent.href}>{breadcrumbParent.label}</Link>
                    <span>›</span>
                  </>
                ) : null}
                <span>{breadcrumbLabel}</span>
              </nav>
            )}
            <h1
              className={`mpf-page-title${pageHeading ? " mpf-page-title--landing" : ""}`}
              id="mpf-page-heading"
            >
              {displayHeading || projectCountLabel}
            </h1>
            {displayHeading ? (
              <p className="mpf-page-count">{projectCountLabel}</p>
            ) : null}
            {pageIntro ? (
              <h2 className="mpf-page-intro">{pageIntro}</h2>
            ) : null}
          </div>

          <section className="mpf-page-top-search" aria-label="Search projects">
            <div className="mpf-page-top-search__wrap" ref={searchWrapRef}>
              <form className="mpf-page-top-search__form" onSubmit={handleSearch}>
                <FontAwesomeIcon icon={faSearch} className="mpf-page-top-search__icon" aria-hidden />
                <input
                  type="search"
                  placeholder='Search "Eldeco, M3M, Godrej..."'
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setSelectedSearchProjectKey("");
                    setSearchDropdownOpen(true);
                  }}
                  onFocus={() => {
                    if (searchInput.trim().length >= 2) setSearchDropdownOpen(true);
                  }}
                  className="mpf-page-top-search__input"
                  aria-label="Search projects by name"
                  aria-expanded={searchDropdownOpen}
                  aria-controls="mpf-project-search-dropdown"
                  aria-autocomplete="list"
                  autoComplete="off"
                />
                {searchInput ? (
                  <button
                    type="button"
                    className="mpf-page-top-search__clear"
                    onClick={() => {
                      setSearchInput("");
                      setDebouncedSearch("");
                      setSelectedSearchProjectKey("");
                      setSearchDropdownOpen(false);
                    }}
                    aria-label="Clear project search"
                  >
                    ×
                  </button>
                ) : (
                  <span className="mpf-page-top-search__count" aria-hidden>
                    {sortedProjects.length}
                  </span>
                )}
              </form>

              {searchDropdownOpen && !selectedSearchProjectKey && debouncedSearch.trim().length >= 2 ? (
                <div
                  id="mpf-project-search-dropdown"
                  className="mpf-page-top-search__dropdown"
                  role="listbox"
                  aria-label="Matching projects"
                >
                  {searchSuggestions.length > 0 ? (
                    searchSuggestions.map((project) => {
                      const key = project?.id ?? project?.slugURL ?? project?.projectName;
                      const location = formatSuggestionLocation(project);
                      return (
                        <button
                          key={key}
                          type="button"
                          role="option"
                          className="mpf-page-top-search__option"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSuggestionSelect(project)}
                        >
                          <span className="mpf-page-top-search__option-name">
                            {project?.projectName}
                          </span>
                          <span className="mpf-page-top-search__option-meta">{location}</span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="mpf-page-top-search__empty" role="status">
                      No matching projects found
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </section>
        </div>

        {/* Quick Filters */}
        <div className="mpf-quick-filters">
          <div className="mpf-quick-filters__pills">
            {appliedFilterTags.map((tag) => (
              <button
                key={tag.key}
                type="button"
                className={`mpf-applied-filter-tag${
                  tag.kind === "propertyType" && activeTab === "residential"
                    ? " mpf-applied-filter-tag--residential"
                    : ""
                }${
                  tag.kind === "propertyType" && activeTab === "commercial"
                    ? " mpf-applied-filter-tag--commercial"
                    : ""
                }`}
                onClick={() => clearAppliedFilterTag(tag)}
                aria-label={`Remove ${tag.label} filter`}
              >
                <span>{tag.label}</span>
                <FontAwesomeIcon icon={faTimes} className="mpf-applied-filter-tag__icon" />
              </button>
            ))}
            {visibleQuickFilters.map((qf) => (
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
          </div>
          <div className="mpf-quick-filters__actions">
            <button
              type="button"
              className="mpf-mobile-filter-btn"
              onClick={() => setIsMobileFilterOpen(true)}
            >
              <FontAwesomeIcon icon={faFilter} />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
            <button
              type="button"
              className="mpf-quick-clear"
              disabled={!hasAnyAppliedFilter}
              onClick={hasAnyAppliedFilter ? handleClearFilters : undefined}
              title={hasAnyAppliedFilter ? "Clear applied filters" : "No filters applied"}
            >
              Clear
            </button>
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
        </div>

        {/* Main Layout */}
        <div className="mpf-main-layout">
          {/* Sidebar Filters */}
          <aside className="mpf-filters-sidebar">
            {activeFiltersCount > 0 && (
              <div className="mpf-sidebar-header">
                <button className="mpf-clear-btn" onClick={handleClearFilters}>
                  Clear All
                </button>
              </div>
            )}

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

            <FilterSection title="Configurations">
              <div className="mpf-checkbox-list">
                {configurationFilterOptions.map((opt) => {
                  const isSelected =
                    opt.kind === "bhk"
                      ? filters.bhkType === opt.value
                      : filters.configType === opt.value;
                  return (
                    <label key={`${opt.kind}-${opt.value}`} className="mpf-checkbox-item">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          handleFilterChange(
                            opt.kind === "bhk" ? "bhkType" : "configType",
                            opt.value,
                          )
                        }
                      />
                      <span className="mpf-checkbox-label">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </FilterSection>

            <FilterSection title="Location" defaultOpen={false}>
              <div className="mpf-checkbox-list mpf-checkbox-scrollable">
                {(cities || []).map((city, idx) => (
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
            {/* Loading */}
            {isLoading && (
              <div className="mpf-loading">
                <div className="mpf-spinner"></div>
                <p>Loading projects...</p>
              </div>
            )}

            {!isLoading && showListingsAreaLoader && (
              <div className="mpf-listings-loader" aria-live="polite" aria-busy="true" role="status">
                <div className="mpf-spinner"></div>
                <p>Loading project...</p>
              </div>
            )}

            {/* No Results */}
            {!isLoading && !showListingsAreaLoader && sortedProjects.length === 0 && (
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
            {!isLoading && !showListingsAreaLoader && sortedProjects.length > 0 && (
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
            {!isLoading && !showListingsAreaLoader && totalPages > 1 && (
              <div className="mpf-pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Prev
                </button>
                {paginationItems.map((it, idx) => {
                  if (it === "ellipsis") return <span key={`e-${idx}`}>...</span>;
                  const page = it;
                  return (
                    <button
                      key={page}
                      type="button"
                      className={currentPage === page ? "active" : ""}
                      aria-current={currentPage === page ? "page" : undefined}
                      aria-disabled={currentPage === page ? true : undefined}
                      onClick={() => {
                        if (currentPage !== page) setCurrentPage(page);
                      }}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next »
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {relatedGroups.length > 0 && (
        <section className="mpf-related-search" aria-label="Related to your search">
          <div className="mpf-related-search__inner">
            <div className="mpf-related-search__header">
              <div>
                <div className="mpf-related-search__title">Related to your search</div>
                <div className="mpf-related-search__subtitle">
                  Nearby options based on what you selected
                </div>
              </div>
              <button
                type="button"
                className="mpf-related-search__toggle"
                onClick={() => setRelatedExpanded((v) => !v)}
              >
                {relatedExpanded ? "View less" : "View more"}
              </button>
            </div>

            <div className="mpf-related-search__grid">
              {relatedGroups.map((g) => (
                <div key={g.title} className="mpf-related-search__col">
                  <div className="mpf-related-search__colTitle">{g.title}</div>
                  <ul className="mpf-related-search__list">
                    {g.links.map((l) => (
                      <li key={l.href} className="mpf-related-search__item">
                        <Link href={l.href} prefetch={false} className="mpf-related-search__link">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
        configurationOptions={configurationFilterOptions}
        activeFiltersCount={activeFiltersCount}
      />
    </div>
  );
}
