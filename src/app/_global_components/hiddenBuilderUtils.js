/**
 * Builders (and their projects) omitted from public lists, search, and pages.
 */

const HIDDEN_BUILDER_SLUGS = new Set(["ashiana-housing"]);
const HIDDEN_BUILDER_NAMES = new Set(["ashiana housing", "ashiana"]);
const HIDDEN_PROJECT_SLUGS = new Set([
  "ashiana-aaroham",
  "ashiana-amarah",
  "ashiana-anmol",
  "ashiana-mulberry",
  "ashiana-mulberry-blossom",
]);

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .trim();
}

function builderSlugOf(entity) {
  if (!entity || typeof entity !== "object") return "";
  return normalize(
    entity.slugUrl ||
      entity.slugURL ||
      entity.slug ||
      entity.builderSlug ||
      entity.builderSlugURL ||
      entity.builder?.slugUrl ||
      entity.builder?.slugURL ||
      entity.builder?.slug,
  );
}

function builderNameOf(entity) {
  if (!entity || typeof entity !== "object") return "";
  return normalize(
    entity.builderName ||
      entity.name ||
      entity.builder?.builderName ||
      entity.builder?.name,
  );
}

function projectSlugOf(project) {
  if (!project || typeof project !== "object") return "";
  return normalize(project.slugURL || project.slugUrl || project.slug);
}

export function isHiddenBuilderSlug(slug) {
  return HIDDEN_BUILDER_SLUGS.has(normalize(slug));
}

export function isHiddenProjectSlug(slug) {
  const clean = normalize(slug);
  return HIDDEN_PROJECT_SLUGS.has(clean) || clean.startsWith("ashiana-");
}

export function isHiddenBuilder(builder) {
  if (!builder) return false;
  if (typeof builder === "string") {
    const clean = normalize(builder);
    return HIDDEN_BUILDER_SLUGS.has(clean) || HIDDEN_BUILDER_NAMES.has(clean);
  }
  const slug = builderSlugOf(builder);
  const name = builderNameOf(builder);
  return (
    HIDDEN_BUILDER_SLUGS.has(slug) ||
    HIDDEN_BUILDER_NAMES.has(name) ||
    name.startsWith("ashiana")
  );
}

export function isHiddenProject(project) {
  if (!project) return false;
  if (typeof project === "string") return isHiddenProjectSlug(project);
  return (
    isHiddenProjectSlug(projectSlugOf(project)) ||
    isHiddenBuilder(project)
  );
}

export function filterHiddenBuilders(builders) {
  return (builders || []).filter((builder) => !isHiddenBuilder(builder));
}

export function filterHiddenProjects(projects) {
  return (projects || []).filter((project) => !isHiddenProject(project));
}

/** Strip hidden projects from common API payload shapes. */
export function filterHiddenProjectsFromPayload(data) {
  if (!data) return data;
  if (Array.isArray(data)) return filterHiddenProjects(data);
  if (typeof data !== "object") return data;

  const next = { ...data };
  for (const key of ["projectList", "projects", "data", "content"]) {
    if (Array.isArray(next[key])) {
      next[key] = filterHiddenProjects(next[key]);
    }
  }
  return next;
}
