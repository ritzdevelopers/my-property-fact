"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProjectCard from "@/app/(home)/projects/components/ProjectCard";
import {
  LISTING_PAGE_SIZE,
  ProjectListingPaginationControls,
  scrollToProjectListings,
  useProjectListingPagination,
} from "@/app/_global_components/projectListingPagination";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import {
  matchesBudgetRangeForProject,
  PROJECT_BUDGET_OPTIONS,
} from "@/app/_global_components/projectFilterUtils";
import { extractTypesFromProjectConfiguration } from "@/lib/listingFloorValidation";
import { removeCityMentionsFromQuery } from "@/app/_global_components/cityAliasUtils";
import { formatListingStatusLabel } from "@/lib/projectCardHelpers";
import CityFilterSidebar from "./CityFilterSidebar";

const LIST_FILTER_KEYS = [
  "propertyType",
  "locality",
  "configuration",
  "budget",
  "status",
  "builder",
];

const EMPTY_FILTERS = {
  search: "",
  propertyType: [],
  locality: [],
  configuration: [],
  budget: [],
  status: [],
  builder: [],
};

const titleCase = (value) =>
  String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      /\d/.test(word) || word.length <= 2
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(" ");

function rawLocality(project) {
  const locality = String(project?.projectLocality || "").trim();
  if (locality) return locality;

  const firstAddressPart = String(project?.projectAddress || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)[0];

  return firstAddressPart || "";
}

/**
 * Localities arrive spelled several ways for the same place ("Sector-12",
 * "Sector 12 Greater Noida West"), so city mentions are trimmed off and a
 * trailing direction is dropped only when the plain locality also exists.
 */
function makeLocalityResolver(cityName, projects) {
  const clean = (project) => {
    const raw = rawLocality(project)
      .replace(/[-–—]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!raw) return "";

    const withoutCity = removeCityMentionsFromQuery(raw, cityName) || raw;
    return titleCase(withoutCity.replace(/[,\s]+$/g, "").trim() || raw);
  };

  const known = new Set(projects.map(clean).filter(Boolean));
  const merged = new Map();
  known.forEach((value) => {
    const withoutDirection = value.replace(
      /\s+(West|East|North|South|Central)$/i,
      "",
    );
    merged.set(
      value,
      withoutDirection !== value && known.has(withoutDirection)
        ? withoutDirection
        : value,
    );
  });

  return (project) => {
    const value = clean(project);
    return merged.get(value) || value;
  };
}

function projectPropertyType(project) {
  return String(project?.propertyTypeName || "")
    .toLowerCase()
    .includes("commercial")
    ? "Commercial"
    : "Residential";
}

function projectConfigurations(project) {
  return extractTypesFromProjectConfiguration(project?.projectConfiguration || "");
}

/** Options are counted against the list, so empty buckets never show up. */
function buildOptions(projects, valuesOf, labelOf = titleCase) {
  const counts = new Map();

  projects.forEach((project) => {
    valuesOf(project).forEach((value) => {
      const clean = String(value || "").trim();
      if (!clean) return;
      counts.set(clean, (counts.get(clean) || 0) + 1);
    });
  });

  return [...counts.entries()]
    .map(([value, count]) => ({ value, label: labelOf(value), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function configurationLabel(value) {
  const bhk = value.match(/^(\d+)\s*bhk$/i);
  if (bhk) return `${bhk[1]} BHK`;
  return titleCase(value);
}

function configurationSortKey(value) {
  const bhk = value.match(/^(\d+)\s*bhk$/i);
  return bhk ? Number(bhk[1]) : Number.MAX_SAFE_INTEGER;
}

export default function CityProjectsPanel({
  cityData,
  projects,
  projectsLoading,
}) {
  const cityName = cityData?.cityName?.trim() || "this city";
  const listingsRef = useRef(null);
  const panelRef = useRef(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const localityOf = useMemo(
    () => makeLocalityResolver(cityName, Array.isArray(projects) ? projects : []),
    [cityName, projects],
  );

  const options = useMemo(() => {
    const list = Array.isArray(projects) ? projects : [];

    return {
      propertyTypes: buildOptions(list, (p) => [projectPropertyType(p)], (v) => v),
      localities: buildOptions(list, (p) => [localityOf(p)], (v) => v),
      configurations: buildOptions(
        list,
        projectConfigurations,
        configurationLabel,
      ).sort(
        (a, b) =>
          configurationSortKey(a.value) - configurationSortKey(b.value) ||
          b.count - a.count,
      ),
      budgets: PROJECT_BUDGET_OPTIONS.map((label) => ({
        value: label,
        label: label.replace(/\*/g, ""),
        count: list.filter((project) =>
          matchesBudgetRangeForProject(project, label),
        ).length,
      })).filter((option) => option.count > 0),
      statuses: buildOptions(
        list,
        (p) => [p?.projectStatusName],
        (value) => formatListingStatusLabel(value) || titleCase(value),
      ),
      builders: buildOptions(list, (p) => [p?.builderName], (v) => v),
    };
  }, [projects, localityOf]);

  const filteredProjects = useMemo(() => {
    const list = Array.isArray(projects) ? projects : [];
    const search = filters.search.trim().toLowerCase();

    return list.filter((project) => {
      if (search) {
        const haystack = [
          project?.projectName,
          project?.builderName,
          project?.projectAddress,
          project?.projectLocality,
          project?.projectConfiguration,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }

      if (
        filters.propertyType.length &&
        !filters.propertyType.includes(projectPropertyType(project))
      ) {
        return false;
      }

      if (
        filters.locality.length &&
        !filters.locality.includes(localityOf(project))
      ) {
        return false;
      }

      if (filters.configuration.length) {
        const configs = projectConfigurations(project);
        if (!filters.configuration.some((value) => configs.includes(value))) {
          return false;
        }
      }

      if (
        filters.budget.length &&
        !filters.budget.some((value) =>
          matchesBudgetRangeForProject(project, value),
        )
      ) {
        return false;
      }

      if (
        filters.status.length &&
        !filters.status.includes(String(project?.projectStatusName || "").trim())
      ) {
        return false;
      }

      if (
        filters.builder.length &&
        !filters.builder.includes(String(project?.builderName || "").trim())
      ) {
        return false;
      }

      return true;
    });
  }, [projects, filters, localityOf]);

  const { pageItems, currentPage, totalPages, totalItems, setPage } =
    useProjectListingPagination(filteredProjects, LISTING_PAGE_SIZE);

  const activeCount = useMemo(
    () =>
      LIST_FILTER_KEYS.reduce((sum, key) => sum + filters[key].length, 0) +
      (filters.search.trim() ? 1 : 0),
    [filters],
  );

  const handleSearchChange = useCallback((value) => {
    setFilters((prev) => ({ ...prev, search: value }));
  }, []);

  const handleToggleValue = useCallback((key, value) => {
    setFilters((prev) => {
      const current = prev[key];
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  }, []);

  const handleReset = useCallback(() => setFilters(EMPTY_FILTERS), []);

  /** Every filter change replays a short loading beat over the results. */
  const previousFiltersRef = useRef(null);
  const pendingScrollRef = useRef(false);

  useEffect(() => {
    const previous = previousFiltersRef.current;
    previousFiltersRef.current = filters;
    if (!previous) return undefined;

    setRefreshing(true);

    // Typing in the search box must not yank the page on every keystroke.
    const onlySearchChanged = LIST_FILTER_KEYS.every(
      (key) => previous[key] === filters[key],
    );

    if (!onlySearchChanged) {
      if (sheetOpen) {
        pendingScrollRef.current = true;
      } else {
        scrollToProjectListings(panelRef);
      }
    }

    const timer = window.setTimeout(() => setRefreshing(false), 1000);
    return () => window.clearTimeout(timer);
    // The sheet state must not restart the beat, only decide where we scroll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    if (sheetOpen || !pendingScrollRef.current) return;
    pendingScrollRef.current = false;
    scrollToProjectListings(panelRef);
  }, [sheetOpen]);

  return (
    <div className="city-listing">
      <CityFilterSidebar
        cityName={cityName}
        filters={filters}
        options={options}
        activeCount={activeCount}
        resultCount={filteredProjects.length}
        sheetOpen={sheetOpen}
        onSheetOpenChange={setSheetOpen}
        onSearchChange={handleSearchChange}
        onToggleValue={handleToggleValue}
        onReset={handleReset}
      />

      <section
        className="city-projects-panel"
        aria-labelledby="city-projects-heading"
        ref={panelRef}
      >
        <div className="city-projects-panel__header">
          <h2 id="city-projects-heading" className="city-projects-heading">
            Projects in {cityName}
          </h2>
          {!projectsLoading ? (
            <p className="city-projects-panel__count">
              {totalItems} project{totalItems === 1 ? "" : "s"}
              {activeCount > 0 ? " matched" : " available"}
            </p>
          ) : null}
        </div>

        {projectsLoading ? (
          <div className="city-projects-panel__loading">
            <LoadingSpinner show={true} />
          </div>
        ) : (
          <div
            className={`city-projects-panel__results${
              refreshing ? " is-refreshing" : ""
            }`}
          >
            {refreshing ? (
              <div className="city-projects-panel__refresh" role="status">
                <LoadingSpinner show={true} />
                <span>Updating projects…</span>
              </div>
            ) : null}

            <div className="city-projects-panel__grid mpf-listing-poster-grid" ref={listingsRef}>
              {pageItems.length > 0 ? (
                pageItems.map((item, index) => (
                  <ProjectCard
                    key={item?.id != null ? String(item.id) : `city-project-${index}`}
                    project={item}
                    imagePriority={index < 3}
                    variant="poster"
                  />
                ))
              ) : (
                <div className="city-projects-panel__empty">
                  <p>No projects match your filters in {cityName}.</p>
                  {activeCount > 0 ? (
                    <button
                      type="button"
                      className="city-projects-panel__empty-btn"
                      onClick={handleReset}
                    >
                      Clear filters
                    </button>
                  ) : null}
                </div>
              )}
            </div>

            <ProjectListingPaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={LISTING_PAGE_SIZE}
              onPageChange={setPage}
              scrollTargetRef={panelRef}
            />
          </div>
        )}
      </section>
    </div>
  );
}
