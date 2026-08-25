import axios from "axios";
import { cache } from "react";
import {
  getDisplayCityList,
  resolveCitySlug,
} from "./cityAliasUtils";
import {
  canonicalFloorSlugForUrl,
  floorSlugToListingLabel,
  hasCompoundListingDataInCity,
  hasFloorListingDataInCity as hasFloorListingDataForProjects,
} from "../../lib/listingFloorValidation";

export { floorSlugToListingLabel } from "../../lib/listingFloorValidation";

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
    console.error("NEXT_PUBLIC_API_URL is not defined");
    return [];
  }
  try {
    const res = await fetch(`${apiUrl}projects`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch projects");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
});

//Fetch all projects with cached
export const getAllProjects = fetchAllProjects;

//Fetching all cities
export const fetchCityData = cache(async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error("NEXT_PUBLIC_API_URL is not defined");
    return [];
  }
  try {
    const res = await fetch(`${apiUrl}city/all`, {
      next: { revalidate: 60 }, // revalidate every 60 seconds
    });
    if (!res.ok) throw new Error("Failed to fetch cities");
    const data = await res.json();
    return getDisplayCityList(data);
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error("NEXT_PUBLIC_API_URL is not defined");
    return { builders: [] };
  }
  try {
    const res = await fetch(`${apiUrl}builder/get-all-builders`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch builders");
    return res.json();
  } catch (error) {
    console.error("Error fetching builders:", error);
    return { builders: [] };
  }
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
  const floorNorm = canonicalFloorSlugForUrl(segments[0]);
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

const CITY_HUB_PREFIXES = [
  "apartments-in-",
  "flats-in-",
  "new-projects-in-",
  "commercial-property-in-",
  "offices-and-shop-in-",
];

/**
 * Detects listing URLs that embed a valid hub segment without starting with it
 * (e.g. `xyzcommercial-property-in-gurugram`, `23e2apartments-in-faridabad`).
 */
export function isMalformedListingSlug(slug) {
  if (!slug || typeof slug !== "string") return false;
  const lower = slug.toLowerCase();

  for (const prefix of CITY_HUB_PREFIXES) {
    const idx = lower.indexOf(prefix);
    if (idx <= 0) continue;

    const before = lower.slice(0, idx);
    const catSlug = prefix.replace(/-in-$/, "");
    if (LISTING_URL_CATEGORY_SEGMENTS.includes(catSlug)) {
      const floorSegment = before.endsWith("-") ? before.slice(0, -1) : before;
      if (isBhkFloorSlugSegment(floorSegment)) continue;
    }
    return true;
  }
  return false;
}

async function hasFloorListingDataInCity(citySlug, floorSlug) {
  if (!(await isKnownCitySlug(resolveCitySlug(citySlug)))) return false;
  const projects = await fetchAllProjects();
  return hasFloorListingDataForProjects(projects, citySlug, floorSlug);
}

/** Validates `{bhk}-{category}-in-{city}` — city + category + matching project data. */
export async function isValidCompoundFloorListing(parsed) {
  if (!parsed?.floorSlug || !parsed?.citySlug || !parsed?.categorySlug) {
    return false;
  }
  if (!(await isKnownCitySlug(parsed.citySlug))) return false;
  const projects = await fetchAllProjects();
  const compoundKey = `${parsed.floorSlug}-${parsed.categorySlug}`;
  return hasCompoundListingDataInCity(projects, parsed.citySlug, compoundKey);
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

/** Whether a city segment (e.g. gurugram, gurgaon) maps to a known city. */
export async function isKnownCitySlug(citySlug) {
  try {
    const canonical = resolveCitySlug(
      String(citySlug || "")
        .trim()
        .toLowerCase()
        .replace(/%20/g, "-"),
    );
    if (!canonical) return false;
    const cities = await fetchCityData();
    return cities.some((item) => {
      if (item.isActive === false) return false;
      const itemSlug = item.slugURL
        ? resolveCitySlug(item.slugURL)
        : resolveCitySlug(item.cityName.toLowerCase().replace(/\s+/g, "-"));
      return itemSlug === canonical;
    });
  } catch {
    return false;
  }
}

/**
 * Validates `{floor}-in-{city}` — floor type must exist in that city's project data.
 * e.g. `/8-bhk-in-gurugram` → 404 unless a Gurugram project lists 8 BHK.
 */
export const isFloorTypeUrl = async (slug) => {
  if (!slug || typeof slug !== "string" || !slug.includes("-in-")) {
    return false;
  }
  const slugParts = slug.split("-in-");
  const cityPart = slugParts.slice(1).join("-in-");
  const floorSlug = normalizeFloorSlugSegment(slugParts[0] || "");
  if (!floorSlug || !cityPart) return false;
  return hasFloorListingDataInCity(cityPart, floorSlug);
};

/** Exported alias used by metadata guards. */
export const isValidFloorInCityListing = isFloorTypeUrl;

/** Validates city hub URLs: `flats-in-gurugram`, `apartments-in-delhi`, etc. */
export const isCityTypeUrl = async (slug) => {
  if (!slug || typeof slug !== "string") return false;
  const lower = slug.toLowerCase();
  for (const prefix of CITY_HUB_PREFIXES) {
    if (!lower.startsWith(prefix)) continue;
    const cityPart = lower.slice(prefix.length);
    if (!cityPart) return false;
    return isKnownCitySlug(cityPart);
  }
  return false;
};

const STATIC_PROJECT_TYPE_SLUGS = new Set([
  "commercial",
  "residential",
  "new-launches",
]);

function normalizeProjectTypeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

/** Returns canonical slug when valid, otherwise null. */
export async function resolveValidProjectTypeSlug(slug) {
  try {
    const norm = normalizeProjectTypeSlug(slug);
    if (!norm) return null;
    if (STATIC_PROJECT_TYPE_SLUGS.has(norm)) return norm;
    const types = await fetchProjectTypes();
    const list = Array.isArray(types) ? types : types?.data || [];
    const match = list.find(
      (item) =>
        normalizeProjectTypeSlug(item?.slugUrl || item?.slugURL) === norm,
    );
    return match ? norm : null;
  } catch {
    return null;
  }
}

export const fetchCityDetailsBySlug = cache(async (slug) => {
  if (!apiUrl || slug == null || String(slug).trim() === "") return null;
  const clean = String(slug).trim();
  const canonical = resolveCitySlug(clean) || clean.toLowerCase();
  if (!(await isKnownCitySlug(canonical))) return null;
  try {
    const res = await fetch(
      `${apiUrl}city/get/${encodeURIComponent(canonical)}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || typeof data !== "object") return null;
    const resolvedSlug = resolveCitySlug(
      data.slugURL || data.slugUrl || canonical,
    );
    if (resolvedSlug !== canonical) return null;
    return data;
  } catch {
    return null;
  }
});

const EMPTY_BLOGS_PAGE = {
  content: [],
  totalPages: 0,
  total: 0,
  totalCount: 0,
};

// fetching blogs list from api — never throw (Vercel build / API outages must not fail prerender)
export const fetchBlogs = cache(async (page, size, search = "", fromSegment = "blog") => {
  if (!apiUrl) {
    console.error("NEXT_PUBLIC_API_URL is not defined");
    return EMPTY_BLOGS_PAGE;
  }
  try {
    const res = await fetch(
      `${apiUrl}blog/get?page=${page}&size=${size}&from=${fromSegment}&search=${search}`,
      {
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) {
      console.error("Failed to fetch blogs:", res.status);
      return EMPTY_BLOGS_PAGE;
    }
    const blogsData = await res.json();
    // Handle different response structures: could be array, object with data array, or object with total
    if (Array.isArray(blogsData)) {
      return {
        content: blogsData,
        totalPages: 1,
        total: blogsData.length,
        totalCount: blogsData.length,
      };
    }
    return blogsData ?? EMPTY_BLOGS_PAGE;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return EMPTY_BLOGS_PAGE;
  }
});

/** Latest blogs in API order — same as `/blog` page 1 and sidebar recent posts. */
export const fetchLatestBlogs = cache(async (limit = 3) => {
  try {
    const data = await fetchBlogs(0, limit, "");
    const list = data?.content ?? [];
    return Array.isArray(list) ? list.slice(0, limit) : [];
  } catch (error) {
    console.error("Error fetching latest blogs:", error);
    return [];
  }
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
  if (!apiUrl) {
    console.error("NEXT_PUBLIC_API_URL is not defined");
    return [];
  }
  try {
    const res = await fetch(`${apiUrl}blog/get-all`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      console.error("Failed to fetch blogs (get-all):", res.status);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching blogs (get-all):", error);
    return [];
  }
});

//Get projects in parts
export const getProjectsInPart = cache(async (page, size, category = "All") => {
  if (!apiUrl) return [];
  try {
    const project = await fetch(
      `${apiUrl}projects/get-projects-in-parts?page=${page}&size=${size}`,
      {
        next: { revalidate: 60 },
      },
    );
    if (!project.ok) {
      console.error("Failed to fetch projects in parts:", project.status);
      return [];
    }
    const projectPartData = await project.json();
    if (!Array.isArray(projectPartData)) return projectPartData;
    switch (category) {
      case "Commercial":
      case "Residential":
      case "New Launch":
        return projectPartData.filter((item) => item.propertyTypeName === category);
      default:
        return projectPartData;
    }
  } catch (error) {
    console.error("Error fetching projects in parts:", error);
    return [];
  }
});

//Fetch all benefits from server
export const fetchAllBenefits = cache(async () => {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return [];
  try {
    const benefits = await fetch(`${base}benefit`, {
      method: "GET",
      next: { revalidate: 60 },
    });
    if (!benefits.ok) {
      console.error("Failed to fetch benefits:", benefits.status);
      return [];
    }
    return benefits.json();
  } catch (error) {
    console.error("Error fetching benefits:", error);
    return [];
  }
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

const TOP_PICKS_PROJECT_SLUG = "eldeco-7-peaks-residences";

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
  if (!apiUrl) {
    console.error("NEXT_PUBLIC_API_URL is not defined");
    return null;
  }
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

// Fetching all projects by project type (returns null when slug is invalid)
export const fetchAllProjectsByProjectType = cache(async (projectType) => {
  const validSlug = await resolveValidProjectTypeSlug(projectType);
  if (!validSlug) return null;
  try {
    const projects = await fetch(
      `${apiUrl}project-types/get/${encodeURIComponent(validSlug)}`,
      { next: { revalidate: 60 } },
    );
    if (!projects.ok) return null;
    const projectsData = await projects.json();
    if (!projectsData || typeof projectsData !== "object") return null;
    return projectsData;
  } catch {
    return null;
  }
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

// fetching builder details by slug (returns null when slug is invalid)
export const fetchBuilderDetails = cache(async (slug) => {
  if (!apiUrl || slug == null || String(slug).trim() === "") return null;
  const clean = String(slug).trim();
  try {
    const response = await fetch(
      `${apiUrl}builder/get/${encodeURIComponent(clean)}`,
      { next: { revalidate: 60 } },
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (!data || typeof data !== "object") return null;
    const resolvedSlug = String(data.slugUrl || data.slugURL || "")
      .trim()
      .toLowerCase();
    if (!resolvedSlug || resolvedSlug !== clean.toLowerCase()) return null;
    return data;
  } catch {
    return null;
  }
});
