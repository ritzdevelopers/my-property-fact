const API_BASE = String(process.env.NEXT_PUBLIC_API_URL || "").trim();

export function buildProjectListingParams({
  page = 1,
  limit = 10,
  tab = "all",
  filters = {},
  quick = "",
  sort = "relevance",
  q = "",
  projectId = "",
  slug = "",
  suggest = false,
} = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (tab && tab !== "all") params.set("tab", tab);
  if (filters.city) params.set("city", filters.city);
  if (filters.budget) params.set("budget", filters.budget);
  if (filters.projectStatus) params.set("projectStatus", filters.projectStatus);
  if (filters.bhkType) params.set("bhkType", filters.bhkType);
  if (filters.configType) params.set("configType", filters.configType);
  if (quick) params.set("quick", quick);
  if (sort && sort !== "relevance") params.set("sort", sort);
  if (q) params.set("q", q);
  if (projectId) params.set("projectId", String(projectId));
  if (slug) params.set("slug", slug);
  if (suggest) params.set("suggest", "true");
  return params;
}

export async function fetchProjectListingPage(options, { signal } = {}) {
  if (!API_BASE) {
    return { projects: [], total: 0, totalPages: 1, page: 1, limit: 10, quickFilterCounts: {} };
  }
  const params = buildProjectListingParams(options);
  const response = await fetch(
    `${API_BASE}projects/get-projects-in-parts?${params.toString()}`,
    { signal },
  );
  if (!response.ok) {
    throw new Error(`Project listing failed (${response.status})`);
  }
  const data = await response.json();
  if (Array.isArray(data)) {
    return {
      projects: data,
      total: data.length,
      totalPages: 1,
      page: 1,
      limit: data.length || 10,
      quickFilterCounts: {},
    };
  }
  return {
    projects: Array.isArray(data?.projects) ? data.projects : [],
    total: Number(data?.total) || 0,
    totalPages: Math.max(1, Number(data?.totalPages) || 1),
    page: Number(data?.page) || 1,
    limit: Number(data?.limit) || 10,
    quickFilterCounts: data?.quickFilterCounts || {},
  };
}
