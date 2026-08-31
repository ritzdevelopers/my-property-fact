import {
  CHAT_BUDGET_OPTIONS,
  matchesBudgetRangeForProject,
  normalizeBudgetSelection,
} from "@/app/_global_components/projectFilterUtils";
import {
  matchesBhkInConfiguration,
  matchesConfigTypeInConfiguration,
} from "@/app/_global_components/smartSearchParser";
import { normalizeCitySearchQuery } from "@/app/_global_components/cityAliasUtils";
import { getPublicApiBase } from "@/lib/publicApiBase";

const IMAGE_BASE_URL = `${process.env.NEXT_PUBLIC_IMAGE_URL}properties/`;

const PROPERTY_TYPE_MAP = {
  residential: 1,
  commercial: 2,
  "new launch": 1,
};

const CITY_MAP = {
  agra: 1,
  noida: 2,
  ludhiana: 6,
  mumbai: 14,
  ghaziabad: 15,
  gurugram: 17,
  bangalore: 18,
  jaipur: 19,
  kochi: 20,
  hyderabad: 21,
  "greater noida": 26,
  "noida extension": 27,
  lucknow: 31,
  chandigarh: 33,
  goa: 41,
  delhi: 30,
  faridabad: 35,
  mohali: 42,
  pune: 39,
  bareilly: 43,
  chennai: 37,
  dehradun: 32,
  indore: 38,
  sonipat: 44,
  thiruvananthapuram: 36,
  vrindavan: 34,
  "greater noida west": 45,
};

const CITY_ALIASES = {
  gurgaon: "gurugram",
  benglore: "bangalore",
  banglore: "bangalore",
  bengaluru: "bangalore",
  "new delhi": "delhi",
  "gr noida": "greater noida",
  gzb: "ghaziabad",
  trivandrum: "thiruvananthapuram",
  chenai: "chennai",
  dehradoon: "dehradun",
};

const CITY_OPTIONS = [
  "Noida",
  "Gurugram",
  "Ghaziabad",
  "Greater Noida",
  "Faridabad",
  "Delhi",
  "Other",
];

const BUDGET_OPTIONS = CHAT_BUDGET_OPTIONS;

const BHK_OPTIONS = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK", "5+ BHK"];

const COMMERCIAL_CONFIG_OPTIONS = [
  { label: "Food Court", key: "food-court" },
  { label: "Kiosk", key: "kiosk" },
  { label: "Office", key: "office" },
  { label: "Restaurant", key: "restaurant" },
  { label: "SCO Plots", key: "sco-plots" },
  { label: "Shops", key: "shops" },
  { label: "Showroom", key: "showroom" },
];

const COMMERCIAL_CONFIG_LABELS = COMMERCIAL_CONFIG_OPTIONS.map((item) => item.label);

const LAUNCH_CATEGORY_OPTIONS = ["Commercial", "Residential"];

const RESTART_KEYWORDS = new Set(["restart", "reset", "start over", "start again"]);

const CHAT_STATES = {
  WELCOME: "WELCOME",
  AWAIT_LAUNCH_CATEGORY: "AWAIT_LAUNCH_CATEGORY",
  AWAIT_CITY: "AWAIT_CITY",
  AWAIT_CUSTOM_CITY: "AWAIT_CUSTOM_CITY",
  AWAIT_BHK: "AWAIT_BHK",
  AWAIT_CONFIG: "AWAIT_CONFIG",
  AWAIT_BUDGET: "AWAIT_BUDGET",
  SHOWING_RESULTS: "SHOWING_RESULTS",
};

export function createInitialChatSession() {
  return {
    step: CHAT_STATES.WELCOME,
    data: {
      type: null,
      propertyTypeId: null,
      category: null,
      city: null,
      bhk: null,
      configType: null,
      budget: null,
    },
    results: { allProjects: [], currentIndex: 0 },
  };
}

function getFilterPathType(session) {
  if (normalizeText(session?.data?.type) === "new launch") {
    return normalizeText(session?.data?.category);
  }
  return normalizeText(session?.data?.type);
}

function needsBhkStep(session) {
  return getFilterPathType(session) === "residential";
}

function needsConfigStep(session) {
  return getFilterPathType(session) === "commercial";
}

function createLaunchCategoryPrompt() {
  return {
    reply: "Great. Is this New Launch for Commercial or Residential?",
    options: LAUNCH_CATEGORY_OPTIONS,
  };
}

function createCityPrompt() {
  return {
    reply: "Great choice. Which city are you interested in?",
    options: CITY_OPTIONS,
  };
}

function createBhkPrompt() {
  return {
    reply: "Got it. Which BHK configuration are you looking for?",
    options: BHK_OPTIONS,
  };
}

function createConfigPrompt() {
  return {
    reply: "Got it. Which commercial configuration are you looking for?",
    options: COMMERCIAL_CONFIG_LABELS,
  };
}

function createBudgetPrompt() {
  return {
    reply: "Perfect. What is your budget range?",
    options: BUDGET_OPTIONS,
  };
}

function advanceAfterCity(session) {
  session.data.bhk = null;
  session.data.configType = null;

  if (needsBhkStep(session)) {
    session.step = CHAT_STATES.AWAIT_BHK;
    return createBhkPrompt();
  }

  if (needsConfigStep(session)) {
    session.step = CHAT_STATES.AWAIT_CONFIG;
    return createConfigPrompt();
  }

  session.step = CHAT_STATES.AWAIT_BUDGET;
  return createBudgetPrompt();
}

function normalizeText(value = "") {
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeCityInput(rawCity = "") {
  const city = normalizeCitySearchQuery(rawCity);
  return CITY_ALIASES[city] || city;
}

function resolvePropertyType(message) {
  const msg = normalizeText(message);
  if (msg.includes("commercial")) return "commercial";
  if (msg.includes("new launch")) return "new launch";
  if (msg.includes("residential")) return "residential";
  return null;
}

function resolveLaunchCategory(message) {
  const msg = normalizeText(message);
  if (msg === "commercial") return "commercial";
  if (msg === "residential") return "residential";
  return null;
}

function resolveProjectTypeId(typeKey, projectTypes = []) {
  const list = Array.isArray(projectTypes) ? projectTypes : [];
  const normalizedType = normalizeText(typeKey);

  if (!list.length) {
    return PROPERTY_TYPE_MAP[normalizedType] || null;
  }

  if (normalizedType === "new launch") {
    const match = list.find((type) => {
      const name = normalizeText(type?.projectTypeName || "");
      return name === "new launches" || name === "new launch";
    });
    return match?.id || null;
  }

  if (normalizedType === "commercial" || normalizedType === "residential") {
    const match = list.find(
      (type) => normalizeText(type?.projectTypeName || "") === normalizedType,
    );
    return match?.id || null;
  }

  return null;
}

function resolveCity(message) {
  const normalizedInput = normalizeCityInput(message);
  if (!normalizedInput) return null;
  if (CITY_MAP[normalizedInput]) return normalizedInput;
  if (CITY_ALIASES[normalizedInput]) return CITY_ALIASES[normalizedInput];
  return null;
}

function resolveCustomCity(message, projectList = []) {
  const normalizedInput = normalizeText(message);
  if (!normalizedInput) return null;

  // Accept only pure city text; reject mixed inputs like "2cr faridabad".
  if (!/^[a-z\s]+$/.test(normalizedInput)) return null;

  const knownCity = resolveCity(normalizedInput);
  if (knownCity) return knownCity;

  const allProjects = Array.isArray(projectList) ? projectList : [];
  const projectCityMatch = allProjects.find(
    (project) => normalizeCityInput(project?.cityName || "") === normalizedInput,
  );
  if (projectCityMatch) return normalizedInput;

  return null;
}

function resolveBudget(message) {
  return normalizeBudgetSelection(message, "web");
}

function resolveBhk(message) {
  const msg = normalizeText(message);
  if (!msg) return null;

  if (/^5\+\s*bhk$/.test(msg) || msg === "5 plus bhk" || msg === "5+bhk") {
    return "5+ BHK";
  }

  const exact = BHK_OPTIONS.find((option) => normalizeText(option) === msg);
  if (exact) return exact;

  const match = msg.match(/^(\d+)\s*bhk$/);
  if (match) {
    const n = Number(match[1]);
    if (n >= 5) return "5+ BHK";
    if (n >= 1 && n <= 4) return `${n} BHK`;
  }

  return null;
}

function resolveConfigType(message) {
  const msg = normalizeText(message);
  if (!msg) return null;

  const exact = COMMERCIAL_CONFIG_OPTIONS.find(
    (option) => normalizeText(option.label) === msg || option.key === msg,
  );
  if (exact) return exact;

  if (msg === "food courts" || msg === "foodcourt" || msg === "food-court") {
    return COMMERCIAL_CONFIG_OPTIONS.find((option) => option.key === "food-court");
  }
  if (msg === "kiosks") return COMMERCIAL_CONFIG_OPTIONS.find((option) => option.key === "kiosk");
  if (msg === "offices") return COMMERCIAL_CONFIG_OPTIONS.find((option) => option.key === "office");
  if (msg === "restaurants") {
    return COMMERCIAL_CONFIG_OPTIONS.find((option) => option.key === "restaurant");
  }
  if (msg === "sco plot" || msg === "scoplots" || msg === "sco-plots") {
    return COMMERCIAL_CONFIG_OPTIONS.find((option) => option.key === "sco-plots");
  }
  if (msg === "shop") return COMMERCIAL_CONFIG_OPTIONS.find((option) => option.key === "shops");
  if (msg === "showrooms") {
    return COMMERCIAL_CONFIG_OPTIONS.find((option) => option.key === "showroom");
  }

  return null;
}

function matchesSelectedBhk(projectConfiguration, selectedBhk) {
  const wanted = String(selectedBhk || "").trim();
  if (!wanted) return true;

  if (/^5\+\s*BHK$/i.test(wanted)) {
    const config = String(projectConfiguration || "");
    if (!config) return false;
    const matches = config.match(/\b(\d+)\s*BHK\b/gi) || [];
    return matches.some((token) => Number(String(token).match(/\d+/)?.[0] || 0) >= 5);
  }

  return matchesBhkInConfiguration(projectConfiguration, wanted);
}

function formatProjectDisplayPrice(project) {
  const startingPrice = String(project?.projectStartingPrice || "").trim();
  if (startingPrice) return startingPrice;

  const rawPrice = project?.projectPrice;
  if (rawPrice === null || rawPrice === undefined || rawPrice === "") {
    return "Price on Request";
  }

  const numericPrice = Number(rawPrice);
  if (Number.isFinite(numericPrice)) {
    if (numericPrice >= 1) {
      const cr = numericPrice.toFixed(numericPrice % 1 === 0 ? 0 : 2).replace(/\.?0+$/, "");
      return `₹${cr} Cr* Onwards`;
    }
    const lakh = (numericPrice * 100)
      .toFixed((numericPrice * 100) % 1 === 0 ? 0 : 2)
      .replace(/\.?0+$/, "");
    return `₹${lakh} Lakh* Onwards`;
  }

  return String(rawPrice);
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function applyWebsiteLikeFilters(projects, session, projectTypes = []) {
  const selectedType = session?.data?.type;
  const selectedTypeId = session?.data?.propertyTypeId;
  const selectedCategory = normalizeText(session?.data?.category);
  const selectedBudget = session?.data?.budget;
  const selectedBhk = session?.data?.bhk;
  const selectedConfigType = session?.data?.configType;
  const selectedTypeMeta = Array.isArray(projectTypes)
    ? projectTypes.find((type) => toNumber(type?.id) === toNumber(selectedTypeId))
    : null;

  return projects.filter((project) => {
    // Mirror Projects page behavior for property-type filtering.
    if (selectedTypeMeta) {
      if (normalizeText(selectedTypeMeta.projectTypeName || "") === "new launches") {
        if (project?.projectStatusName !== "New Launched") return false;
      } else {
        const projectTypeId = toNumber(project?.propertyTypeId);
        const selectedId = toNumber(selectedTypeMeta.id);
        if (
          project?.propertyTypeName !== selectedTypeMeta.projectTypeName &&
          projectTypeId !== selectedId
        ) {
          return false;
        }
      }
    } else if (selectedTypeId) {
      if (toNumber(project?.propertyTypeId) !== toNumber(selectedTypeId)) return false;
    } else if (selectedType === "commercial") {
      const projectTypeId = toNumber(project?.propertyTypeId);
      if (project?.propertyTypeName !== "Commercial" && projectTypeId !== 2) return false;
    } else if (selectedType === "residential") {
      const projectTypeId = toNumber(project?.propertyTypeId);
      if (project?.propertyTypeName !== "Residential" && projectTypeId !== 1) return false;
    } else if (selectedType === "new launch") {
      if (project?.projectStatusName !== "New Launched") return false;
    }

    if (selectedType === "new launch" && selectedCategory === "commercial") {
      const projectTypeId = toNumber(project?.propertyTypeId);
      if (project?.propertyTypeName !== "Commercial" && projectTypeId !== 2) return false;
    } else if (selectedType === "new launch" && selectedCategory === "residential") {
      const projectTypeId = toNumber(project?.propertyTypeId);
      if (project?.propertyTypeName !== "Residential" && projectTypeId !== 1) return false;
    }

    if (selectedBhk && !matchesSelectedBhk(project?.projectConfiguration, selectedBhk)) {
      return false;
    }

    if (
      selectedConfigType &&
      !matchesConfigTypeInConfiguration(project?.projectConfiguration, selectedConfigType)
    ) {
      return false;
    }

    if (!selectedBudget) return true;
    return matchesBudgetRangeForProject(project, selectedBudget);
  });
}

function projectMatchesSelectedCity(project, selectedCity) {
  const normalizedSelectedCity = normalizeCityInput(selectedCity);
  const aliases = [normalizedSelectedCity];
  Object.entries(CITY_ALIASES).forEach(([alias, canonical]) => {
    if (canonical === normalizedSelectedCity) aliases.push(alias);
  });

  const haystack = [project?.cityName, project?.projectAddress]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return aliases.some((variant) => {
    const regex = new RegExp(`\\b${escapeRegex(variant)}\\b`, "i");
    return regex.test(haystack);
  });
}

function buildProjectCards(projects = []) {
  return projects.map((project) => {
    const slug =
      project.slugURL ||
      project.projectSlug ||
      String(project.projectName || "")
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const imageFile = project.projectBannerImage || project.projectThumbnailImage;
    const image =
      imageFile && imageFile.startsWith("http")
        ? imageFile
        : imageFile
          ? `${IMAGE_BASE_URL}${slug}/${imageFile}`
          : "https://via.placeholder.com/300x200?text=No+Image";

    const normalizedType = normalizeText(project?.propertyTypeName || "");
    const propertyType =
      normalizedType.includes("commercial") || toNumber(project?.propertyTypeId) === 2
        ? "Commercial"
        : normalizedType.includes("residential") || toNumber(project?.propertyTypeId) === 1
          ? "Residential"
          : null;

    return {
      id: project.id,
      name: project.projectName,
      location: project.projectAddress || project.cityName,
      price: formatProjectDisplayPrice(project),
      image,
      builder: project.builderName || "N/A",
      status: project.projectStatusName || "N/A",
      propertyType,
      link: `${process.env.NEXT_PUBLIC_UI_URL}/${slug}`,
    };
  });
}

function buildProjectsNavigationPayload(data) {
  const typeId = data.propertyTypeId || PROPERTY_TYPE_MAP[data.type] || 1;
  const normalizedCity = normalizeCityInput(data.city);
  const cityId = CITY_MAP[normalizedCity];
  const budget = data.budget;
  if (!cityId || !budget) return null;

  const queryFilters = {
    propertyType: String(typeId),
    propertyLocation: String(cityId),
    budget,
  };
  if (data.bhk) queryFilters.bhkType = data.bhk;
  if (data.configType) queryFilters.configType = data.configType;

  return {
    navigateToProjects: true,
    queryFilters,
  };
}

function createProjectBatch(session) {
  const start = session.results.currentIndex;
  const end = start + 3;
  const batch = session.results.allProjects.slice(start, end);
  session.results.currentIndex += batch.length;

  const hasMore = session.results.currentIndex < session.results.allProjects.length;
  if (!batch.length) {
    return {
      reply: "No matching projects found. Please refine your search.",
      options: ["Refine Search", "Restart"],
    };
  }

  return {
    reply: start === 0 ? `Here are top projects in ${session.data.city}:` : "Here are more projects:",
    followUp: hasMore ? "Choose what you want next." : "These are all available projects for now.",
    projectCards: buildProjectCards(batch),
    options: hasMore
      ? ["Show More", "View All", "Refine Search", "Restart"]
      : ["View All", "Refine Search", "Restart"],
  };
}

function getWebsiteFilteredProjects(session, projectList = [], projectTypes = []) {
  const normalizedCity = normalizeCityInput(session.data.city);
  const selectedCityId = CITY_MAP[normalizedCity];
  const allProjects = Array.isArray(projectList) ? projectList : [];

  const cityMatchedProjects = allProjects.filter((project) => {
    const projectCityId = toNumber(project?.cityId);
    if (selectedCityId && projectCityId === toNumber(selectedCityId)) return true;
    return projectMatchesSelectedCity(project, normalizedCity);
  });

  return applyWebsiteLikeFilters(cityMatchedProjects, session, projectTypes);
}

function fetchProjects(session, projectList = [], projectTypes = []) {
  const normalizedCity = normalizeCityInput(session.data.city);
  if (!normalizedCity) {
    return {
      reply: "Please type a valid city name.",
      options: CITY_OPTIONS,
    };
  }

  session.results.allProjects = getWebsiteFilteredProjects(session, projectList, projectTypes);
  session.results.currentIndex = 0;
  session.step = CHAT_STATES.SHOWING_RESULTS;

  return createProjectBatch(session);
}

function unwrapSearchResults(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.projects)) return payload.projects;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

/** Fallback when SiteData catalog is unavailable — uses the same backend search API. */
async function fetchProjectsFromApi(session) {
  const typeId = session.data.propertyTypeId || PROPERTY_TYPE_MAP[session.data.type] || 1;
  const normalizedCity = normalizeCityInput(session.data.city);
  const cityId = CITY_MAP[normalizedCity];
  const budget =
    normalizeBudgetSelection(session.data.budget, "web") ||
    normalizeBudgetSelection(session.data.budget, "api") ||
    session.data.budget;

  if (!cityId) {
    return {
      reply: "I could not map that city in our active property data. Please choose another city.",
      options: CITY_OPTIONS,
    };
  }

  const base = getPublicApiBase() || process.env.NEXT_PUBLIC_API_URL || "";
  if (!base) {
    return {
      reply: "Project data is unavailable right now. Please try again in a moment.",
      options: ["Try again", "Restart"],
    };
  }

  const url = new URL(`${base}projects/search-by-type-city-budget`);
  url.searchParams.set("propertyType", String(typeId));
  url.searchParams.set("propertyLocation", String(cityId));
  url.searchParams.set("budget", String(budget));

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Search API failed (${response.status})`);
  }

  const payload = await response.json();
  const allProjects = unwrapSearchResults(payload);
  const cityMatchedProjects = allProjects.filter((project) =>
    projectMatchesSelectedCity(project, normalizedCity),
  );
  const bhkFiltered = session.data.bhk
    ? cityMatchedProjects.filter((project) =>
        matchesSelectedBhk(project?.projectConfiguration, session.data.bhk),
      )
    : cityMatchedProjects;
  const configFiltered = session.data.configType
    ? bhkFiltered.filter((project) =>
        matchesConfigTypeInConfiguration(
          project?.projectConfiguration,
          session.data.configType,
        ),
      )
    : bhkFiltered;

  session.results = {
    allProjects: configFiltered,
    currentIndex: 0,
  };
  session.step = CHAT_STATES.SHOWING_RESULTS;
  return createProjectBatch(session);
}

function handleResultsState(message, session) {
  const msg = normalizeText(message);

  if (["refine search", "change filters"].includes(msg)) {
    session.step = CHAT_STATES.WELCOME;
    session.data.type = null;
    session.data.propertyTypeId = null;
    session.data.category = null;
    session.data.city = null;
    session.data.bhk = null;
    session.data.configType = null;
    session.data.budget = null;
    session.results = { allProjects: [], currentIndex: 0 };
    return {
      reply: "Sure, let us refine. Please select your property type.",
      options: ["Commercial", "Residential", "New Launch"],
    };
  }

  if (["show more", "more", "yes"].includes(msg)) {
    return createProjectBatch(session);
  }

  if (["view all", "open all"].includes(msg)) {
    const navigation = buildProjectsNavigationPayload(session.data);
    if (!navigation) {
      return { reply: "Project filters are incomplete. Please restart once.", options: ["Restart"] };
    }
    return {
      reply: "Redirecting you to all matching projects...",
      options: ["Restart"],
      ...navigation,
    };
  }

  return null;
}

export async function generateClientChatResponse(
  message,
  session,
  projectList = [],
  projectTypes = [],
) {
  const nextSession = structuredClone(session || createInitialChatSession());
  const msg = normalizeText(message);

  if (!msg) {
    return {
      nextSession,
      payload: {
        reply: "Please select your property type to start.",
        options: ["Commercial", "Residential", "New Launch"],
      },
    };
  }

  if (RESTART_KEYWORDS.has(msg)) {
    return {
      nextSession: createInitialChatSession(),
      payload: {
        reply: "Hi 👋\nWelcome to My Property Fact!\n\nTell me your requirement and I will help you shortlist relevant projects.",
        options: ["Commercial", "Residential", "New Launch"],
      },
    };
  }

  if (nextSession.step === CHAT_STATES.SHOWING_RESULTS) {
    const resultPayload = handleResultsState(msg, nextSession);
    if (resultPayload) return { nextSession, payload: resultPayload };
  }

  if (nextSession.step === CHAT_STATES.WELCOME) {
    const propertyType = resolvePropertyType(msg);
    if (!propertyType) {
      return {
        nextSession,
        payload: {
          reply: "Please select your property type to start.",
          options: ["Commercial", "Residential", "New Launch"],
        },
      };
    }

    nextSession.data.type = propertyType;
    nextSession.data.propertyTypeId = resolveProjectTypeId(propertyType, projectTypes);
    nextSession.data.category = null;
    nextSession.data.bhk = null;
    nextSession.data.configType = null;
    nextSession.data.budget = null;

    if (propertyType === "new launch") {
      nextSession.step = CHAT_STATES.AWAIT_LAUNCH_CATEGORY;
      return {
        nextSession,
        payload: createLaunchCategoryPrompt(),
      };
    }

    nextSession.step = CHAT_STATES.AWAIT_CITY;
    return {
      nextSession,
      payload: createCityPrompt(),
    };
  }

  if (nextSession.step === CHAT_STATES.AWAIT_LAUNCH_CATEGORY) {
    const category = resolveLaunchCategory(msg);
    if (!category) {
      return {
        nextSession,
        payload: {
          reply: "Please choose Commercial or Residential for New Launch.",
          options: LAUNCH_CATEGORY_OPTIONS,
        },
      };
    }

    nextSession.data.category = category;
    nextSession.step = CHAT_STATES.AWAIT_CITY;
    return {
      nextSession,
      payload: createCityPrompt(),
    };
  }

  if (nextSession.step === CHAT_STATES.AWAIT_CITY) {
    if (msg === "other") {
      nextSession.step = CHAT_STATES.AWAIT_CUSTOM_CITY;
      return {
        nextSession,
        payload: { reply: "Please type your preferred city name.", options: [] },
      };
    }

    const city = resolveCity(msg);
    if (!city) {
      return {
        nextSession,
        payload: {
          reply: "City not recognized. Please select from options or choose Other.",
          options: CITY_OPTIONS,
        },
      };
    }

    nextSession.data.city = city;
    return {
      nextSession,
      payload: advanceAfterCity(nextSession),
    };
  }

  if (nextSession.step === CHAT_STATES.AWAIT_CUSTOM_CITY) {
    if (msg === "other") {
      return {
        nextSession,
        payload: { reply: "Please type your preferred city name.", options: [] },
      };
    }

    const selectedCity = resolveCustomCity(message, projectList);
    if (!selectedCity) {
      return {
        nextSession,
        payload: {
          reply: "You Entered Wrong Input. Select City Name from Below or Provide Correct City Name",
          options: CITY_OPTIONS,
        },
      };
    }

    const hasRelatedProjects = Array.isArray(projectList)
      ? projectList.some((project) => projectMatchesSelectedCity(project, selectedCity))
      : false;

    if (!hasRelatedProjects) {
      return {
        nextSession,
        payload: {
          reply: "You Entered Wrong Input. Select City Name from Below or Provide Correct City Name",
          options: CITY_OPTIONS,
        },
      };
    }

    nextSession.data.city = selectedCity;
    return {
      nextSession,
      payload: advanceAfterCity(nextSession),
    };
  }

  if (nextSession.step === CHAT_STATES.AWAIT_BHK) {
    const bhk = resolveBhk(msg);
    if (!bhk) {
      return {
        nextSession,
        payload: {
          reply: "Please select a BHK option to continue.",
          options: BHK_OPTIONS,
        },
      };
    }

    nextSession.data.bhk = bhk;
    nextSession.data.configType = null;
    nextSession.step = CHAT_STATES.AWAIT_BUDGET;
    return {
      nextSession,
      payload: createBudgetPrompt(),
    };
  }

  if (nextSession.step === CHAT_STATES.AWAIT_CONFIG) {
    const config = resolveConfigType(msg);
    if (!config) {
      return {
        nextSession,
        payload: {
          reply: "Please select a commercial configuration to continue.",
          options: COMMERCIAL_CONFIG_LABELS,
        },
      };
    }

    nextSession.data.configType = config.key;
    nextSession.data.bhk = null;
    nextSession.step = CHAT_STATES.AWAIT_BUDGET;
    return {
      nextSession,
      payload: createBudgetPrompt(),
    };
  }

  if (nextSession.step === CHAT_STATES.AWAIT_BUDGET) {
    if (["try again", "retry", "again"].includes(msg) && nextSession.data.budget) {
      try {
        if (Array.isArray(projectList) && projectList.length > 0) {
          return {
            nextSession,
            payload: fetchProjects(nextSession, projectList, projectTypes),
          };
        }
        return {
          nextSession,
          payload: await fetchProjectsFromApi(nextSession),
        };
      } catch (error) {
        console.error("Client chatbot retry failed:", error);
        return {
          nextSession,
          payload: {
            reply: "Still could not load matching projects. Please tap Try again or Restart.",
            options: ["Try again", "Restart"],
          },
        };
      }
    }

    const budget = resolveBudget(msg);
    if (!budget) {
      return {
        nextSession,
        payload: {
          reply: "Please select one budget option to continue.",
          options: BUDGET_OPTIONS,
        },
      };
    }

    nextSession.data.budget = budget;
    try {
      if (!Array.isArray(projectList) || projectList.length === 0) {
        const payload = await fetchProjectsFromApi(nextSession);
        return { nextSession, payload };
      }

      const payload = fetchProjects(nextSession, projectList, projectTypes);
      return { nextSession, payload };
    } catch (error) {
      console.error("Client chatbot fetch failed:", error);
      return {
        nextSession,
        payload: {
          reply: "Could not load matching projects right now. Please tap Try again.",
          options: ["Try again", "Restart"],
        },
      };
    }
  }

  return {
    nextSession: createInitialChatSession(),
    payload: {
      reply: "Let us start again.",
      options: ["Commercial", "Residential", "New Launch"],
    },
  };
}
