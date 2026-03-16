"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useSearchParams } from "next/navigation";
import { matchesBudgetRangeForProject } from "../projectFilterUtils";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "";

const DEFAULT_PROJECT_FILTERS = {
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

const DEFAULT_QUERY_FILTERS = {
  propertyType: "",
  propertyLocation: "",
  budget: "",
};

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function extractIndividualBHKTypes(configStr) {
  if (!configStr) return [];
  const matches = configStr.match(/\d+\s*BHK/gi);
  return matches ? [...new Set(matches.map((match) => match.trim()))] : [];
}

function createByIdMap(list) {
  const map = new Map();
  (list || []).forEach((item) => {
    const id = toNumber(item?.id);
    if (id != null) map.set(id, item);
  });
  return map;
}

let siteDataCache = null;
let siteDataPromise = null;

async function fetchSiteData() {
  const [citiesRes, buildersRes, typesRes, statusesRes, projectsRes] =
    await Promise.all([
      fetch(`${apiBase}city/all`),
      fetch(`${apiBase}builder/get-all`),
      fetch(`${apiBase}project-types/get-all`),
      fetch(`${apiBase}project-status`),
      fetch(`${apiBase}projects`),
    ]);

  const [cities, buildersData, typesData, statusesData, projectsData] =
    await Promise.all([
      citiesRes.json(),
      buildersRes.json(),
      typesRes.json(),
      statusesRes.json(),
      projectsRes.json(),
    ]);

  return {
    cityList: cities || [],
    builderList: buildersData?.builders || [],
    projectTypes: typesData || [],
    projectStatuses: statusesData || [],
    projectList: projectsData || [],
  };
}

const SiteDataContext = createContext({});

export function SiteDataProvider({ children }) {
  const searchParams = useSearchParams();

  const [cityList, setCityList] = useState([]);
  const [builderList, setBuilderList] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [projectStatuses, setProjectStatuses] = useState([]);
  const [projectList, setProjectList] = useState([]);

  const [quickProjectFilter, setQuickProjectFilter] = useState("All");
  const [projectFilters, setProjectFiltersState] = useState(DEFAULT_PROJECT_FILTERS);
  const [queryFilters, setQueryFiltersState] = useState(DEFAULT_QUERY_FILTERS);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const citiesById = useMemo(() => createByIdMap(cityList), [cityList]);
  const projectTypesById = useMemo(() => createByIdMap(projectTypes), [projectTypes]);
  const statusesById = useMemo(() => createByIdMap(projectStatuses), [projectStatuses]);
  const buildersById = useMemo(() => createByIdMap(builderList), [builderList]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        if (siteDataCache) {
          setCityList(siteDataCache.cityList);
          setBuilderList(siteDataCache.builderList);
          setProjectTypes(siteDataCache.projectTypes);
          setProjectStatuses(siteDataCache.projectStatuses);
          setProjectList(siteDataCache.projectList);
          setLoading(false);
          return;
        }

        if (!siteDataPromise) {
          siteDataPromise = fetchSiteData().then((data) => {
            siteDataCache = data;
            return data;
          });
        }

        const data = await siteDataPromise;

        if (!cancelled) {
          setCityList(data.cityList);
          setBuilderList(data.builderList);
          setProjectTypes(data.projectTypes);
          setProjectStatuses(data.projectStatuses);
          setProjectList(data.projectList);
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load site data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!searchParams) return;

    const propertyType = searchParams.get("propertyType") || "";
    const propertyLocation = searchParams.get("propertyLocation") || "";
    const budget = searchParams.get("budget") || "";

    if (!propertyType && !propertyLocation && !budget) return;

    setQueryFiltersState({
      propertyType,
      propertyLocation,
      budget,
    });
  }, [searchParams]);

  const setProjectFilters = useCallback((nextFilters) => {
    setProjectFiltersState((previous) => ({
      ...DEFAULT_PROJECT_FILTERS,
      ...previous,
      ...(typeof nextFilters === "function" ? nextFilters(previous) : nextFilters),
    }));
  }, []);

  const resetProjectFilters = useCallback(() => {
    setProjectFiltersState(DEFAULT_PROJECT_FILTERS);
  }, []);

  const setQueryFilters = useCallback((nextFilters) => {
    setQueryFiltersState((previous) => ({
      ...DEFAULT_QUERY_FILTERS,
      ...previous,
      ...(typeof nextFilters === "function" ? nextFilters(previous) : nextFilters),
    }));
  }, []);

  const clearQueryFilters = useCallback(() => {
    setQueryFiltersState(DEFAULT_QUERY_FILTERS);
  }, []);

  const indexedProjectList = useMemo(() => {
    return (projectList || []).map((project) => {
      const configs = String(project?.projectConfiguration || "")
        .split(",")
        .map((value) => value.trim());

      const bhkTypes = configs.flatMap((value) => extractIndividualBHKTypes(value));

      return {
        project,
        cityNorm: normalizeText(project?.cityName),
        cityIdNum: toNumber(project?.cityId),
        projectAddressNorm: normalizeText(project?.projectAddress),
        propertyTypeNorm: normalizeText(project?.propertyTypeName),
        statusNorm: normalizeText(project?.projectStatusName),
        builderNorm: normalizeText(project?.builderName),
        possessionNorm: normalizeText(project?.projectPossession || project?.possession),
        occupancyNorm: normalizeText(project?.occupancyStatus || project?.occupancy),
        facingNorm: normalizeText(project?.facing),
        propertyTypeIdNum: toNumber(project?.propertyTypeId),
        projectStatusIdNum: toNumber(project?.projectStatusId),
        builderIdNum: toNumber(project?.builderId),
        bhkTypes,
      };
    });
  }, [projectList]);

  const bhkTypes = useMemo(() => {
    const set = new Set();
    indexedProjectList.forEach((item) => {
      item.bhkTypes.forEach((value) => {
        if (value) set.add(value);
      });
    });
    return Array.from(set);
  }, [indexedProjectList]);

  const filteredProjectList = useMemo(() => {
    let filtered = indexedProjectList.filter(
      (item) => item.project?.status === 0 || item.project?.status === 1
    );

    if (queryFilters.propertyType) {
      const typeId = toNumber(queryFilters.propertyType);
      const typeMeta = projectTypesById.get(typeId);
      const typeName = normalizeText(typeMeta?.projectTypeName || "");

      if (typeName === "new launches" || typeName === "new launch") {
        filtered = filtered.filter((item) => item.statusNorm.includes("new launch"));
      } else {
        filtered = filtered.filter((item) => item.propertyTypeIdNum === typeId);
      }
    }

    if (queryFilters.propertyLocation) {
      const cityId = toNumber(queryFilters.propertyLocation);
      const city = citiesById.get(cityId);
      if (city) {
        const cityNorm = normalizeText(city.cityName);
        filtered = filtered.filter(
          (item) =>
            item.cityIdNum === cityId ||
            item.cityNorm.includes(cityNorm) ||
            item.projectAddressNorm.includes(cityNorm)
        );
      }
    }

    if (queryFilters.budget) {
      filtered = filtered.filter((item) =>
        matchesBudgetRangeForProject(item.project, queryFilters.budget)
      );
    }

    if (quickProjectFilter && quickProjectFilter !== "All") {
      const quick = normalizeText(quickProjectFilter);
      filtered = filtered.filter((item) => {
        if (quick === "commercial" || quick === "residential") {
          return item.propertyTypeNorm.includes(quick);
        }
        if (quick === "new launched" || quick === "new launch") {
          return item.statusNorm.includes("new launch");
        }
        return true;
      });
    }

    if (projectFilters.propertyType) {
      const typeId = toNumber(projectFilters.propertyType);
      const typeMeta = projectTypesById.get(typeId);
      const typeName = normalizeText(typeMeta?.projectTypeName || "");

      if (typeName === "new launches" || typeName === "new launch") {
        filtered = filtered.filter((item) => item.statusNorm.includes("new launch"));
      } else {
        filtered = filtered.filter((item) => item.propertyTypeIdNum === typeId);
      }
    }

    if (projectFilters.city) {
      const cityId = toNumber(projectFilters.city);
      const city = citiesById.get(cityId);
      if (city) {
        const cityNorm = normalizeText(city.cityName);
        filtered = filtered.filter(
          (item) =>
            item.cityIdNum === cityId ||
            item.cityNorm.includes(cityNorm) ||
            item.projectAddressNorm.includes(cityNorm)
        );
      }
    }

    if (projectFilters.budget) {
      filtered = filtered.filter((item) =>
        matchesBudgetRangeForProject(item.project, projectFilters.budget)
      );
    }

    if (projectFilters.projectStatus) {
      const statusId = toNumber(projectFilters.projectStatus);
      const status = statusesById.get(statusId);
      if (status) {
        const statusNorm = normalizeText(status.statusName);
        filtered = filtered.filter((item) => item.statusNorm.includes(statusNorm));
      } else {
        filtered = filtered.filter((item) => item.projectStatusIdNum === statusId);
      }
    }

    if (projectFilters.builder) {
      const builderId = toNumber(projectFilters.builder);
      const builder = buildersById.get(builderId);
      if (builder) {
        const builderNorm = normalizeText(builder.builderName);
        filtered = filtered.filter((item) => item.builderNorm.includes(builderNorm));
      } else {
        filtered = filtered.filter((item) => item.builderIdNum === builderId);
      }
    }

    if (projectFilters.bhkType) {
      const selectedBhkNorm = normalizeText(projectFilters.bhkType);
      filtered = filtered.filter((item) =>
        item.bhkTypes.some((bhk) => normalizeText(bhk) === selectedBhkNorm)
      );
    }

    if (projectFilters.possession) {
      const selectedPossession = normalizeText(projectFilters.possession);
      filtered = filtered.filter((item) =>
        item.possessionNorm.includes(selectedPossession)
      );
    }

    if (projectFilters.occupancy) {
      const selectedOccupancy = normalizeText(projectFilters.occupancy);
      filtered = filtered.filter((item) =>
        item.occupancyNorm.includes(selectedOccupancy)
      );
    }

    if (projectFilters.facing) {
      const selectedFacing = normalizeText(projectFilters.facing);
      filtered = filtered.filter((item) => item.facingNorm.includes(selectedFacing));
    }

    return filtered.map((item) => item.project);
  }, [
    indexedProjectList,
    citiesById,
    projectTypesById,
    statusesById,
    buildersById,
    queryFilters,
    quickProjectFilter,
    projectFilters,
  ]);

  const hasActiveProjectFilters = useMemo(() => {
    return Object.values(projectFilters).some(Boolean);
  }, [projectFilters]);

  const activeProjectFilterCount = useMemo(() => {
    return Object.values(projectFilters).filter(Boolean).length;
  }, [projectFilters]);

  const searchProjects = useCallback(async (query) => {
    const q = normalizeText(query);
    if (q.length < 2) return [];

    const words = q.split(" ");

    return (projectList || []).filter((project) => {
      const haystack = normalizeText(
        [
          project?.projectName || project?.name || "",
          project?.cityName || "",
          project?.builderName || "",
          project?.projectAddress || "",
        ].join(" ")
      );

      return words.every((word) => haystack.includes(word));
    });
  }, [projectList]);

  const value = {
    cityList,
    builderList,
    projectTypes,
    projectStatuses,
    projectList,
    filteredProjectList,
    quickProjectFilter,
    projectFilters,
    queryFilters,
    bhkTypes,
    hasActiveProjectFilters,
    activeProjectFilterCount,
    setQuickProjectFilter,
    setProjectFilters,
    resetProjectFilters,
    setQueryFilters,
    clearQueryFilters,
    loading,
    error,
    searchProjects,
  };

  return (
    <SiteDataContext.Provider value={value}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  return useContext(SiteDataContext);
}
