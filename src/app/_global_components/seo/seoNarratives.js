/** Static route → summary text (aligned with page metadata descriptions). */
const STATIC_SEO_NARRATIVES = {
  "/": "Explore flats, residential and commercial properties across India on My Property Fact: NCR, Delhi, Faridabad, Noida, and top Indian cities with verified listings and top developers.",
  "/about-us":
    "Discover the story behind My Property Fact – your trusted source for accurate real estate price trends, market insights, and property data across major Indian cities.",
  "/blog":
    "Explore expert articles on real estate trends, property investment tips, and market insights across India. Stay informed with My Property Fact's latest blogs.",
  "/projects":
    "Browse top residential and commercial real estate projects across India. Discover new launches, ongoing developments, and upcoming properties with My Property Fact.",
  "/properties":
    "Browse verified residential and commercial property listings across India with transparent pricing, location details, and expert-backed insights on My Property Fact.",
  "/contact-us":
    "Have questions or need assistance? Contact My Property Fact for inquiries about property trends, insights, or partnerships. We are here to help.",
  "/emi-calculator":
    "Plan your home loan with My Property Fact EMI calculator. Estimate monthly instalments, compare loan scenarios, and understand total interest before you buy property in India.",
  "/locate-score":
    "Use My Property Fact Locate Score to compare neighbourhoods by connectivity, amenities, safety, schools, hospitals, and market trends before you invest in Indian real estate.",
  "/join-our-team":
    "Explore career opportunities at My Property Fact. Join our team to build trusted real estate tools, verified listings, and data-driven property insights for buyers across India.",
  "/privacy-policy":
    "Read My Property Fact privacy policy to understand how we collect, use, and protect your personal information when you browse listings, tools, and real estate content.",
  "/web-stories":
    "Watch My Property Fact realty web stories for quick updates on projects, market trends, and property news across India's top cities and micro-markets.",
  "/market-analysis":
    "Analyse Indian real estate markets with My Property Fact: city trends, locality insights, price movement, and research-backed data to support smarter property decisions.",
  "/property-rate-and-trend":
    "Compare property rates and price trends across Indian cities and localities. Use My Property Fact data to track appreciation, transaction activity, and market momentum.",
  "/clients-speak":
    "Read what clients say about My Property Fact: verified project guidance, transparent advice, and support for homebuyers and investors across India.",
  "/dashboard":
    "Access your My Property Fact dashboard to manage saved properties, enquiries, and personalised real estate tools in one place.",
};

const SKIP_PREFIXES = ["/admin", "/portal", "/api", "/_next"];

/**
 * @param {string} pathname
 * @returns {string | null}
 */
export function getSeoNarrativeForPath(pathname) {
  if (!pathname || typeof pathname !== "string") return null;

  const path = pathname.split("?")[0].replace(/\/+$/, "") || "/";

  if (SKIP_PREFIXES.some((prefix) => path.startsWith(prefix))) return null;

  if (STATIC_SEO_NARRATIVES[path]) return STATIC_SEO_NARRATIVES[path];

  return null;
}
