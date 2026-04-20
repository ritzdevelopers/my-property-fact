/**
 * Builds unique developer rows for the home marquee: prefers builder API image fields,
 * falls back to the first project logo per builder (same pattern as listing / top picks).
 */

export function normalizeBuildersResponse(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.builders)) return raw.builders;
  if (Array.isArray(raw.data)) return raw.data;
  return [];
}

function projectLogoSrc(project) {
  const imageBase = process.env.NEXT_PUBLIC_IMAGE_URL || "";
  const slugURL = project.slugURL;
  const file = project.projectLogo || project.projectLogoImage;
  if (!file || !slugURL || !imageBase) return null;
  if (file.startsWith("http") || file.startsWith("/")) return file;
  return `${imageBase}properties/${slugURL}/${file}`;
}

function builderLogoSrcFromBuilder(builder) {
  const imageBase = process.env.NEXT_PUBLIC_IMAGE_URL || "";
  const slug = (builder.slugUrl || builder.slugURL || builder.slug || "").trim();
  const file =
    builder.builderImage ||
    builder.builderLogo ||
    builder.logo ||
    builder.image ||
    builder.imageUrl;
  if (!file) return null;
  if (file.startsWith("http") || file.startsWith("/")) return file;
  if (slug && imageBase) return `${imageBase}builder/${slug}/${file}`;
  if (imageBase) return `${imageBase}${file}`;
  return null;
}

function builderKeyFromProject(p) {
  if (p.builderId != null) return `id:${p.builderId}`;
  const slug = (p.builderSlug || p.builderSlugURL || "").trim().toLowerCase();
  if (slug) return `slug:${slug}`;
  const name = (p.builderName || "").trim().toLowerCase();
  if (name) return `name:${name}`;
  return null;
}

/**
 * @param {unknown} buildersResponse — JSON from `builder/get-all`
 * @param {unknown[]} projects — JSON array from `projects`
 * @returns {{ id: string, name: string, src: string, href: string | null }[]}
 */
export function buildTopDevelopersMarqueeItems(buildersResponse, projects) {
  const builders = normalizeBuildersResponse(buildersResponse);
  const projectsArr = Array.isArray(projects) ? projects : [];

  const projectByBuilderId = new Map();
  const projectByBuilderSlug = new Map();
  for (const p of projectsArr) {
    if (p.builderId != null && !projectByBuilderId.has(p.builderId)) {
      projectByBuilderId.set(p.builderId, p);
    }
    const bs = (p.builderSlug || p.builderSlugURL || "").trim().toLowerCase();
    if (bs && !projectByBuilderSlug.has(bs)) projectByBuilderSlug.set(bs, p);
  }

  const out = [];
  const seen = new Set();

  for (const b of builders) {
    const id = b.id ?? b.builderId;
    const name = (b.builderName || b.name || "").trim() || "Developer";
    const slug = (b.slugUrl || b.slugURL || b.slug || "").trim();
    const key =
      id != null
        ? `id:${id}`
        : slug
          ? `slug:${slug.toLowerCase()}`
          : `name:${name.toLowerCase()}`;
    if (seen.has(key)) continue;

    let src = builderLogoSrcFromBuilder(b);
    let projectForLogo = null;
    if (!src && id != null) projectForLogo = projectByBuilderId.get(id);
    if (!src && slug)
      projectForLogo = projectByBuilderSlug.get(slug.toLowerCase());
    if (!src && !projectForLogo && name) {
      const n = name.toLowerCase();
      projectForLogo = projectsArr.find(
        (p) => (p.builderName || "").trim().toLowerCase() === n,
      );
    }
    if (!src && projectForLogo) src = projectLogoSrc(projectForLogo);
    if (!src) continue;

    seen.add(key);
    const href = slug ? `/builder/${slug}` : null;
    out.push({ id: key, name, src, href });
  }

  if (out.length > 0) return out;

  const fallback = new Map();
  for (const p of projectsArr) {
    const key = builderKeyFromProject(p);
    if (!key || fallback.has(key)) continue;
    const src = projectLogoSrc(p);
    if (!src) continue;
    const name = (p.builderName || "").trim() || "Developer";
    const slug = (p.builderSlug || p.builderSlugURL || "").trim();
    fallback.set(key, {
      id: key,
      name,
      src,
      href: slug ? `/builder/${slug}` : null,
    });
  }
  return [...fallback.values()];
}
