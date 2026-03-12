import axios from "axios";
import { cache } from "react";

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
  return data;
});

//Fetch all projects with cached
export const getAllProjects = cache(async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }
  const res = await fetch(`${apiUrl}projects`, {
    next: { revalidate: 60 }, // ISR: refresh every 60s
  });
  if (!res.ok) throw new Error("Failed to fetch projects");
  const data = await res.json();
  return data;
});

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
  return data;
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
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}builder/get-all`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch builders");
  return res.json();
});

// Fetching project details by slug
export const fetchProjectDetailsBySlug = cache(async (slug) => {
  const projects = await fetchAllProjects();
  const res = projects?.filter((item) => item.slugURL === slug);
  if (res.length === 0) return "";

  const projectBySlug = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}projects/get/${slug}`,
    {
      next: { revalidate: 60 },
    },
  );
  if (!projectBySlug.ok) throw new Error("Failed to fetch project details");
  return projectBySlug.json();
});

//Fetch all floor plans
export const isFloorTypeUrl = async (slug) => {
  const res = await fetch(`${apiUrl}floor-plans/get-all`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch project details");
  const data = await res.json(); // array of projects'
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
        }
      });
    }
  });
  const floorType = slug.split("-in-")[0];
  const floorSlug = floorType.toLowerCase();
  // Fallback: known floor types that may not be in floor-plans API (e.g. offices-and-shop)
  const knownFloorSlugs = [
    "offices-and-shop",
    "offices-and-shops",
    "office-and-shop",
    "offices",
    "shops",
    "office",
    "shop",
  ];
  return uniqueUrls.has(floorSlug) || knownFloorSlugs.includes(floorSlug);
};

//Checking is ctiy slug
export const isCityTypeUrl = async (slug) => {
  const cities = await fetchCityData();
  const slugParts = slug.split("-in-");
  const isFloorUrl = await isFloorTypeUrl(slug);
  const citySlug = slugParts[slugParts.length - 1]
    .replace("%20", "-")
    .toLowerCase();
  const exists = cities.some(
    (item) =>
      item.cityName.toLowerCase().replace(/\s+/g, "-") === citySlug &&
      !isFloorUrl,
  );
  return exists;
};

// fetching blogs list from api
export const fetchBlogs = cache(async (page, size, search = "") => {
  const res = await fetch(
    `${apiUrl}blog/get?page=${page}&size=${size}&from=${"blog"}&search=${search}`,
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
  return projectsData;
});

// fetching builder details by slug
export const fetchBuilderDetails = cache(async (slug) => {
  const response = await fetch(`${apiUrl}builder/get/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!response.ok) throw new Error("Failed to fetch builder details");
  return response.json();
});
