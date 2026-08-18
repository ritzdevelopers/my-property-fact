export const DEFAULT_PROJECT_CARD_IMAGE = "/static/no_image.png";

/** Local card art that should win over CMS thumbnail/banner on listing cards. */
const CARD_THUMBNAIL_OVERRIDES = {
  "fab-luxe-residences": "/static/projects/fab-luxe-residences.jpg",
  "eldeco-7-peaks-residences": "/static/projects/eldeco-7-peaks-residences.jpg",
  "ace-verdea": "/static/projects/ace-verdea.jpg",
  "ace-verde": "/static/projects/ace-verdea.jpg",
};

function getProjectSlug(project) {
  return String(project?.slugURL || project?.slugUrl || "").trim();
}

export function getCardThumbnailOverride(project) {
  const slug = getProjectSlug(project);
  return slug ? CARD_THUMBNAIL_OVERRIDES[slug] || "" : "";
}

export function getProjectImageFilename(project, { preferThumbnail = true } = {}) {
  if (!project || typeof project !== "object") return "";

  if (preferThumbnail) {
    return (
      getCardThumbnailOverride(project) ||
      project.projectThumbnailImage ||
      project.projectBannerImage ||
      project.bannerImage ||
      ""
    );
  }

  return (
    project.projectBannerImage ||
    project.projectThumbnailImage ||
    project.bannerImage ||
    ""
  );
}

export function getProjectImageBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_IMAGE_URL;
  return typeof raw === "string" ? raw : "";
}

export function buildGalleryImageUrl(slug, imageName, { fallback = "" } = {}) {
  const filename = String(imageName || "").trim();
  if (!filename) return fallback;

  if (/^https?:\/\//i.test(filename) || filename.startsWith("/")) {
    return filename;
  }

  const projectSlug = String(slug || "").trim();
  const base = getProjectImageBaseUrl();
  if (!base || !projectSlug) return fallback;

  return `${base}properties/${projectSlug}/${filename}`;
}

/**
 * Card/listing URLs should prefer thumbnails — full banner files are much larger.
 */
export function buildProjectImageUrl(
  project,
  { preferThumbnail = true, fallback = DEFAULT_PROJECT_CARD_IMAGE } = {},
) {
  if (preferThumbnail) {
    const override = getCardThumbnailOverride(project);
    if (override) return override;
  }

  const filename = getProjectImageFilename(project, { preferThumbnail });
  if (!filename) return fallback;

  if (/^https?:\/\//i.test(filename) || filename.startsWith("/")) {
    return filename;
  }

  const slug = getProjectSlug(project);
  const base = getProjectImageBaseUrl();
  if (!base || !slug) return fallback;

  return `${base}properties/${slug}/${filename}`;
}
