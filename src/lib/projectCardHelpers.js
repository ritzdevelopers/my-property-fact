const API_BASE = String(process.env.NEXT_PUBLIC_API_URL || "").trim();
const IMAGE_BASE = String(process.env.NEXT_PUBLIC_IMAGE_URL || "").trim();

let nearbyCatalogPromise = null;

export function formatListingStatusLabel(status) {
  const normalized = String(status || "").toLowerCase().trim();
  if (normalized.includes("under construction")) return "Under Construction";
  if (normalized.includes("new launch") || normalized.includes("new launched")) {
    return "New Launch";
  }
  if (normalized.includes("ready")) return "Ready To Move";
  return String(status || "").trim();
}

export function loadNearbyBenefitCatalog() {
  if (!nearbyCatalogPromise && API_BASE) {
    nearbyCatalogPromise = fetch(`${API_BASE}nearby-benefit/get-all`)
      .then((res) => (res.ok ? res.json() : []))
      .catch(() => []);
  }
  return nearbyCatalogPromise || Promise.resolve([]);
}

export function resolveNearbyBenefitIcon(benefitName, catalog = []) {
  const name = String(benefitName || "").trim();
  if (!name || !Array.isArray(catalog) || !catalog.length) return null;

  const lower = name.toLowerCase();
  const match = catalog.find((row) => {
    const bn = String(row?.benefitName || "")
      .toLowerCase()
      .trim();
    if (!bn) return false;
    return bn === lower || bn.includes(lower) || lower.includes(bn);
  });

  if (!match?.benefitIcon) return null;
  if (match.benefitIcon.startsWith("http") || match.benefitIcon.startsWith("/")) {
    return match.benefitIcon;
  }
  return IMAGE_BASE ? `${IMAGE_BASE}nearby-benefit/${match.benefitIcon}` : null;
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
