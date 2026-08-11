/**
 * Builds the "Project Name, Locality, City" label used for project headings,
 * card titles and link labels across the site.
 */

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

const normalize = (value) =>
  clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

function firstAddressPart(address) {
  const parts = clean(address)
    .split(",")
    .map((part) => clean(part))
    .filter(Boolean);
  return parts[0] || "";
}

function pushUnique(parts, candidate) {
  const value = clean(candidate);
  if (!value) return;
  const key = normalize(value);
  if (!key) return;
  if (parts.some((part) => normalize(part) === key)) return;
  parts.push(value);
}

/**
 * Locality + city, tolerant of the different field names used by the detail
 * API (projectLocality/city) and the listing payloads (projectAddress/cityName).
 */
export function buildProjectLocationLabel(project) {
  if (!project || typeof project !== "object") return "";

  const locality =
    clean(project.projectLocality || project.locality) ||
    firstAddressPart(project.projectAddress);
  const city = clean(project.cityName || project.city);

  const parts = [];
  pushUnique(parts, locality);
  pushUnique(parts, city);

  return parts.join(", ");
}

export function buildProjectDisplayName(project, fallback = "") {
  const name = clean(project?.projectName || project?.name) || clean(fallback);
  const location = buildProjectLocationLabel(project);
  if (!name) return location;
  if (!location) return name;

  const nameKey = ` ${normalize(name)} `;
  const extraParts = location
    .split(",")
    .map((part) => clean(part))
    .filter((part) => part && !nameKey.includes(` ${normalize(part)} `));

  return extraParts.length ? `${name}, ${extraParts.join(", ")}` : name;
}
