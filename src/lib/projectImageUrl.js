export const DEFAULT_PROJECT_CARD_IMAGE = "/static/no_image.png";

export function getProjectImageFilename(project, { preferThumbnail = true } = {}) {
  if (!project || typeof project !== "object") return "";

  if (preferThumbnail) {
    return (
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
  const filename = getProjectImageFilename(project, { preferThumbnail });
  if (!filename) return fallback;

  if (/^https?:\/\//i.test(filename) || filename.startsWith("/")) {
    return filename;
  }

  const slug = project?.slugURL || project?.slugUrl;
  const base = getProjectImageBaseUrl();
  if (!base || !slug) return fallback;

  return `${base}properties/${slug}/${filename}`;
}
