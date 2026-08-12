import PopularProjectPromoClient from "./PopularProjectPromoClient";
import { fetchAllProjects } from "@/app/_global_components/masterFunction";
import {
  DELHI_NCR_POPULAR_PROJECT_SLUGS,
  POPULAR_PROMO_MAX_ITEMS,
  resolvePopularProjectsFromSlugs,
} from "./popularRightNowProjects";

function imageBaseUrl() {
  const raw = (process.env.NEXT_PUBLIC_IMAGE_URL || "").trim();
  if (!raw) return "";
  return raw.endsWith("/") ? raw : `${raw}/`;
}

function buildImageUrl(project) {
  const slug = project?.slugURL || project?.slugUrl;
  const raw =
    project?.projectBannerImage ||
    project?.projectThumbnailImage ||
    project?.bannerImage ||
    "";
  if (typeof raw === "string" && raw.startsWith("http")) return raw;
  const base = imageBaseUrl();
  if (base && slug && raw) return `${base}properties/${slug}/${raw}`;
  return "/static/no_image.png";
}

function toItem(project) {
  const slug = project?.slugURL || project?.slugUrl;
  if (!slug) return null;
  const name = String(project.projectName || "").trim() || "Project";
  return {
    key: slug,
    name,
    href: `/${slug}`,
    imageUrl: buildImageUrl(project),
  };
}

/**
 * SSR fallback: Delhi-NCR curated tick projects before geolocation resolves.
 */
export default async function PopularProjectPromo() {
  let all = [];
  try {
    all = await fetchAllProjects();
  } catch {
    return null;
  }
  if (!Array.isArray(all) || all.length === 0) return null;

  const curated = resolvePopularProjectsFromSlugs(
    all,
    DELHI_NCR_POPULAR_PROJECT_SLUGS,
    POPULAR_PROMO_MAX_ITEMS,
  );

  const items = curated.map(toItem).filter(Boolean);
  if (items.length === 0) return null;

  return <PopularProjectPromoClient items={items} showAfterMs={400} />;
}
