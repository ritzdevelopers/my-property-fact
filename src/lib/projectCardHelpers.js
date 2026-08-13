const API_BASE = String(process.env.NEXT_PUBLIC_API_URL || "").trim();
const IMAGE_BASE = String(process.env.NEXT_PUBLIC_IMAGE_URL || "").trim();

let nearbyCatalogPromise = null;

export function formatListingStatusLabel(status) {
  const normalized = String(status || "").toLowerCase().trim();
  if (normalized.includes("under construction")) return "Under Construction";
  if (normalized.includes("new launch") || normalized.includes("new launched")) {
    return "New Launch";
  }
  if (normalized.includes("ready") || normalized.includes("completed")) return "Ready To Move";
  return String(status || "").trim();
}

/**
 * Ribbon presets keyed off the raw `projectStatusName`. `lines` drives the two-row
 * corner ribbon; `key` drives the colour scheme + image treatment via `data-status`.
 * Order matters — the first matching entry wins.
 */
const STATUS_RIBBON_PRESETS = [
  {
    key: "under-construction",
    lines: ["Under", "Construction"],
    match: (s) => s.includes("under construction") || s.includes("ongoing"),
  },
  {
    key: "new-launched",
    lines: ["New", "Launched"],
    match: (s) => s.includes("new launch"),
  },
  {
    key: "ready-to-move",
    lines: ["Ready", "To Move"],
    match: (s) => s.includes("ready") || s.includes("completed") || s.includes("delivered"),
  },
  {
    key: "possession-soon",
    lines: ["Possession", "Soon"],
    match: (s) => s.includes("possession"),
  },
  {
    key: "ultra-luxury",
    lines: ["Ultra", "Luxury"],
    match: (s) => s.includes("luxury"),
  },
  {
    key: "sold-out",
    lines: ["Sold", "Out"],
    match: (s) => s.includes("sold"),
  },
];

function toStatusKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Resolves any project/property status into the data the corner ribbon needs.
 * Returns `null` when there is no status to show.
 */
export function resolveProjectStatusRibbon(status) {
  const raw = String(status ?? "").trim();
  if (!raw) return null;

  const normalized = raw.toLowerCase();
  const preset = STATUS_RIBBON_PRESETS.find((entry) => entry.match(normalized));
  if (preset) {
    return {
      key: preset.key,
      label: formatListingStatusLabel(raw) || raw,
      lines: preset.lines,
    };
  }

  const words = raw.split(/\s+/).filter(Boolean);
  return {
    key: toStatusKey(raw),
    label: raw,
    lines: words.length > 1 ? [words[0], words.slice(1).join(" ")] : [raw],
  };
}

export function loadNearbyBenefitCatalog() {
  if (!nearbyCatalogPromise && API_BASE) {
    nearbyCatalogPromise = fetch(`${API_BASE}nearby-benefit/get-all`)
      .then((res) => (res.ok ? res.json() : []))
      .catch(() => []);
  }
  return nearbyCatalogPromise || Promise.resolve([]);
}

function findNearbyBenefitMatch(benefitName, catalog = []) {
  const name = String(benefitName || "").trim();
  if (!name || !Array.isArray(catalog) || !catalog.length) return null;

  const lower = name.toLowerCase();
  return (
    catalog.find((row) => {
      const bn = String(row?.benefitName || "")
        .toLowerCase()
        .trim();
      if (!bn) return false;
      return bn === lower || bn.includes(lower) || lower.includes(bn);
    }) || null
  );
}

function deriveLabelFromBenefitIconFilename(filename) {
  const base = String(filename || "")
    .trim()
    .replace(/\.[^.]+$/, "");
  const afterUnderscore = base.includes("_") ? base.split("_").pop() : base;
  return String(afterUnderscore || "")
    .replace(/_/g, " ")
    .trim();
}

export function resolveNearbyBenefitMeta(benefitName, catalog = []) {
  const name = String(benefitName || "").trim();
  const match = findNearbyBenefitMatch(name, catalog);

  if (!match?.benefitIcon) {
    const fallback = name || "Nearby location";
    return { icon: null, alt: fallback, title: fallback };
  }

  let icon = match.benefitIcon;
  if (!icon.startsWith("http") && !icon.startsWith("/")) {
    icon = IMAGE_BASE ? `${IMAGE_BASE}nearby-benefit/${match.benefitIcon}` : null;
  }

  const label =
    String(
      match.altTag ||
        match.benefitName ||
        name ||
        deriveLabelFromBenefitIconFilename(match.benefitIcon),
    ).trim() || "Nearby location";

  if (!icon) {
    return { icon: null, alt: label, title: label };
  }

  return { icon, alt: label, title: label };
}

export function resolveNearbyBenefitIcon(benefitName, catalog = []) {
  return resolveNearbyBenefitMeta(benefitName, catalog).icon;
}

export function resolveBuilderFromList(project, builderList) {
  if (!project || !Array.isArray(builderList) || !builderList.length) return null;

  const builderId = project.builderId;
  if (builderId != null) {
    const byId = builderList.find((row) => row?.id === builderId);
    if (byId) return byId;
  }

  const name = String(project.builderName || "")
    .trim()
    .toLowerCase();
  if (!name) return null;

  return (
    builderList.find(
      (row) =>
        String(row?.builderName || "")
          .trim()
          .toLowerCase() === name,
    ) || null
  );
}

export function buildProjectLogoUrl(projectSlug, projectLogo) {
  const file = String(projectLogo || "").trim();
  if (!file) return "";

  if (file.startsWith("http") || file.startsWith("/")) return file;

  const slug = String(projectSlug || "").trim();
  if (slug && IMAGE_BASE) {
    return `${IMAGE_BASE}properties/${slug}/${file}`;
  }

  if (IMAGE_BASE) return `${IMAGE_BASE}${file}`;
  return "";
}

export function buildBuilderLogoUrl({
  builderSlug,
  builderLogo,
  projectSlug,
  projectLogo,
  preferProjectLogo = true,
} = {}) {
  const builderFile = String(builderLogo || "").trim();
  const projectFile = String(projectLogo || "").trim();

  if (preferProjectLogo) {
    const fromProject = buildProjectLogoUrl(projectSlug, projectFile);
    if (fromProject) return fromProject;
  }

  if (builderFile.startsWith("http") || builderFile.startsWith("/")) {
    return builderFile;
  }

  const slug = String(builderSlug || "").trim();
  if (slug && builderFile && API_BASE) {
    const base = API_BASE.endsWith("/") ? API_BASE : `${API_BASE}/`;
    return `${base}get/images/builders/${encodeURIComponent(slug)}/${encodeURIComponent(builderFile)}`;
  }

  if (slug && builderFile && IMAGE_BASE) {
    return `${IMAGE_BASE}builder/${slug}/${builderFile}`;
  }

  if (!preferProjectLogo) {
    const fromProject = buildProjectLogoUrl(projectSlug, projectFile);
    if (fromProject) return fromProject;
  }

  if (builderFile && IMAGE_BASE) return `${IMAGE_BASE}${builderFile}`;
  return "";
}

export function buildBuilderLogoCandidates({
  builderSlug,
  builderLogo,
  projectSlug,
  projectLogo,
} = {}) {
  const candidates = [];
  const add = (url) => {
    const value = String(url || "").trim();
    if (value && !candidates.includes(value)) candidates.push(value);
  };

  add(buildProjectLogoUrl(projectSlug, projectLogo));
  add(
    buildBuilderLogoUrl({
      builderSlug,
      builderLogo,
      projectSlug: "",
      projectLogo: "",
      preferProjectLogo: false,
    }),
  );

  return candidates;
}
