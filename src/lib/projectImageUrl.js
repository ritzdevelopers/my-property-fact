export const DEFAULT_PROJECT_CARD_IMAGE = "/static/no_image.png";

/** Local card art that should win over CMS thumbnail/banner on listing cards. */
const CARD_THUMBNAIL_OVERRIDES = {
  "fab-luxe-residences": "/static/projects/fab-luxe-residences.jpg",
  "eldeco-7-peaks-residences": "https://apis.mypropertyfact.in/api/v1/get/images/properties/eldeco-7-peaks-residences/1771218946822_Eldeco_7_Peaks_Residences_Desktop_Banner_2_-_My_Property_Fact.jpg",
  "ace-verdea": "/static/projects/ace-verdea.jpg",
  "ace-verde": "/static/projects/ace-verdea.jpg",
  "ace-yxp": "/static/projects/ace-yxp.jpg",
  "experion-saatori": "/static/projects/experion-saatori.jpg",
  "smartworld-elie-saab": "/static/projects/smartworld-elie-saab.jpg",
  "rg-pleiaddes": "/static/projects/rg-pleiaddes.jpg",
  "clove-county": "/static/projects/clove-county.jpg",
  "ace-terra": "/static/projects/ace-terra.jpg",
  "3c-lotus-panache": "/static/projects/3c-lotus-panache.jpg",
  "ace-parkway": "/static/projects/ace-parkway.jpg",
  "3c-lotus-zing": "/static/projects/3c-lotus-zing.jpg",
  "3c-lotus-boulevard": "/static/projects/3c-lotus-boulevard.jpg",
  "ace-starlit-sector-152-noida": "/static/projects/ace-starlit-sector-152-noida.jpg",
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
