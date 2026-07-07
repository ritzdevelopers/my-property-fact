"use client";

import Link from "next/link";
import { useProjectContext } from "@/app/_global_components/contexts/projectsContext";
import { useSiteData } from "@/app/_global_components/contexts/SiteDataContext";
import {
  findBestProjectBySearch,
} from "@/app/_global_components/projectSearchUtils";
import {
  buildSmartSearchSuggestions,
  clearRecentSearches,
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
  { key: "flat", label: "Flat/Apartment" },
  { key: "builder-floor", label: "Builder Floor", bhkType: "2 BHK" },
  { key: "villa", label: "Independent House/Villa", bhkType: "Villa" },
  { key: "plots", label: "Residential Land", bhkType: "Plots" },
  { key: "serviced", label: "Serviced Apartments" },
  { key: "1rk", label: "1 RK/Studio Apartment", bhkType: "1 RK" },
  { key: "other", label: "Other" },
  { key: "farm-house", label: "Farm House", bhkType: "Villa" },
];

const COMMERCIAL_PROPERTY_TYPES = [
  { key: "office", label: "Office", configType: "office" },
  { key: "shops", label: "Shops", configType: "shops" },
  { key: "showroom", label: "Showroom", configType: "showroom" },
  { key: "food-court", label: "Food Court", configType: "food-court" },
  { key: "kiosk", label: "Kiosk", configType: "kiosk" },
  { key: "restaurant", label: "Restaurant", configType: "restaurant" },
  { key: "sco-plots", label: "SCO Plots", configType: "sco-plots" },
];

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

function isPlotsContext(activeTab, parsed = {}) {
  return activeTab === "Plots" || parsed.quickTab === "Plots" || parsed.bhkType === "Plots";
}

function resolveNavigationBhkType({ activeTab, parsed, selectedFilterPayload }) {
  if (isPlotsContext(activeTab, parsed)) return "Plots";
  return parsed?.bhkType || selectedFilterPayload.bhkType;
}

function resolveNavigationQuickTab({ activeTab, parsed }) {
  if (isPlotsContext(activeTab, parsed)) return "Residential";
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

  const activeFilterOptions =
    filterMode === "commercial" ? COMMERCIAL_PROPERTY_TYPES : RESIDENTIAL_PROPERTY_TYPES;

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

    const projectMatch = findBestProjectBySearch(q, projectList);
    if (projectMatch?.slugURL) {
      saveRecentSearch(q);
      setRecentSearches(loadRecentSearches());
      router.push(`/${projectMatch.slugURL}`);
      return;
    }

    const parsed = parseSmartSearchQuery(q, {
      cities: effectiveCityList,
      projectTypes: effectiveProjectTypes,
    });

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
      configType: selectedFilterPayload.configType,
      quickTab,
      searchLabel: q,
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
                className={`smart-search-category-trigger${categoryOpen ? " active" : ""}`}
                onClick={() => {
                  setCategoryOpen(!categoryOpen);
                  setDropdownOpen(false);
                }}
                aria-expanded={categoryOpen}
                aria-haspopup="true"
              >
                <span>{selectedCategoryLabel}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
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
            <div className="smart-search-property-panel">
              <div className="smart-search-property-panel__header">
                <span className="smart-search-property-panel__title">
                  {filterMode === "commercial" ? "Commercial property types" : "Residential property types"}
                </span>
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

              <div className="smart-search-property-panel__grid">
                {activeFilterOptions.map((option) => {
                  const checked = selectedPropertyKeys.includes(option.key);
                  return (
                    <label
                      key={option.key}
                      className={`smart-search-property-option${checked ? " smart-search-property-option--checked" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePropertyFilter(option.key)}
                      />
                      <span className="smart-search-property-option__box" aria-hidden />
                      <span className="smart-search-property-option__label">{option.label}</span>
                    </label>
                  );
                })}
              </div>

              <div className="smart-search-property-panel__footer">
                {filterMode === "residential" ? (
                  <button type="button" className="smart-search-property-panel__switch" onClick={switchToCommercialFilters}>
                    Looking for commercial properties? <strong>Click here</strong>
                  </button>
                ) : (
                  <button type="button" className="smart-search-property-panel__switch" onClick={switchToResidentialFilters}>
                    Looking for residential properties? <strong>Click here</strong>
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
          <Link href="/projects" className="smart-search-chip smart-search-chip--link" prefetch={false}>
            View all projects
          </Link>
        </div>
      </div>
    </div>
  );
}
