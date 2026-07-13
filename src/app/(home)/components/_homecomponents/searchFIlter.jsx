"use client";

import { useProjectContext } from "@/app/_global_components/contexts/projectsContext";
import { useSiteData } from "@/app/_global_components/contexts/SiteDataContext";
import {
  findBestProjectBySearch,
  isLikelyProjectNameQuery,
  scoreProjectSearchMatch,
} from "@/app/_global_components/projectSearchUtils";
import {
  buildSmartSearchSuggestions,
  clearRecentSearches,
  formatParsedSearchLabel,
  hasStructuredSearchIntent,
  loadRecentSearches,
  parseSmartSearchQuery,
  removeRecentSearch,
  saveRecentSearch,
} from "@/app/_global_components/smartSearchParser";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Spinner } from "react-bootstrap";

const SEARCH_TABS = [
  { key: "All", label: "All" },
  { key: "Residential", label: "Residential" },
  { key: "Commercial", label: "Commercial" },
  { key: "New Launched", label: "New Launch" },
  { key: "Plots", label: "Plots" },
  { key: "Projects", label: "Projects" },
];

const RESIDENTIAL_PROPERTY_TYPES = [
  { key: "flat", label: "Flat/Apartment", hint: "BHK homes" },
  { key: "builder-floor", label: "Builder Floor", bhkType: "2 BHK", hint: "Low-rise floors" },
  { key: "villa", label: "Independent House/Villa", bhkType: "Villa", hint: "Private homes" },
  { key: "plots", label: "Residential Land", bhkType: "Plots", hint: "Plots & land" },
  { key: "serviced", label: "Serviced Apartments", hint: "Fully serviced" },
  { key: "1rk", label: "1 RK/Studio Apartment", bhkType: "1 RK", hint: "Compact living" },
  { key: "other", label: "Other", hint: "Other types" },
  { key: "farm-house", label: "Farm House", bhkType: "Villa", hint: "Farm living" },
];

const COMMERCIAL_PROPERTY_TYPES = [
  { key: "office", label: "Office", configType: "office", hint: "Workspaces" },
  { key: "shops", label: "Shops", configType: "shops", hint: "Retail units" },
  { key: "showroom", label: "Showroom", configType: "showroom", hint: "Display spaces" },
  { key: "food-court", label: "Food Court", configType: "food-court", hint: "Food spaces" },
  { key: "kiosk", label: "Kiosk", configType: "kiosk", hint: "Compact retail" },
  { key: "restaurant", label: "Restaurant", configType: "restaurant", hint: "Dining spaces" },
  { key: "sco-plots", label: "SCO Plots", configType: "sco-plots", hint: "Shop-cum-office" },
];

function PropertyTypeIcon({ typeKey }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true,
  };
  const stroke = { stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };

  switch (typeKey) {
    case "flat":
    case "serviced":
    case "1rk":
      return (
        <svg {...common}>
          <path d="M4 20V9.5L12 4l8 5.5V20" {...stroke} />
          <path d="M9 20v-6h6v6" {...stroke} />
          <path d="M9 10.5h.01M15 10.5h.01" {...stroke} />
        </svg>
      );
    case "villa":
    case "farm-house":
    case "builder-floor":
      return (
        <svg {...common}>
          <path d="M3 20h18" {...stroke} />
          <path d="M5 20V10l7-5 7 5v10" {...stroke} />
          <path d="M10 20v-5h4v5" {...stroke} />
        </svg>
      );
    case "plots":
    case "sco-plots":
      return (
        <svg {...common}>
          <path d="M4 6h16v12H4z" {...stroke} />
          <path d="M4 12h16M12 6v12" {...stroke} />
        </svg>
      );
    case "office":
      return (
        <svg {...common}>
          <path d="M5 20V5h10v15" {...stroke} />
          <path d="M15 10h4v10" {...stroke} />
          <path d="M8 8h.01M12 8h.01M8 12h.01M12 12h.01M8 16h.01M12 16h.01" {...stroke} />
        </svg>
      );
    case "shops":
    case "showroom":
    case "kiosk":
      return (
        <svg {...common}>
          <path d="M4 9h16l-1.2 11H5.2L4 9z" {...stroke} />
          <path d="M8 9V7a4 4 0 0 1 8 0v2" {...stroke} />
        </svg>
      );
    case "food-court":
    case "restaurant":
      return (
        <svg {...common}>
          <path d="M8 4v7M6 4v4a2 2 0 0 0 4 0V4" {...stroke} />
          <path d="M8 11v9" {...stroke} />
          <path d="M16 4v16M16 4c2 0 3 1.5 3 4s-1 4-3 4" {...stroke} />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M4 20V9.5L12 4l8 5.5V20" {...stroke} />
          <path d="M9 20v-6h6v6" {...stroke} />
        </svg>
      );
  }
}

const QUICK_CITY_CHIPS = ["Noida", "Gurugram", "Delhi", "Ghaziabad", "Bangalore"];

const SEARCH_DEBOUNCE_MS = 300;
const SUGGESTION_LIMIT = 8;
const SUGGESTION_KIND_LABELS = {
  intent: "Search",
  project: "Project",
  city: "City",
  builder: "Builder",
};

function SuggestionDotsLoader({ label = "Finding matches" }) {
  return (
    <div className="smart-search-suggestions-loading" role="status" aria-live="polite">
      <span className="smart-search-suggestions-loading__text">{label}</span>
      <span className="smart-search-dots" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
    </div>
  );
}

function highlightMatch(text, query) {
  const source = String(text || "");
  const q = String(query || "").trim();
  if (!q || q.length < 2) return source;

  const lowerSource = source.toLowerCase();
  const lowerQuery = q.toLowerCase();
  const index = lowerSource.indexOf(lowerQuery);
  if (index < 0) return source;

  return (
    <>
      {source.slice(0, index)}
      <mark className="smart-search-suggestion__highlight">
        {source.slice(index, index + q.length)}
      </mark>
      {source.slice(index + q.length)}
    </>
  );
}

const PLACEHOLDER_EXAMPLES = [
  'Search "3 BHK in Noida below 3 Cr"',
  'Search "Farm house in Delhi under 1 Cr"',
  'Search "M3M, Godrej, Eldeco..."',
  'Search "Commercial in Gurugram"',
];


function normalizeTypeName(value = "") {
  return value.trim().toLowerCase();
}

function tabToCategoryKey(tab) {
  if (tab === "Residential") return "residential";
  if (tab === "Commercial") return "commercial";
  if (tab === "New Launched") return "new-launch";
  if (tab === "Plots") return "residential";
  if (tab === "Projects") return "all";
  return "all";
}

function categoryKeyToTab(key) {
  if (key === "residential") return "Residential";
  if (key === "commercial") return "Commercial";
  if (key === "new-launch") return "New Launched";
  return "All";
}

function findTypeIdForTab(tab, projectTypes) {
  return projectTypes.find((t) => {
    const n = normalizeTypeName(t?.projectTypeName || "");
    if (tab === "New Launched") return n === "new launches" || n === "new launch";
    if (tab === "Commercial") return n === "commercial";
    if (tab === "Residential" || tab === "Plots") return n === "residential";
    return false;
  })?.id;
}

function resolveFilterPayload(selectedPropertyKeys, filterMode) {
  const source =
    filterMode === "commercial" ? COMMERCIAL_PROPERTY_TYPES : RESIDENTIAL_PROPERTY_TYPES;
  const selected = source.filter((item) => selectedPropertyKeys.includes(item.key));
  const bhkType = selected.find((item) => item.bhkType)?.bhkType || "";
  const configType = selected.find((item) => item.configType)?.configType || "";
  return { bhkType, configType, labels: selected.map((item) => item.label) };
}

function normalizeCommercialConfigKey(rawType = "") {
  const t = String(rawType || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
  if (!t) return null;
  if (t === "shop" || t === "shops") return "shops";
  if (t === "office" || t === "offices") return "office";
  if (t === "kiosk" || t === "kiosks") return "kiosk";
  if (t === "food court" || t === "food courts") return "food-court";
  if (t === "restaurant" || t === "restaurants") return "restaurant";
  if (t === "showroom" || t === "showrooms") return "showroom";
  if (t === "sco plots" || t === "sco plot") return "sco-plots";
  return null;
}

/** Keys that exist in live projectConfiguration values across the catalog. */
function getAvailablePropertyTypeKeys(projectList = []) {
  const residential = new Set();
  const commercial = new Set();

  for (const project of projectList) {
    const config = String(project?.projectConfiguration || "");
    if (!config) continue;

    if (/\d+\s*bhk/i.test(config)) residential.add("flat");
    if (/\bbuilder\s*floor\b/i.test(config)) residential.add("builder-floor");
    if (/\bvilla\b/i.test(config)) residential.add("villa");
    if (/\bplot(s)?\b/i.test(config) || /\bland\b/i.test(config)) residential.add("plots");
    if (/\bserviced\b/i.test(config)) residential.add("serviced");
    if (/\brk\b/i.test(config) || /\bstudio\b/i.test(config)) residential.add("1rk");
    if (/\bfarm\s*house\b/i.test(config)) residential.add("farm-house");

    const parts = config.split(",").map((p) => p.trim()).filter(Boolean);
    for (const part of parts) {
      const cleaned = part.replace(/\s*-\s*\d+\s*(?:sq\.?\s*ft|sq\.?ft)\s*/gi, "").trim();
      const key = normalizeCommercialConfigKey(cleaned);
      if (key) commercial.add(key);
      if (/\bsco\s*plots?\b/i.test(cleaned)) commercial.add("sco-plots");
      if (/\bshops?\b/i.test(cleaned)) commercial.add("shops");
      if (/\boffices?\b/i.test(cleaned)) commercial.add("office");
      if (/\bshowrooms?\b/i.test(cleaned)) commercial.add("showroom");
      if (/\bfood\s*courts?\b/i.test(cleaned)) commercial.add("food-court");
      if (/\bkiosks?\b/i.test(cleaned)) commercial.add("kiosk");
      if (/\brestaurants?\b/i.test(cleaned)) commercial.add("restaurant");
    }
  }

  return { residential, commercial };
}

function isPlotsContext(activeTab, parsed = {}) {
  return activeTab === "Plots" || parsed.quickTab === "Plots" || parsed.bhkType === "Plots";
}

function resolveNavigationBhkType({ activeTab, parsed, selectedFilterPayload }) {
  if (isPlotsContext(activeTab, parsed)) return "Plots";
  if (parsed?.configType) return "";
  return parsed?.bhkType || selectedFilterPayload.bhkType;
}

function resolveNavigationConfigType({ parsed, selectedFilterPayload }) {
  return parsed?.configType || selectedFilterPayload.configType;
}

function resolveNavigationQuickTab({ activeTab, parsed }) {
  if (isPlotsContext(activeTab, parsed)) return "Residential";
  if (parsed?.configType || parsed?.quickTab === "Commercial") return "Commercial";
  if (activeTab === "Commercial") return "Commercial";
  if (activeTab === "Projects") return "All";
  return parsed?.quickTab || activeTab;
}

export default function SearchFilter({ projectTypeList = [], cityList = [] }) {
  const { setProjectData } = useProjectContext();
  const {
    projectTypes: contextProjectTypes = [],
    cityList: contextCityList = [],
    builderList = [],
    projectList = [],
    setQueryFilters,
    setQuickProjectFilter,
    resetProjectFilters,
  } = useSiteData();

  const [activeTab, setActiveTab] = useState("All");
  const [categoryKey, setCategoryKey] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [filterMode, setFilterMode] = useState("residential");
  const [selectedPropertyKeys, setSelectedPropertyKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [suggestionsReady, setSuggestionsReady] = useState(true);

  const router = useRouter();
  const searchWrapRef = useRef(null);
  const cardRef = useRef(null);
  const propertyPanelRef = useRef(null);
  const trimmedInput = searchInput.trim();
  const isSuggestionsLoading =
    dropdownOpen && trimmedInput.length >= 2 && (!suggestionsReady || trimmedInput !== debouncedSearch);

  const effectiveProjectTypes = useMemo(
    () =>
      Array.isArray(contextProjectTypes) && contextProjectTypes.length > 0
        ? contextProjectTypes
        : projectTypeList,
    [contextProjectTypes, projectTypeList],
  );

  const effectiveCityList = useMemo(
    () =>
      Array.isArray(contextCityList) && contextCityList.length > 0
        ? contextCityList
        : cityList,
    [contextCityList, cityList],
  );

  useEffect(() => {
    setRecentSearches(loadRecentSearches());
    if (sessionStorage.getItem("mpf-querry")) {
      sessionStorage.removeItem("mpf-querry");
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (trimmedInput.length < 2) {
      setSuggestionsReady(true);
      return undefined;
    }

    setSuggestionsReady(false);
    const timer = setTimeout(() => setDebouncedSearch(trimmedInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, trimmedInput]);

  useEffect(() => {
    if (trimmedInput.length < 2) return undefined;
    if (trimmedInput !== debouncedSearch) return undefined;

    const timer = setTimeout(() => setSuggestionsReady(true), 120);
    return () => clearTimeout(timer);
  }, [debouncedSearch, trimmedInput]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const availablePropertyTypeKeys = useMemo(
    () => getAvailablePropertyTypeKeys(projectList),
    [projectList],
  );

  const activeFilterOptions = useMemo(() => {
    if (filterMode === "commercial") {
      const { commercial } = availablePropertyTypeKeys;
      // Until catalog loads, avoid flashing every hardcoded option.
      if (!projectList.length) return [];
      return COMMERCIAL_PROPERTY_TYPES.filter((opt) => commercial.has(opt.key));
    }

    const { residential } = availablePropertyTypeKeys;
    if (!projectList.length) return [];
    return RESIDENTIAL_PROPERTY_TYPES.filter((opt) => residential.has(opt.key));
  }, [availablePropertyTypeKeys, filterMode, projectList.length]);

  useEffect(() => {
    if (!categoryOpen) return undefined;

    const timer = window.setTimeout(() => {
      const panel = propertyPanelRef.current;
      if (!panel) return;

      const rect = panel.getBoundingClientRect();
      const bottomGap = 32;
      const overflowBottom = rect.bottom - (window.innerHeight - bottomGap);

      if (overflowBottom > 0) {
        window.scrollBy({ top: overflowBottom, behavior: "smooth" });
        return;
      }

      // Nudge a little when the open point sits low in the viewport.
      const trigger = searchWrapRef.current?.querySelector(".smart-search-category-trigger");
      const triggerRect = trigger?.getBoundingClientRect();
      if (!triggerRect) return;

      const lowThreshold = window.innerHeight * 0.55;
      if (triggerRect.top > lowThreshold) {
        window.scrollBy({ top: Math.min(140, triggerRect.top - lowThreshold + 40), behavior: "smooth" });
      } else if (triggerRect.top < 96) {
        window.scrollBy({ top: triggerRect.top - 96, behavior: "smooth" });
      }
    }, 50);

    return () => window.clearTimeout(timer);
  }, [categoryOpen, filterMode, activeFilterOptions.length]);

  useEffect(() => {
    if (!selectedPropertyKeys.length) return;
    const allowed = new Set(activeFilterOptions.map((opt) => opt.key));
    // Keep Plots tab selection even while catalog is still loading.
    if (activeTab === "Plots" && selectedPropertyKeys.includes("plots")) return;
    const next = selectedPropertyKeys.filter((key) => allowed.has(key));
    if (next.length !== selectedPropertyKeys.length) {
      setSelectedPropertyKeys(next);
    }
  }, [activeFilterOptions, activeTab, selectedPropertyKeys]);

  const selectedFilterPayload = useMemo(
    () => resolveFilterPayload(selectedPropertyKeys, filterMode),
    [selectedPropertyKeys, filterMode],
  );

  const selectedCategoryLabel = useMemo(() => {
    if (selectedFilterPayload.labels.length === 0) {
      if (activeTab === "Commercial" || filterMode === "commercial") return "All Commercial";
      if (activeTab === "Plots") return "Plots / Land";
      return "All Properties";
    }
    if (selectedFilterPayload.labels.length === 1) return selectedFilterPayload.labels[0];
    return `${selectedFilterPayload.labels.length} types selected`;
  }, [selectedFilterPayload.labels, activeTab, filterMode]);

  const suggestions = useMemo(
    () =>
      buildSmartSearchSuggestions(debouncedSearch, {
        projectList,
        cities: effectiveCityList,
        builderList,
        projectTypes: effectiveProjectTypes,
        limit: SUGGESTION_LIMIT,
      }),
    [debouncedSearch, projectList, effectiveCityList, builderList, effectiveProjectTypes],
  );

  const navigateToProjects = useCallback(
    async ({
      propertyTypeId = "",
      cityId = "",
      budget = "",
      bhkType = "",
      configType = "",
      quickTab = "All",
      searchLabel = "",
    }) => {
      const resolvedBhk = bhkType || selectedFilterPayload.bhkType;
      const resolvedConfig = configType || selectedFilterPayload.configType;
      const paramsObj = {
        propertyType: propertyTypeId,
        propertyLocation: cityId,
        budget,
        bhkType: resolvedBhk,
        configType: resolvedConfig,
        searchLabel: searchLabel || "",
      };

      try {
        setLoading(true);
        setQuickProjectFilter(quickTab);
        resetProjectFilters();
        setQueryFilters(paramsObj);
        sessionStorage.setItem("mpf-querry", JSON.stringify(paramsObj));
        setProjectData([]);
        if (searchLabel) {
          saveRecentSearch(searchLabel);
          setRecentSearches(loadRecentSearches());
        }
        router.push("/projects");
      } finally {
        setLoading(false);
      }
    },
    [resetProjectFilters, router, setProjectData, setQueryFilters, setQuickProjectFilter, selectedFilterPayload],
  );

  const handleTabChange = (tab) => {
    if (tab === "Projects") {
      router.push("/projects");
      return;
    }

    setActiveTab(tab);
    setCategoryKey(tabToCategoryKey(tab));

    if (tab === "Plots") {
      setFilterMode("residential");
      setSelectedPropertyKeys(["plots"]);
      return;
    }

    if (tab === "Commercial") {
      setFilterMode("commercial");
      setSelectedPropertyKeys([]);
      return;
    }

    if (tab === "Residential" || tab === "All") {
      setFilterMode("residential");
    }

    if (tab !== "Plots") {
      setSelectedPropertyKeys([]);
    }
  };

  const togglePropertyFilter = (key) => {
    setSelectedPropertyKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const clearPropertyFilters = () => {
    setSelectedPropertyKeys([]);
  };

  const switchToCommercialFilters = () => {
    setFilterMode("commercial");
    setActiveTab("Commercial");
    setCategoryKey("commercial");
    setSelectedPropertyKeys([]);
  };

  const switchToResidentialFilters = () => {
    setFilterMode("residential");
    setActiveTab("Residential");
    setCategoryKey("residential");
    setSelectedPropertyKeys([]);
  };

  const handleSuggestionSelect = (suggestion) => {
    setDropdownOpen(false);
    const label = suggestion.label;

    if (suggestion.kind === "intent") {
      const parsed = suggestion.parsed || {};
      const tab = resolveNavigationQuickTab({ activeTab, parsed });
      navigateToProjects({
        propertyTypeId: parsed.propertyTypeId || findTypeIdForTab(tab, effectiveProjectTypes) || "",
        cityId: parsed.cityId || "",
        budget: parsed.budget || "",
        bhkType: resolveNavigationBhkType({ activeTab, parsed, selectedFilterPayload }),
        configType: resolveNavigationConfigType({ parsed, selectedFilterPayload }),
        quickTab: tab,
        searchLabel: label,
      });
      return;
    }

    if (suggestion.kind === "project") {
      const slug = suggestion.item?.slugURL || suggestion.item?.slug;
      if (slug) {
        saveRecentSearch(label);
        setRecentSearches(loadRecentSearches());
        router.push(`/${slug}`);
        return;
      }
    }

    if (suggestion.kind === "city") {
      navigateToProjects({
        propertyTypeId: findTypeIdForTab(activeTab, effectiveProjectTypes) || "",
        cityId: String(suggestion.item.id),
        bhkType: resolveNavigationBhkType({ activeTab, selectedFilterPayload }),
        configType: resolveNavigationConfigType({ selectedFilterPayload }),
        quickTab: resolveNavigationQuickTab({ activeTab }),
        searchLabel: `${activeTab !== "All" ? activeTab + " in " : ""}${label}`,
      });
      return;
    }

    if (suggestion.kind === "builder") {
      setSearchInput(label);
      setDebouncedSearch(label);
      const match = findBestProjectBySearch(label, projectList);
      if (match?.slugURL) {
        saveRecentSearch(label);
        setRecentSearches(loadRecentSearches());
        router.push(`/${match.slugURL}`);
      } else {
        navigateToProjects({
          quickTab: activeTab,
          searchLabel: label,
        });
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = searchInput.trim();
    setDropdownOpen(false);

    if (!q) {
      const quickTab = resolveNavigationQuickTab({ activeTab });
      const typeId = findTypeIdForTab(activeTab === "Plots" ? "Plots" : quickTab, effectiveProjectTypes);
      navigateToProjects({
        propertyTypeId: typeId ? String(typeId) : "",
        bhkType: resolveNavigationBhkType({ activeTab, selectedFilterPayload }),
        configType: selectedFilterPayload.configType,
        quickTab,
      });
      return;
    }

    const parsed = parseSmartSearchQuery(q, {
      cities: effectiveCityList,
      projectTypes: effectiveProjectTypes,
    });

    if (hasStructuredSearchIntent(parsed)) {
      const quickTab = resolveNavigationQuickTab({ activeTab, parsed });
      const typeId =
        parsed.propertyTypeId ||
        findTypeIdForTab(isPlotsContext(activeTab, parsed) ? "Plots" : quickTab, effectiveProjectTypes) ||
        findTypeIdForTab(activeTab, effectiveProjectTypes);

      navigateToProjects({
        propertyTypeId: typeId ? String(typeId) : "",
        cityId: parsed.cityId,
        budget: parsed.budget,
        bhkType: resolveNavigationBhkType({ activeTab, parsed, selectedFilterPayload }),
        configType: resolveNavigationConfigType({ parsed, selectedFilterPayload }),
        quickTab,
        searchLabel: formatParsedSearchLabel(parsed) || q,
      });
      return;
    }

    const projectMatch = findBestProjectBySearch(q, projectList);
    if (projectMatch?.slugURL && isLikelyProjectNameQuery(q)) {
      const matchScore = scoreProjectSearchMatch(projectMatch.projectName, q);
      if (matchScore >= 0 && matchScore <= 2) {
        saveRecentSearch(q);
        setRecentSearches(loadRecentSearches());
        router.push(`/${projectMatch.slugURL}`);
        return;
      }
    }

    const quickTab = resolveNavigationQuickTab({ activeTab, parsed });
    const typeId =
      parsed.propertyTypeId ||
      findTypeIdForTab(isPlotsContext(activeTab, parsed) ? "Plots" : quickTab, effectiveProjectTypes) ||
      findTypeIdForTab(activeTab, effectiveProjectTypes);

    navigateToProjects({
      propertyTypeId: typeId ? String(typeId) : "",
      cityId: parsed.cityId,
      budget: parsed.budget,
      bhkType: resolveNavigationBhkType({ activeTab, parsed, selectedFilterPayload }),
      configType: resolveNavigationConfigType({ parsed, selectedFilterPayload }),
      quickTab,
      searchLabel: formatParsedSearchLabel(parsed) || q,
    });
  };

  const handleQuickCity = (cityName) => {
    const city = effectiveCityList.find(
      (c) => String(c?.cityName || "").toLowerCase() === cityName.toLowerCase(),
    );
    const quickTab = resolveNavigationQuickTab({ activeTab });
    const typeId = findTypeIdForTab(activeTab === "Plots" ? "Plots" : quickTab, effectiveProjectTypes);
    const label = `${activeTab !== "All" ? activeTab + " in " : ""}${cityName}`;
    navigateToProjects({
      propertyTypeId: typeId ? String(typeId) : "",
      cityId: city ? String(city.id) : "",
      bhkType: resolveNavigationBhkType({ activeTab, selectedFilterPayload }),
      configType: resolveNavigationConfigType({ selectedFilterPayload }),
      quickTab,
      searchLabel: label,
    });
  };

  const handleRecentSearch = (label) => {
    setSearchInput(label);
    setDebouncedSearch(label);
    setSuggestionsReady(false);
    setDropdownOpen(true);
    setTimeout(() => {
      const form = searchWrapRef.current?.querySelector("form");
      form?.requestSubmit();
    }, 0);
  };

  const handleRemoveRecentSearch = (label, e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = removeRecentSearch(label);
    setRecentSearches(next);
  };

  const handleClearRecentSearches = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const showSuggestionsPanel = dropdownOpen && trimmedInput.length >= 2 && !categoryOpen;

  return (
    <div className="home-search-container container">
      <div className="smart-search-card search-filter-shadow" ref={cardRef}>
        <div className="smart-search-tabs" role="tablist" aria-label="Property categories">
          {SEARCH_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`smart-search-tab${activeTab === tab.key ? " smart-search-tab--active" : ""}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="smart-search-bar-wrap" ref={searchWrapRef}>
          <form className="smart-search-bar" onSubmit={handleSearch}>
            <div className="smart-search-category">
              <button
                type="button"
                className={`smart-search-category-trigger${categoryOpen ? " active" : ""}${
                  selectedPropertyKeys.length > 0 ? " smart-search-category-trigger--selected" : ""
                }`}
                onClick={() => {
                  setCategoryOpen(!categoryOpen);
                  setDropdownOpen(false);
                }}
                aria-expanded={categoryOpen}
                aria-haspopup="listbox"
              >
                <span className="smart-search-category-trigger__icon" aria-hidden>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 20V9.5L12 4l8 5.5V20"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="smart-search-category-trigger__text">{selectedCategoryLabel}</span>
                {selectedPropertyKeys.length > 1 ? (
                  <span className="smart-search-category-trigger__count">{selectedPropertyKeys.length}</span>
                ) : null}
                <svg
                  className={`smart-search-category-trigger__chevron${categoryOpen ? " is-open" : ""}`}
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="smart-search-input-wrap">
              <svg className="smart-search-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                className="smart-search-input"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setSuggestionsReady(false);
                  setDropdownOpen(true);
                }}
                onFocus={() => {
                  if (trimmedInput.length >= 2) setDropdownOpen(true);
                }}
                placeholder={PLACEHOLDER_EXAMPLES[placeholderIdx]}
                aria-label="Search properties, projects, cities"
                aria-expanded={dropdownOpen}
                aria-controls="smart-search-suggestions"
                autoComplete="off"
              />
              {searchInput ? (
                <button
                  type="button"
                  className="smart-search-clear"
                  onClick={() => {
                    setSearchInput("");
                    setDebouncedSearch("");
                    setDropdownOpen(false);
                  }}
                  aria-label="Clear search"
                >
                  ×
                </button>
              ) : null}
            </div>

            <button type="submit" className="smart-search-submit search-btn-home-page" aria-label="Search">
              {loading ? <Spinner animation="border" size="sm" variant="light" /> : "Search"}
            </button>
          </form>

          {showSuggestionsPanel ? (
            <div
              id="smart-search-suggestions"
              className="smart-search-suggestions"
              role="listbox"
              aria-label="Search suggestions"
              aria-busy={isSuggestionsLoading}
            >
              {isSuggestionsLoading ? (
                <SuggestionDotsLoader />
              ) : suggestions.length > 0 ? (
                suggestions.map((s, idx) => (
                  <button
                    key={`${s.kind}-${s.label}-${idx}`}
                    type="button"
                    role="option"
                    className="smart-search-suggestion"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSuggestionSelect(s)}
                  >
                    <span className="smart-search-suggestion__main">
                      <span className="smart-search-suggestion__label">
                        {highlightMatch(s.label, debouncedSearch)}
                      </span>
                      <span className="smart-search-suggestion__meta">{s.meta}</span>
                    </span>
                    <span className={`smart-search-suggestion__badge smart-search-suggestion__badge--${s.kind}`}>
                      {SUGGESTION_KIND_LABELS[s.kind]}
                    </span>
                  </button>
                ))
              ) : (
                <div className="smart-search-suggestion smart-search-suggestion--empty" role="status">
                  No matches for &ldquo;{debouncedSearch}&rdquo; — press Search to explore
                </div>
              )}
            </div>
          ) : null}

          {categoryOpen ? (
            <div
              ref={propertyPanelRef}
              className="smart-search-property-panel"
              role="listbox"
              aria-multiselectable="true"
            >
              <div className="smart-search-property-panel__header">
                <div className="smart-search-property-panel__heading">
                  <span className="smart-search-property-panel__eyebrow">
                    {filterMode === "commercial" ? "Commercial" : "Residential"}
                  </span>
                  <span className="smart-search-property-panel__title">Choose property type</span>
                </div>
                {selectedPropertyKeys.length > 0 ? (
                  <button
                    type="button"
                    className="smart-search-property-panel__clear"
                    onClick={clearPropertyFilters}
                  >
                    Clear
                  </button>
                ) : null}
              </div>

              {activeFilterOptions.length > 0 ? (
                <div className="smart-search-property-panel__grid">
                  {activeFilterOptions.map((option) => {
                    const checked = selectedPropertyKeys.includes(option.key);
                    return (
                      <button
                        key={option.key}
                        type="button"
                        role="option"
                        aria-selected={checked}
                        className={`smart-search-property-option${checked ? " smart-search-property-option--checked" : ""}`}
                        onClick={() => togglePropertyFilter(option.key)}
                      >
                        <span className="smart-search-property-option__icon">
                          <PropertyTypeIcon typeKey={option.key} />
                        </span>
                        <span className="smart-search-property-option__copy">
                          <span className="smart-search-property-option__label">{option.label}</span>
                          {option.hint ? (
                            <span className="smart-search-property-option__hint">{option.hint}</span>
                          ) : null}
                        </span>
                        <span className="smart-search-property-option__check" aria-hidden>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M5 13l4 4L19 7"
                              stroke="currentColor"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="smart-search-property-panel__empty" role="status">
                  Loading available property types…
                </div>
              )}

              <div className="smart-search-property-panel__footer">
                {filterMode === "residential" ? (
                  <button type="button" className="smart-search-property-panel__switch" onClick={switchToCommercialFilters}>
                    Looking for commercial? <strong>Switch</strong>
                  </button>
                ) : (
                  <button type="button" className="smart-search-property-panel__switch" onClick={switchToResidentialFilters}>
                    Looking for residential? <strong>Switch</strong>
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {recentSearches.length > 0 ? (
          <div className="smart-search-recent">
            <span className="smart-search-recent__label">Recent searches:</span>
            <div className="smart-search-recent__pills">
              {recentSearches.map((item) => (
                <span key={item} className="smart-search-recent__pill">
                  <button
                    type="button"
                    className="smart-search-recent__pill-text"
                    onClick={() => handleRecentSearch(item)}
                  >
                    {item}
                  </button>
                  <button
                    type="button"
                    className="smart-search-recent__pill-remove"
                    onClick={(e) => handleRemoveRecentSearch(item, e)}
                    aria-label={`Remove "${item}" from recent searches`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <button
              type="button"
              className="smart-search-recent__clear"
              onClick={handleClearRecentSearches}
            >
              Clear all
            </button>
          </div>
        ) : null}

        <div className="smart-search-chips">
          {QUICK_CITY_CHIPS.map((city) => (
            <button
              key={city}
              type="button"
              className="smart-search-chip"
              onClick={() => handleQuickCity(city)}
            >
              {activeTab !== "All" ? `${activeTab} in ` : ""}
              {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
