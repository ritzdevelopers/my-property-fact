import PopularProjectPromoClient from "./PopularProjectPromoClient";
import {
  fetchAllProjects,
  fetchTopPicksProject,
} from "@/app/_global_components/masterFunction";

const MAX_PROJECTS = 5;

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
 * Picks several popular projects (server-side): Top Pick first, then more residential, then any.
 */
export default async function PopularProjectPromo() {
  let all = [];
  let top = null;
  try {
    [all, top] = await Promise.all([
      fetchAllProjects(),
      fetchTopPicksProject().catch(() => null),
    ]);
  } catch {
    return null;
  }
  if (!Array.isArray(all) || all.length === 0) return null;

  const items = [];
  const seen = new Set();

  if (top) {
    const first = toItem(top);
    if (first) {
      items.push(first);
      seen.add(first.key);
    }
  }

  const residential = all.filter(
    (p) =>
      p?.propertyTypeName === "Residential" &&
      (p?.slugURL || p?.slugUrl),
  );
  const shuffledResidential = [...residential].sort(() => Math.random() - 0.5);

  for (const p of shuffledResidential) {
    if (items.length >= MAX_PROJECTS) break;
    const slug = p.slugURL || p.slugUrl;
    if (seen.has(slug)) continue;
    const item = toItem(p);
    if (item) {
      items.push(item);
      seen.add(item.key);
    }
  }

  if (items.length < MAX_PROJECTS) {
    const shuffledAll = [...all].sort(() => Math.random() - 0.5);
    for (const p of shuffledAll) {
      if (items.length >= MAX_PROJECTS) break;
      const slug = p?.slugURL || p?.slugUrl;
      if (!slug || seen.has(slug)) continue;
      const item = toItem(p);
      if (item) {
        items.push(item);
        seen.add(item.key);
      }
    }
  }

  if (items.length === 0) return null;

  return <PopularProjectPromoClient items={items} showAfterMs={1000} />;
}
