import axios from "axios";
import { cache } from "react";
import {
  CITY_SLUG_ALIASES,
  getDisplayCityList,
  resolveCitySlug,
} from "./cityAliasUtils";
import { stripProjectListForClient } from "./siteData/stripProjectForClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
// Function to check if a given slug corresponds to a valid project
export async function checkIfProjectSlug(slug) {
  const projects = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}projects/get/${slug}`,
  );
  if (projects.data.slugURL === slug) {
    return true;
  } else {
    return false;
  }
}

//Fetching all projects
export const fetchAllProjects = cache(async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }
  const res = await fetch(`${apiUrl}projects`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch projects");
  const data = await res.json();
  return stripProjectListForClient(data);
});

//Fetch all projects with cached
export const getAllProjects = fetchAllProjects;

//Fetching all cities
export const fetchCityData = cache(async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }
  const res = await fetch(`${apiUrl}city/all`, {
    next: { revalidate: 60 }, // revalidate every 60 seconds
  });
  if (!res.ok) throw new Error("Failed to fetch cities");
  const data = await res.json();
  return getDisplayCityList(data);
});

// Fetching project types
export const fetchProjectTypes = cache(async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}project-types/get-all`,
      {
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) throw new Error("Failed to fetch project types");
    return res.json();
  } catch (error) {
    console.error("Error fetching project types:", error);
    return {
      success: false,
      message: "Error fetching project types",
      data: [],
    };
  }
});

// Fetching builder data
export const fetchBuilderData = cache(async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}builder/get-all-builders`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch builders");
  return res.json();
});

export const fetchProjectDetailsBySlug = cache(async (slug) => {
  if (!apiUrl || slug == null || String(slug).trim() === "") {
    return "";
  }
  const clean = String(slug).trim();
  const res = await fetch(`${apiUrl}projects/get/${encodeURIComponent(clean)}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    return "";
  }
  let data;
  try {
    data = await res.json();
  } catch {
    return "";
  }
  if (!data || typeof data !== "object") return "";
  const resolvedSlug =
    data.slugURL != null ? String(data.slugURL).trim() : data.slugUrl != null ? String(data.slugUrl).trim() : "";
  if (!resolvedSlug) return "";
  if (resolvedSlug.toLowerCase() !== clean.toLowerCase()) return "";
  return data;
});

/**
 * Canonical BHK segment for URLs globally: "3bhk" → "3-bhk" (matches internal links).
 */
export function normalizeFloorSlugSegment(segment) {
  if (segment == null || segment === "") return "";
  const s = String(segment)
    .trim()
    .toLowerCase()
    .replace(/%20/g, "-");
  if (/^\d+bhk$/.test(s)) {
    return s.replace(/^(\d+)(bhk)$/, "$1-$2");
  }
  return s;
}

// /**
//  * Canonical `{floor}-in-{city}` slug: normalized floor segment + lowercase hyphenated city.
//  * Returns null if the path does not contain `-in-`.
//  */
export function canonicalizeFloorInCitySlug(slug) {
  if (!slug || typeof slug !== "string" || !slug.includes("-in-")) return null;
  const segments = slug.split("-in-");
  if (segments.length < 2) return null;
  const floorNorm = normalizeFloorSlugSegment(segments[0]);
  const cityPart = segments.slice(1).join("-in-");
  const cityNorm = resolveCitySlug(
    cityPart
      .trim()
      .toLowerCase()
      .replace(/%20/g, "-")
      .replace(/\s+/g, "-"),
  );
  if (!floorNorm || !cityNorm) return null;
  return `${floorNorm}-in-${cityNorm}`;
}

/** Longest first — matched as suffix on the segment before `-in-` (e.g. `3-bhk-new-projects-in-delhi`). */
export const LISTING_URL_CATEGORY_SEGMENTS = [
  "new-projects",
  "offices-and-shop",
  "apartments",
  "commercial",
];

/** True when slug segment is a numeric BHK only (e.g. `3-bhk`), not plot/office/villa. */
export function isBhkFloorSlugSegment(slug) {
  const s = normalizeFloorSlugSegment(slug || "");
  return /^\d+-bhk$/.test(s);
}

/**
 * Parses `{floor}-{category}-in-{city}` listing URLs for **BHK only**.
 * Non-BHK floors use `{floor}-in-{city}` (no category segment).
 */
export function parseCompoundFloorListingSlug(slug) {
  if (!slug || typeof slug !== "string" || !slug.includes("-in-")) return null;
  const segments = slug.split("-in-");
  if (segments.length < 2) return null;
  const citySlug = resolveCitySlug(
    segments
      .slice(1)
      .join("-in-")
      .trim()
      .toLowerCase()
      .replace(/%20/g, "-")
      .replace(/\s+/g, "-"),
  );
  const prefix = segments[0];
  if (!prefix || !citySlug) return null;

  for (const cat of LISTING_URL_CATEGORY_SEGMENTS) {
    const suffix = `-${cat}`;
    if (prefix.endsWith(suffix)) {
      const floorPart = prefix.slice(0, -suffix.length);
      if (!floorPart) continue;
      const floorSlug = normalizeFloorSlugSegment(floorPart);
      if (!isBhkFloorSlugSegment(floorSlug)) return null;
      return {
        floorSlug,
        categorySlug: cat,
        citySlug,
      };
    }
  }
  return null;
}

export function floorSlugToListingLabel(floorSlug) {
  if (!floorSlug) return "";
  const s = String(floorSlug).toLowerCase();
  const bhk = s.match(/^(\d+)-bhk$/);
  if (bhk) return `${bhk[1]} BHK`;
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function categorySlugToListingLabel(categorySlug) {
  if (!categorySlug) return "";
  if (categorySlug === "new-projects") return "New Projects";
  if (categorySlug === "offices-and-shop") return "Offices and Shop";
  return categorySlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function citySlugToListingLabel(citySlug) {
  if (!citySlug) return "";
  return citySlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function buildCompoundListingTitle(parsed) {
  if (!parsed) return "";
  const floor = floorSlugToListingLabel(parsed.floorSlug);
  const city = citySlugToListingLabel(parsed.citySlug);
  const cat = categorySlugToListingLabel(parsed.categorySlug);
  return `${floor} ${cat} In ${city}`;
}

//Fetch all floor plans — slug set is cached once per server request (heavy API).
const KNOWN_FLOOR_SLUGS_FALLBACK = [
  "offices-and-shop",
  "offices-and-shops",
  "office-and-shop",
  "offices",
  "shops",
  "office",
  "shop",
];

const getFloorPlanUniqueUrls = cache(async () => {
  if (!apiUrl) return new Set();
  try {
    const res = await fetch(`${apiUrl}floor-plans/get-all`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return new Set();
    const data = await res.json();
    if (!Array.isArray(data)) return new Set();
    const uniqueUrls = new Set();
    data.forEach((project) => {
      if (Array.isArray(project.plans)) {
        project.plans.forEach((plan) => {
          if (plan.planType) {
            const slugified = plan.planType
              .trim()
              .toLowerCase()
              .replace(/\s+/g, "-");
            uniqueUrls.add(slugified);
            uniqueUrls.add(normalizeFloorSlugSegment(slugified));
          }
        });
      }
    });
    return uniqueUrls;
  } catch {
    return new Set();
  }
});

export const isFloorTypeUrl = async (slug) => {
  if (!slug || typeof slug !== "string") return false;
  const uniqueUrls = await getFloorPlanUniqueUrls();
  const floorType = slug.split("-in-")[0];
  const floorSlug = normalizeFloorSlugSegment(floorType);
  const floorLower = floorType.toLowerCase();
  return (
    uniqueUrls.has(floorSlug) ||
    uniqueUrls.has(floorLower) ||
    KNOWN_FLOOR_SLUGS_FALLBACK.includes(floorSlug) ||
    KNOWN_FLOOR_SLUGS_FALLBACK.includes(floorLower)
  );
};

//Checking is ctiy slug
export const isCityTypeUrl = async (slug) => {
  const cities = await fetchCityData();
  const slugParts = slug.split("-in-");
  const isFloorUrl = await isFloorTypeUrl(slug);
  const rawCitySlug = slugParts[slugParts.length - 1]
    .replace("%20", "-")
    .toLowerCase();
  const citySlug = resolveCitySlug(rawCitySlug);
  const exists = cities.some((item) => {
    const itemSlug = item.slugURL
      ? resolveCitySlug(item.slugURL)
      : resolveCitySlug(item.cityName.toLowerCase().replace(/\s+/g, "-"));
    return itemSlug === citySlug && !isFloorUrl;
  });
  return (
    exists ||
    (rawCitySlug !== citySlug && Boolean(CITY_SLUG_ALIASES[rawCitySlug]))
  );
};

// fetching blogs list from api
export const fetchBlogs = cache(async (page, size, search = "", fromSegment = "blog") => {
  const res = await fetch(
    `${apiUrl}blog/get?page=${page}&size=${size}&from=${fromSegment}&search=${search}`,
    {
      next: { revalidate: 60 },
    },
  );
  if (!res.ok) throw new Error("Failed to fetch blogs");
  const blogsData = await res.json();
  // Handle different response structures: could be array, object with data array, or object with total
  const blogsArray = Array.isArray(blogsData)
    ? blogsData
    : blogsData?.data || blogsData?.blogs || [];
  const total = blogsData?.total || blogsData?.totalCount || blogsArray.length;
  return blogsData;
});

/** Latest blogs in API order — same as `/blog` page 1 and sidebar recent posts. */
export const fetchLatestBlogs = cache(async (limit = 3) => {
  const data = await fetchBlogs(0, limit, "");
  const list = data?.content ?? [];
  return Array.isArray(list) ? list.slice(0, limit) : [];
});

/** Single blog by slug — server-side fetch (use in RSC / generateMetadata). */
export const fetchBlogBySlug = cache(async (slug) => {
  if (!slug || !apiUrl) return null;
  try {
    const res = await fetch(
      `${apiUrl}blog/get/${encodeURIComponent(String(slug).trim())}`,
      {
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
});

/** Full blog list for admin-style endpoints — cached; call only from server / server actions. */
export const fetchBlogGetAll = cache(async () => {
  if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is not defined");
  const res = await fetch(`${apiUrl}blog/get-all`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch blogs");
  return res.json();
});

//Get projects in parts
export const getProjectsInPart = cache(async (page, size, category = "All") => {
  const project = await fetch(
    `${apiUrl}projects/get-projects-in-parts?page=${page}&size=${size}`,
    {
      next: { revalidate: 60 },
    },
  );
  if (!project.ok) throw new Error("Failed to fetch blogs");
  const projectPartData = await project.json();
  switch (category) {
    case "Commercial":
      projectPartData.filter((item) => item.propertyTypeName === category);
      break;
    case "Residential":
      projectPartData.filter((item) => item.propertyTypeName === category);
      break;
    case "New Launch":
      projectPartData.filter((item) => item.propertyTypeName === category);
      break;
    default:
      projectPartData;
      break;
  }
  return projectPartData;
});

//Fetch all benefits from server
export const fetchAllBenefits = cache(async () => {
  const benefits = await fetch(`${process.env.NEXT_PUBLIC_API_URL}benefit`, {
    method: "Get",
  });
  if (!benefits.ok) throw new Error("Failed to fetch benefits");
  const benefitData = await benefits.json();
  return benefitData;
});

//Fetch all webstories from server
export const fetchAllStories = cache(async () => {
  const stories = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}web-story-category/get-all`,
    {
      next: { revalidate: 60 },
    },
  );
  if (!stories.ok) throw new Error("Failed to fetch stories");
  const storiesData = await stories.json();
  return storiesData.reverse();
});

// Getting top project (weekly rotation from all projects)
export const getWeeklyProject = (projects) => {
  const residentialProjects = projects.filter(
    (project) => project.propertyTypeName === "Residential",
  );
  if (residentialProjects.length === 0) {
    return null;
  }
  const now = new Date();
  const weekNumber = Math.floor(now.getTime() / (10 * 24 * 60 * 60 * 1000));
  const index = weekNumber % residentialProjects.length;
  return residentialProjects[index];
};

const TOP_PICKS_BUILDERS = [
  "saya-homes",
  "eldeco",
  "m3m",
  "smartworld",
  "ghd-infra",
];

const TOP_PICKS_PROJECT_SLUG = "eldeco-camelot";

const TOP_PICKS_PERIOD_MS = 4 * 24 * 60 * 60 * 1000;

function normalizeTopPickProject(project, builderName, builderSlug) {
  const sortAt =
    project.updatedAt ?? project.createdAt ?? project.projectId ?? project.id;
  return {
    builderName: builderName ?? project.builderName,
    builderSlug: builderSlug ?? project.builderSlug ?? project.builderSlugURL,
    projectName: project.projectName,
    projectAddress: project.projectAddress,
    projectConfiguration: project.projectConfiguration,
    projectPrice: project.projectPrice,
    projectLogo: project.projectLogo ?? project.projectLogoImage,
    projectBannerImage:
      project.projectBannerImage ??
      project.projectThumbnailImage ??
      project.bannerImage,
    slugURL: project.slugURL,
    propertyTypeName: project.propertyTypeName,
    projectStatusName:
      project.projectStatusName?.trim() ||
      (typeof project.projectStatus === "string"
        ? project.projectStatus.trim()
        : "") ||
      null,
    _sortAt: sortAt ?? 0,
  };
}

function toSortValue(v) {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  const d = new Date(v).getTime();
  return Number.isNaN(d) ? 0 : d;
}
function sortByLatest(a, b) {
  return toSortValue(b._sortAt) - toSortValue(a._sortAt);
}

/** Fetches the current Top Pick. Featured builder rotates every 4 days; we show that builder's latest project only. */
export const fetchTopPicksProject = cache(async () => {
  if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is not defined");
  const allProjects = await fetchAllProjects();
  const pinnedProject = Array.isArray(allProjects)
    ? allProjects.find((project) => project.slugURL === TOP_PICKS_PROJECT_SLUG)
    : null;

  if (pinnedProject) {
    const normalizedPinnedProject = normalizeTopPickProject(
      pinnedProject,
      pinnedProject.builderName ?? "Eldeco",
      pinnedProject.builderSlug ?? pinnedProject.builderSlugURL ?? "eldeco",
    );
    delete normalizedPinnedProject._sortAt;
    return normalizedPinnedProject;
  }

  const results = await Promise.allSettled(
    TOP_PICKS_BUILDERS.map((slug) =>
      fetch(`${apiUrl}builder/get/${slug}`, { next: { revalidate: 60 } }),
    ),
  );
  const byBuilder = new Map();
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const slug = TOP_PICKS_BUILDERS[i];
    if (r.status !== "fulfilled" || !r.value.ok) continue;
    let data;
    try {
      data = await r.value.json();
    } catch {
      continue;
    }
    const builderName = data.builderName ?? data.name;
    const list = Array.isArray(data.projectList) ? data.projectList : [];
    const residential = list
      .filter((p) => p.propertyTypeName === "Residential")
      .map((p) => normalizeTopPickProject(p, builderName, slug));
    residential.sort(sortByLatest);
    byBuilder.set(slug, residential);
  }
  // Which builder is at “index 0” this 4-day period (rotates: saya → eldeco → m3m → smartworld → ghd → saya…)
  const periodIndex =
    Math.floor(Date.now() / TOP_PICKS_PERIOD_MS) % TOP_PICKS_BUILDERS.length;
  const featuredSlug = TOP_PICKS_BUILDERS[periodIndex];
  let pool = byBuilder.get(featuredSlug) ?? [];
  if (pool.length === 0) {
    for (const slug of TOP_PICKS_BUILDERS) {
      pool = byBuilder.get(slug) ?? [];
      if (pool.length > 0) break;
    }
  }
  if (pool.length === 0) return null;
  const picked = pool[0];
  delete picked._sortAt;
  return picked;
});

// Getting top project
export const fetchProjectStatus = cache(async () => {
  try {
    const res = await fetch(
      `${apiUrl}project-status`,
      {
        method: "GET",
      },
      {
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) throw new Error("Failed to fetch project status");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching project status:", error);
    return {
      success: false,
      message: "Error fetching project status",
      data: [],
    };
  }
});

// Fetching all projects by project type
export const fetchAllProjectsByProjectType = cache(async (projectType) => {
  const projects = await fetch(`${apiUrl}project-types/get/${projectType}`, {
    next: { revalidate: 60 },
  });
  if (!projects.ok) throw new Error("Failed to fetch projects");
  const projectsData = await projects.json();
  if (Array.isArray(projectsData?.projectList)) {
    return {
      ...projectsData,
      projectList: stripProjectListForClient(projectsData.projectList),
    };
  }
  return projectsData;
});

/** Master list of nearby benefit icons (location benefits). Cached for project pages. */
export const fetchNearbyBenefitsAll = cache(async () => {
  if (!apiUrl) return [];
  try {
    const res = await fetch(`${apiUrl}nearby-benefit/get-all`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching nearby-benefit/get-all:", error);
    return [];
  }
});

// fetching builder details by slug
export const fetchBuilderDetails = cache(async (slug) => {
  const response = await fetch(`${apiUrl}builder/get/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!response.ok) throw new Error("Failed to fetch builder details");
  return response.json();
});
