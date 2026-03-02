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

const BUDGET_OPTIONS = [
  "Up to ₹1 Cr",
  "₹1 Cr – ₹3 Cr",
  "₹3 Cr – ₹5 Cr",
  "Above ₹5 Cr",
];

const RESTART_KEYWORDS = new Set(["restart", "reset", "start over", "start again"]);

const CHAT_STATES = {
  WELCOME: "WELCOME",
  AWAIT_CITY: "AWAIT_CITY",
  AWAIT_CUSTOM_CITY: "AWAIT_CUSTOM_CITY",
  AWAIT_BUDGET: "AWAIT_BUDGET",
  SHOWING_RESULTS: "SHOWING_RESULTS",
};

export function createInitialChatSession() {
  return {
    step: CHAT_STATES.WELCOME,
    data: { type: null, propertyTypeId: null, city: null, budget: null },
    results: { allProjects: [], currentIndex: 0 },
  };
}

function normalizeText(value = "") {
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeCityInput(rawCity = "") {
  const city = normalizeText(rawCity);
  return CITY_ALIASES[city] || city;
}

function resolvePropertyType(message) {
  const msg = normalizeText(message);
  if (msg.includes("commercial")) return "commercial";
  if (msg.includes("new launch")) return "new launch";
  if (msg.includes("residential")) return "residential";
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

  const matchable = [...Object.keys(CITY_MAP), ...Object.keys(CITY_ALIASES)].sort(
    (a, b) => b.length - a.length,
  );

  const hit = matchable.find((key) => {
    const regex = new RegExp(`\\b${escapeRegex(key)}\\b`, "i");
    return regex.test(normalizedInput);
  });

  if (!hit) return null;
  return CITY_MAP[hit] ? hit : CITY_ALIASES[hit];
}

function resolveBudget(message) {
  const msg = normalizeText(message);
  const mapped = {
    "up to ₹1 cr": "Up to 1Cr*",
    "₹1 cr – ₹3 cr": "1-3 Cr*",
    "₹3 cr – ₹5 cr": "3-5 Cr*",
    "above ₹5 cr": "Above 5 Cr*",
    "up to 1 cr": "Up to 1Cr*",
    "upto 1 cr": "Up to 1Cr*",
    "up to 1cr+": "Up to 1Cr*",
    "upto 1cr+": "Up to 1Cr*",
    "1 cr - 3 cr": "1-3 Cr*",
    "3 cr - 5 cr": "3-5 Cr*",
    "above 5 cr": "Above 5 Cr*",
    "above 5cr": "Above 5 Cr*",
  };
  return mapped[msg] || null;
}

function parseProjectPrice(project) {
  const rawPrice = project?.projectPrice;
  const price = parseFloat(rawPrice);
  return Number.isFinite(price) ? price : null;
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
  const selectedBudget = session?.data?.budget;
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

    if (!selectedBudget) return true;

    const price = parseProjectPrice(project);
    if (price === null) return false;

    switch (selectedBudget) {
      case "Up to 1Cr*":
        return price <= 1;
      case "1-3 Cr*":
        return price >= 1 && price < 3;
      case "3-5 Cr*":
        return price >= 3 && price < 5;
      case "Above 5 Cr*":
        return price >= 5;
      default:
        return true;
    }
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

function buildRedirect(data) {
  const typeId = data.propertyTypeId || PROPERTY_TYPE_MAP[data.type] || 1;
  const normalizedCity = normalizeCityInput(data.city);
  const cityId = CITY_MAP[normalizedCity];
  const budget = data.budget;
  if (!cityId || !budget) return null;

  const cityName = encodeURIComponent(normalizedCity || "");
  const redirectPath = `/projects?propertyType=${typeId}&propertyLocation=${cityId}&cityName=${cityName}&budget=${encodeURIComponent(budget)}`;
  const uiBase = (process.env.NEXT_PUBLIC_UI_URL || "").replace(/\/$/, "");

  return {
    redirectPath,
    redirectUrl: uiBase ? `${uiBase}${redirectPath}` : redirectPath,
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

function handleResultsState(message, session) {
  const msg = normalizeText(message);

  if (["refine search", "change filters"].includes(msg)) {
    session.step = CHAT_STATES.WELCOME;
    session.data.type = null;
    session.data.propertyTypeId = null;
    session.data.city = null;
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
    const redirect = buildRedirect(session.data);
    if (!redirect) {
      return { reply: "Redirect link not available. Please restart once.", options: ["Restart"] };
    }
    return {
      reply: "Redirecting you to all matching projects...",
      options: ["Restart"],
      ...redirect,
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
    nextSession.step = CHAT_STATES.AWAIT_CITY;
    return {
      nextSession,
      payload: {
        reply: "Great choice. Which city are you interested in?",
        options: CITY_OPTIONS,
      },
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
    nextSession.step = CHAT_STATES.AWAIT_BUDGET;
    return {
      nextSession,
      payload: { reply: "Perfect. What is your budget range?", options: BUDGET_OPTIONS },
    };
  }

  if (nextSession.step === CHAT_STATES.AWAIT_CUSTOM_CITY) {
    if (msg === "other") {
      return {
        nextSession,
        payload: { reply: "Please type your preferred city name.", options: [] },
      };
    }

    const city = resolveCity(msg);
    const customCity = normalizeCityInput(message);
    if (!city && !customCity) {
      return {
        nextSession,
        payload: {
          reply: "Please type your preferred city name.",
          options: [],
        },
      };
    }

    const selectedCity = city || customCity;
    const hasRelatedProjects =
      Array.isArray(projectList) &&
      projectList.some((project) => projectMatchesSelectedCity(project, selectedCity));

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
    nextSession.step = CHAT_STATES.AWAIT_BUDGET;
    return {
      nextSession,
      payload: { reply: "Perfect. What is your budget range?", options: BUDGET_OPTIONS },
    };
  }

  if (nextSession.step === CHAT_STATES.AWAIT_BUDGET) {
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
        return {
          nextSession,
          payload: {
            reply: "Project data is loading. Please try again in a moment.",
            options: ["Restart"],
          },
        };
      }

      const payload = fetchProjects(nextSession, projectList, projectTypes);
      return { nextSession, payload };
    } catch (error) {
      console.error("Client chatbot fetch failed:", error);
      return {
        nextSession,
        payload: {
          reply: "Something went wrong while fetching projects.",
          options: ["Restart"],
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
