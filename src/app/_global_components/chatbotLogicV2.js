const axios = require("axios");

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}projects/search-by-type-city-budget`;
const IMAGE_BASE_URL = `${process.env.NEXT_PUBLIC_IMAGE_URL}properties/`;

const PROPERTY_TYPE_MAP = {
  residential: 1,
  commercial: 2,
  "new launch": 1,
  "new launches": 1,
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
  gururam: "gurugram",
  benglore: "bangalore",
  banglore: "bangalore",
  bengaluru: "bangalore",
  bengluru: "bangalore",
  "new delhi": "delhi",
  "gr noida": "greater noida",
  gzb: "ghaziabad",
  trivandrum: "thiruvananthapuram",
  thrivananthapura: "thiruvananthapuram",
  trivendrum: "thiruvananthapuram",
  thrivunthapuram: "thiruvananthapuram",
  trivandram: "thiruvananthapuram",
  trivanthapuram: "thiruvananthapuram",
  thirivanthapuram: "thiruvananthapuram",
  chenai: "chennai",
  dehradoon: "dehradun",
  aggra: "agra",
};

const BUDGET_MAP = {
  "up to ₹1 cr": "Up to 1Cr",
  "₹1 cr – ₹3 cr": "1Cr-3Cr",
  "₹3 cr – ₹5 cr": "3Cr-5Cr",
  "above ₹5 cr": "Above 5Cr",
  "up to 1 cr": "Up to 1Cr",
  "upto 1 cr": "Up to 1Cr",
  "upto 1cr": "Up to 1Cr",
  "1 cr - 3 cr": "1Cr-3Cr",
  "1cr - 3cr": "1Cr-3Cr",
  "1cr to 3cr": "1Cr-3Cr",
  "3 cr - 5 cr": "3Cr-5Cr",
  "3cr - 5cr": "3Cr-5Cr",
  "3cr to 5cr": "3Cr-5Cr",
  "above 5 cr": "Above 5Cr",
  "above 5cr": "Above 5Cr",
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

const RESTART_KEYWORDS = new Set([
  "restart",
  "reset",
  "start over",
  "start again",
]);

const CHAT_STATES = {
  WELCOME: "WELCOME",
  AWAIT_CITY: "AWAIT_CITY",
  AWAIT_CUSTOM_CITY: "AWAIT_CUSTOM_CITY",
  AWAIT_BUDGET: "AWAIT_BUDGET",
  SHOWING_RESULTS: "SHOWING_RESULTS",
};

// In-memory chatbot session storage.
const sessions = {};

function createFreshSession() {
  return {
    step: CHAT_STATES.WELCOME,
    flags: null,
    data: {
      type: null,
      city: null,
      budget: null,
    },
    results: {
      allProjects: [],
      currentIndex: 0,
    },
  };
}

function ensureSessionShape(sessionId) {
  if (!sessions[sessionId]) {
    sessions[sessionId] = createFreshSession();
    return sessions[sessionId];
  }

  const session = sessions[sessionId];
  if (!session.data) session.data = {};
  if (!session.results) session.results = { allProjects: [], currentIndex: 0 };

  // Migrate legacy step names from old chatbot implementation.
  const legacyToV2Step = {
    TYPE: CHAT_STATES.AWAIT_CITY,
    CITY: CHAT_STATES.AWAIT_BUDGET,
    RESULTS: CHAT_STATES.SHOWING_RESULTS,
  };
  const rawStep = session.step || CHAT_STATES.WELCOME;
  session.step = legacyToV2Step[rawStep] || rawStep;

  const validSteps = new Set(Object.values(CHAT_STATES));
  if (!validSteps.has(session.step)) {
    session.step = CHAT_STATES.WELCOME;
  }

  session.flags = session.flags || null;
  session.data.type = session.data.type || null;
  session.data.city = session.data.city || null;
  session.data.budget = session.data.budget || null;

  
  const legacyAllProjects = Array.isArray(session.data.allProjects)
    ? session.data.allProjects
    : [];
  session.results.allProjects = Array.isArray(session.results.allProjects)
    ? session.results.allProjects
    : legacyAllProjects;

  const legacyCurrentIndex = Number.isFinite(session.data.currentIndex)
    ? session.data.currentIndex
    : 0;
  session.results.currentIndex = Number.isFinite(session.results.currentIndex)
    ? session.results.currentIndex
    : legacyCurrentIndex;

  return session;
}

function resetSession(sessionId) {
  sessions[sessionId] = createFreshSession();
  return sessions[sessionId];
}

function normalizeText(value = "") {
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeCityInput(rawCity = "") {
  const city = normalizeText(rawCity);
  if (!city) return "";
  return CITY_ALIASES[city] || city;
}

function normalizeBudgetInput(rawBudget = "") {
  return normalizeText(rawBudget).replace(/\s+/g, " ");
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getLevenshteinDistance(a, b) {
  if (!a) return b.length;
  if (!b) return a.length;

  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i += 1) {
    for (let j = 1; j <= a.length; j += 1) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function resolvePropertyType(message) {
  const msg = normalizeText(message);
  if (msg.includes("commercial")) return "commercial";
  if (msg.includes("new launch")) return "new launch";
  if (msg.includes("residential")) return "residential";
  return null;
}

function resolveBudget(message) {
  const cleanMessage = normalizeBudgetInput(message);
  if (BUDGET_MAP[cleanMessage]) {
    return BUDGET_MAP[cleanMessage];
  }

  // Accept compact numeric variants.
  if (/^(up to|upto)\s*1\s*cr$/.test(cleanMessage)) return "Up to 1Cr";
  if (/^1\s*cr\s*(to|-)\s*3\s*cr$/.test(cleanMessage)) return "1Cr-3Cr";
  if (/^3\s*cr\s*(to|-)\s*5\s*cr$/.test(cleanMessage)) return "3Cr-5Cr";
  if (/^above\s*5\s*cr$/.test(cleanMessage)) return "Above 5Cr";

  return null;
}

function resolveCity(message) {
  const normalizedInput = normalizeCityInput(message);
  if (!normalizedInput) return null;

  const matchableCities = [...Object.keys(CITY_MAP), ...Object.keys(CITY_ALIASES)]
    .sort((a, b) => b.length - a.length);

  const exactKey = matchableCities.find((key) => {
    const regex = new RegExp(`\\b${escapeRegex(key)}\\b`, "i");
    return regex.test(normalizedInput);
  });

  if (exactKey) {
    const canonicalCity = CITY_MAP[exactKey] ? exactKey : CITY_ALIASES[exactKey];
    return canonicalCity || null;
  }

  const availableCities = Object.keys(CITY_MAP);
  let fuzzyMatch = null;

  for (const city of availableCities) {
    const distance = getLevenshteinDistance(normalizedInput, city);
    const threshold = city.length > 5 ? 3 : 2;
    if (distance <= threshold) {
      fuzzyMatch = city;
      break;
    }
  }

  return fuzzyMatch;
}

function projectMatchesSelectedCity(project, selectedCity) {
  const normalizedSelectedCity = normalizeCityInput(selectedCity);
  const variants = new Set([normalizedSelectedCity]);

  for (const [alias, canonical] of Object.entries(CITY_ALIASES)) {
    if (canonical === normalizedSelectedCity) {
      variants.add(alias);
    }
  }

  const haystack = [project?.cityName, project?.projectAddress]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return [...variants].some((variant) => {
    const regex = new RegExp(`\\b${escapeRegex(variant)}\\b`, "i");
    return regex.test(haystack);
  });
}

function buildProjectCards(projects = []) {
  return projects.map((project) => {
    const projectSlug =
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
          ? `${IMAGE_BASE_URL}${projectSlug}/${imageFile}`
          : "https://via.placeholder.com/300x200?text=No+Image";

    return {
      id: project.id,
      name: project.projectName,
      location: project.projectAddress || project.cityName,
      price: project.projectStartingPrice || "Price on Request",
      image,
      builder: project.builderName || "N/A",
      status: project.projectStatusName || "N/A",
      link: `${process.env.NEXT_PUBLIC_UI_URL}/${projectSlug}`,
    };
  });
}

function buildProjectsRedirect(data = {}) {
  const typeId = PROPERTY_TYPE_MAP[data.type] || 1;
  const normalizedCity = normalizeCityInput(data.city);
  const cityId = CITY_MAP[normalizedCity];
  const budget = data.budget;

  if (!cityId || !budget) return null;

  const cityName = encodeURIComponent(normalizedCity || "");
  const targetPath = `/projects?propertyType=${typeId}&propertyLocation=${cityId}&cityName=${cityName}&budget=${encodeURIComponent(budget)}`;
  const uiBase = (process.env.NEXT_PUBLIC_UI_URL || "").replace(/\/$/, "");

  return {
    redirectPath: targetPath,
    redirectUrl: uiBase ? `${uiBase}${targetPath}` : targetPath,
  };
}

function getNextBatch(session, batchSize = 3) {
  const { allProjects, currentIndex } = session.results;
  const nextBatch = allProjects.slice(currentIndex, currentIndex + batchSize);
  session.results.currentIndex += nextBatch.length;
  return nextBatch;
}

function createWelcomeMessage() {
  return {
    reply:
      "Hi 👋\nWelcome to My Property Fact!\n\nTell me your requirement and I will help you shortlist relevant projects.",
    options: ["Commercial", "Residential", "New Launch"],
  };
}

function createCityPrompt() {
  return {
    reply: "Great choice. Which city are you interested in?",
    options: CITY_OPTIONS,
  };
}

function createBudgetPrompt() {
  return {
    reply: "Perfect. What is your budget range?",
    options: BUDGET_OPTIONS,
  };
}

function createProjectBatchResponse(session) {
  const cards = buildProjectCards(getNextBatch(session));
  const hasMore = session.results.currentIndex < session.results.allProjects.length;
  const isFirstBatch = session.results.currentIndex <= cards.length;
  const cityName = session.data.city;

  if (!cards.length) {
    return {
      reply: "I could not find projects with these exact filters. Want to refine your search?",
      options: ["Refine Search", "Restart"],
    };
  }

  return {
    reply: isFirstBatch
      ? `Here are top matching projects in ${cityName}:`
      : "Here are more matching projects:",
    followUp: hasMore
      ? "Choose what you want next."
      : "These are all currently matched projects. You can view all details on the projects page.",
    projectCards: cards,
    options: hasMore
      ? ["Show More", "View All", "Refine Search", "Restart"]
      : ["View All", "Refine Search", "Restart"],
  };
}

async function fetchProjectsForSession(session) {
  const typeId = PROPERTY_TYPE_MAP[session.data.type] || 1;
  const normalizedCity = normalizeCityInput(session.data.city);
  const cityId = CITY_MAP[normalizedCity];
  const budget = session.data.budget;

  if (!cityId) {
    return {
      reply: "I could not map that city in our active property data. Please choose another city.",
      options: CITY_OPTIONS,
    };
  }

  const response = await axios.get(API_URL, {
    params: {
      propertyType: typeId,
      propertyLocation: cityId,
      budget,
    },
  });

  const allProjects = Array.isArray(response.data) ? response.data : [];
  const cityMatchedProjects = allProjects.filter((project) =>
    projectMatchesSelectedCity(project, normalizedCity),
  );

  session.results = {
    allProjects: cityMatchedProjects,
    currentIndex: 0,
  };
  session.step = CHAT_STATES.SHOWING_RESULTS;

  return createProjectBatchResponse(session);
}

function handleResultsCommands(message, session) {
  const msg = normalizeText(message);
  const wantsMore = ["show more", "more", "next", "yes", "yes please"].includes(msg);
  const wantsViewAll = ["view all", "open all", "open website", "all projects"].includes(msg);
  const wantsRefine = ["refine search", "change filters", "change city", "change budget"].includes(msg);

  if (wantsRefine) {
    session.step = CHAT_STATES.AWAIT_CITY;
    session.data.city = null;
    session.data.budget = null;
    session.results = { allProjects: [], currentIndex: 0 };
    return {
      reply: "Sure, let us refine your search. Select the city again.",
      options: CITY_OPTIONS,
    };
  }

  if (wantsViewAll) {
    const redirect = buildProjectsRedirect(session.data);
    if (!redirect) {
      return {
        reply: "I could not prepare the redirect link. Please restart once and try again.",
        options: ["Restart"],
      };
    }

    return {
      reply: "Redirecting you to all matching projects...",
      ...redirect,
    };
  }

  if (wantsMore) {
    if (session.results.currentIndex >= session.results.allProjects.length) {
      return {
        reply: "No more projects left in this shortlist. You can view all results now.",
        options: ["View All", "Refine Search", "Restart"],
      };
    }
    return createProjectBatchResponse(session);
  }

  if (["no", "no thanks", "not now"].includes(msg)) {
    return {
      reply: "No problem. If you want to start again, tap Restart anytime.",
      options: ["Restart"],
    };
  }

  return null;
}

async function generateAIResponse(message, sessionId) {
  const session = ensureSessionShape(sessionId);
  const msg = normalizeText(message);

  if (!msg) return createWelcomeMessage();

  if (RESTART_KEYWORDS.has(msg)) {
    resetSession(sessionId);
    return createWelcomeMessage();
  }

  if (["hi", "hello", "hey"].includes(msg) && session.step === CHAT_STATES.WELCOME) {
    return createWelcomeMessage();
  }

  if (session.step === CHAT_STATES.SHOWING_RESULTS) {
    const resultCommandResponse = handleResultsCommands(message, session);
    if (resultCommandResponse) return resultCommandResponse;
  }

  switch (session.step) {
    case CHAT_STATES.WELCOME: {
      const propertyType = resolvePropertyType(message);
      if (!propertyType) return createWelcomeMessage();

      session.data.type = propertyType;
      session.step = CHAT_STATES.AWAIT_CITY;
      return createCityPrompt();
    }

    case CHAT_STATES.AWAIT_CITY: {
      if (msg === "other") {
        session.step = CHAT_STATES.AWAIT_CUSTOM_CITY;
        return {
          reply: "Please type your preferred city name.",
          options: [],
        };
      }

      const city = resolveCity(message);
      if (!city) {
        return {
          reply: "I could not recognize that city from our listings. Please pick from these options or choose Other.",
          options: CITY_OPTIONS,
        };
      }

      session.data.city = city;
      session.step = CHAT_STATES.AWAIT_BUDGET;
      return createBudgetPrompt();
    }

    case CHAT_STATES.AWAIT_CUSTOM_CITY: {
      const city = resolveCity(message);
      if (!city) {
        return {
          reply: "I currently do not have mapped data for that city. Please choose from listed cities.",
          options: CITY_OPTIONS,
        };
      }

      session.data.city = city;
      session.step = CHAT_STATES.AWAIT_BUDGET;
      return createBudgetPrompt();
    }

    case CHAT_STATES.AWAIT_BUDGET: {
      const budget = resolveBudget(message);
      if (!budget) {
        return {
          reply: "Please choose one budget option so I can fetch accurate projects.",
          options: BUDGET_OPTIONS,
        };
      }

      session.data.budget = budget;

      try {
        return await fetchProjectsForSession(session);
      } catch (error) {
        console.error("Chatbot project fetch failed:", error);
        return {
          reply: "Something went wrong while fetching projects. Please try again.",
          options: ["Restart"],
        };
      }
    }

    default: {
      resetSession(sessionId);
      return createWelcomeMessage();
    }
  }
}

module.exports = {
  generateAIResponse,
  sessions,
  PROPERTY_TYPE_MAP,
  CITY_MAP,
  STATES: CHAT_STATES,
};
