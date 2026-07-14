import { buildBuilderLogoImageUrl } from "@/lib/builderLogoImageUrl";

/**
 * Builds unique developer rows for the home marquee using builder logos only.
 * Developers without an explicit builder logo are excluded.
 */

export function normalizeBuildersResponse(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.builders)) return raw.builders;
  if (Array.isArray(raw.data)) return raw.data;
  return [];
}

/**
 * @param {unknown} buildersResponse — JSON from `builder/get-all`
 * @param {unknown[]} projects — JSON array from `projects`
 * @returns {{ id: string, name: string, src: string, href: string | null }[]}
 */
export function buildTopDevelopersMarqueeItems(buildersResponse, projects) {
  const builders = normalizeBuildersResponse(buildersResponse);
  void projects;

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

    const src = buildBuilderLogoImageUrl(b);
    if (!src) continue;

    seen.add(key);
    const href = slug ? `/builder/${slug}` : null;
    out.push({ id: key, name, src, href });
  }

  return out;
}
