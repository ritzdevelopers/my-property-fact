  const BUDGET_BUCKETS = [
    {
      key: "upto_1cr",
      web: "Up to 1Cr*",
      api: "Up to 1Cr",
      chat: "Up to ₹1 Cr",
      test: (priceInCr) => priceInCr <= 1,
      aliases: [
        "up to 1 cr",
        "upto 1 cr",
        "up to 1cr",
        "upto 1cr",
        "up to 1cr+",
        "upto 1cr+",
        "up to ₹1 cr",
        "upto ₹1 cr",
      ],
    },
    {
      key: "1_3cr",
      web: "1-3 Cr*",
      api: "1Cr-3Cr",
      chat: "₹1 Cr – ₹3 Cr",
      test: (priceInCr) => priceInCr >= 1 && priceInCr < 3,
      aliases: [
        "1-3 cr",
        "1 cr - 3 cr",
        "1cr - 3cr",
        "1 cr to 3 cr",
        "1cr to 3cr",
        "₹1 cr – ₹3 cr",
        "₹1 cr - ₹3 cr",
      ],
    },
    {
      key: "3_5cr",
      web: "3-5 Cr*",
      api: "3Cr-5Cr",
      chat: "₹3 Cr – ₹5 Cr",
      test: (priceInCr) => priceInCr >= 3 && priceInCr < 5,
      aliases: [
        "3-5 cr",
        "3 cr - 5 cr",
        "3cr - 5cr",
        "3 cr to 5 cr",
        "3cr to 5cr",
        "₹3 cr – ₹5 cr",
        "₹3 cr - ₹5 cr",
      ],
    },
    {
      key: "above_5cr",
      web: "Above 5 Cr*",
      api: "Above 5Cr",
      chat: "Above ₹5 Cr",
      test: (priceInCr) => priceInCr >= 5,
      aliases: ["above 5 cr", "above 5cr", "above ₹5 cr"],
    },
  ];

  export const PROJECT_BUDGET_OPTIONS = BUDGET_BUCKETS.map((bucket) => bucket.web);
  export const CHAT_BUDGET_OPTIONS = BUDGET_BUCKETS.map((bucket) => bucket.chat);

  function normalizeText(value = "") {
    return String(value).trim().toLowerCase().replace(/\s+/g, " ");
  }

  function findBudgetBucket(rawBudget) {
    const normalized = normalizeText(rawBudget);
    if (!normalized) return null;

    return (
      BUDGET_BUCKETS.find(
        (bucket) =>
          normalizeText(bucket.web) === normalized ||
          normalizeText(bucket.api) === normalized ||
          normalizeText(bucket.chat) === normalized ||
          bucket.aliases.some((alias) => normalizeText(alias) === normalized),
      ) || null
    );
  }

  export function normalizeBudgetSelection(rawBudget, output = "web") {
    const bucket = findBudgetBucket(rawBudget);
    if (!bucket) return null;

    if (output === "api") return bucket.api;
    if (output === "chat") return bucket.chat;
    return bucket.web;
  }

  function convertToCrore(value, unitHint = "") {
    if (!Number.isFinite(value)) return null;
    const hint = normalizeText(unitHint);

    if (hint.includes("lakh") || hint.includes("lac")) return value / 100;
    if (hint.includes("crore") || /\bcr\b/.test(hint)) return value;

    // Values in full rupees (for example 7500000 => 0.75 Cr).
    if (value >= 100000) return value / 10000000;

    // Whole-number shorthand commonly sent as lakh values (for example 95 => 95 Lakh).
    if (value > 20) return value / 100;

    // Smaller decimals/integers are treated as crore values.
    return value;
  }

  function parsePriceToCrore(rawValue) {
    if (typeof rawValue === "number") return convertToCrore(rawValue);

    const text = String(rawValue || "").replace(/,/g, "");
    const textNorm = normalizeText(text);
    const match = textNorm.match(/-?(?:\d+\.?\d*|\.\d+)/);
    if (!match) return null;

    const parsed = Number(match[0]);
    return convertToCrore(parsed, textNorm);
  }

  function extractProjectPrice(project = {}) {
    const rawStartingPrice = project?.projectStartingPrice;
    const rawPrice = project?.projectPrice;
    return rawStartingPrice !== null && rawStartingPrice !== undefined && rawStartingPrice !== ""
      ? rawStartingPrice
      : rawPrice;
  }

  export function matchesBudgetRangeForProject(project, budgetSelection) {
    const bucket = findBudgetBucket(budgetSelection);
    if (!bucket) return true;

    const priceInCr = parsePriceToCrore(extractProjectPrice(project));
    if (!Number.isFinite(priceInCr)) return false;

    return bucket.test(priceInCr);
  }
