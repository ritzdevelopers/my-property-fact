import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import NewsViews from "./new-views/page";
import SocialFeedPage from "./social-feed/page";
import HeroSection from "../_homecomponents/heroSection";
import FeaturedPage from "./featured/FeaturedPage";
import {
  fetchCityData,
  fetchProjectTypes,
  getAllProjects,
  fetchTopPicksProject,
  fetchBuilderData,
} from "@/app/_global_components/masterFunction";
import HomeRecommendationCards from "../_homecomponents/HomeRecommendationCards";
import TopDevelopersMarquee from "../_homecomponents/TopDevelopersMarquee";
import { buildTopDevelopersMarqueeItems } from "../_homecomponents/topDevelopersMarqueeData";
import { transformPublicPropertyList } from "../../properties/transformPublicProperties";

const TopPicksWithRotation = dynamic(() => import("../TopPicksWithRotation"), {
  ssr: true,
  loading: () => <section className="py-5" style={{ minHeight: 180 }} aria-busy="true" />,
});
const NewInsight = dynamic(() => import("../_homecomponents/NewInsight"), {
  ssr: true,
  loading: () => <section className="py-4" style={{ minHeight: 120 }} aria-busy="true" />,
});

const DreamPropertySection = dynamic(
  () => import("./dream-project/DreamPropertySection"),
  { loading: () => <section className="dream-property-section my-4 my-lg-5 min-h-[200px]" aria-busy="true" /> }
);
const SocialFeedsOfMPF = dynamic(
  () => import("../_homecomponents/SocialFeedsOfMPF"),
  { loading: () => <div className="py-4" /> }
);
const PopularCitiesSection = dynamic(
  () => import("./popular-cities/PopularCitiesSection"),
  { loading: () => <div className="py-4" /> }
);
const NoidaProjectsSection = dynamic(
  () => import("./noida-projects/NoidaProjectsSection"),
  { loading: () => <div className="py-4" /> }
);
// import NoidaProjectsSection from "./noida-projects/NoidaProjectsSection";

async function loadPublicProperties() {
  const raw = process.env.NEXT_PUBLIC_API_URL || "";
  const base = raw.endsWith("/") ? raw.slice(0, -1) : raw;
  if (!base) return [];

  try {
    const res = await fetch(`${base}/public/properties`, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    if (data?.success && Array.isArray(data.properties)) {
      return transformPublicPropertyList(data.properties);
    }
    return [];
  } catch {
    return [];
  }
}

function propertyListingLatestTimestamp(listing) {
  const raw = listing?.raw?.updatedAt ?? listing?.raw?.createdAt ?? null;
  if (raw == null) return 0;
  const ms = new Date(raw).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

function projectLatestTimestamp(project) {
  if (!project || typeof project !== "object") return 0;
  const raw =
    project.updatedAt ??
    project.updated_at ??
    project.createdAt ??
    project.created_at ??
    project.modifiedAt ??
    project.dateCreated ??
    null;
  if (raw == null) {
    const id = project.id ?? project.projectId;
    return typeof id === "number" ? id : 0;
  }
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  const ms = new Date(raw).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

/** Alternates by calendar day (IST): e.g. one day Delhi, next Noida. */
const DAILY_RECOMMENDED_PROJECT_CITIES = ["Delhi", "Noida"];

function getDailyRecommendedProjectCityLabel() {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [y, m, d] = ymd.split("-").map(Number);
  const middayUtcMs = Date.UTC(y, m - 1, d, 12, 0, 0);
  const dayOrdinal = Math.floor(middayUtcMs / 86400000);
  return DAILY_RECOMMENDED_PROJECT_CITIES[dayOrdinal % 2];
}

function projectCityMatchesLabel(project, cityLabel) {
  const cn = String(project?.cityName || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  if (!cn) return false;
  if (cityLabel === "Delhi") {
    return cn === "delhi" || cn === "new delhi";
  }
  if (cityLabel === "Noida") {
    return (
      cn === "noida" ||
      cn === "greater noida" ||
      cn.includes("greater noida") ||
      cn.includes("noida")
    );
  }
  return cn === String(cityLabel).trim().toLowerCase();
}

/** Public `/public/properties` rows: match Noida + Greater Noida or Delhi for the daily spotlight. */
function publicListingMatchesDailyCity(listing, cityLabel) {
  const raw = listing?.raw || {};
  const blob = [
    raw.city,
    raw.locality,
    raw.address,
    listing?.location,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ");
  if (!blob.trim()) return false;
  if (cityLabel === "Delhi") {
    return blob.includes("delhi") || blob.includes("new delhi");
  }
  if (cityLabel === "Noida") {
    return (
      blob.includes("greater noida") ||
      blob.includes("noida") ||
      blob.includes("noida extension")
    );
  }
  return false;
}

export default async function HomePage() {
  const [projects, latestPublicListings] = await Promise.all([
    getAllProjects(),
    loadPublicProperties(),
  ]);

  // Allowed slugs for featured projects
  const allowedSlugs = [
    "eldeco-camelot",
    "eldeco-7-peaks-residences",
    "eldeco-whispers-of-wonder",
  ];

  // Residential project slugs for "Explore Our Premier Residential Projects"
  const residentialSlugs = [
    "eldeco-camelot",
    "saya-gold-avenue",
    "eldeco-7-peaks-residences",
    "ghd-velvet-vista",
    "irish-platinum",
  ];

  // Commercial project slugs for "Explore Top Commercial Spaces"
  const commercialSlugs = [
    "saya-piazza",
    "gulshan-one29",
    "exotica-132",
  ];

  // Fetching citylist and project types and storing in variables
  const [cityList, projectTypeList, builders] = await Promise.all([
    fetchCityData(),
    fetchProjectTypes(),
    fetchBuilderData(),
  ]);

  // Featured: slug-ordered first
  const featuredProjects = allowedSlugs
    .map((slug) => projects.find((project) => project.slugURL === slug))
    .filter(Boolean);
  // top cities
  const topCities = ["Noida", "Delhi", "Ghaziabad"];
  // Residential: slug-ordered first, then rest from getAllProjects (Residential type)
  const residentialFirst = residentialSlugs
    .map((slug) => projects.find((p) => p.slugURL === slug))
    .filter(Boolean);
  const residentialRest = projects.filter(
    (p) =>
      p.propertyTypeName === "Residential" &&
      p.slugURL &&
      !residentialSlugs.includes(p.slugURL) &&
      p.cityName &&
      topCities.includes(p.cityName)
  ).slice(0, 20);

  const residentialProjects = [...residentialFirst, ...residentialRest];

  // Commercial: slug-ordered first, then rest from getAllProjects (Commercial type)
  const commercialFirst = commercialSlugs
    .map((slug) => projects.find((p) => p.slugURL === slug))
    .filter(Boolean);
  const commercialRest = projects.filter(
    (p) =>
      p.propertyTypeName === "Commercial" &&
      p.slugURL &&
      !commercialSlugs.includes(p.slugURL) &&
      p.cityName &&
      topCities.includes(p.cityName)
  ).slice(0, 20);
  const commercialProjects = [...commercialFirst, ...commercialRest];

  const projectsSortedLatest = [...(Array.isArray(projects) ? projects : [])]
    .filter((p) => p?.slugURL && p?.projectName)
    .sort((a, b) => projectLatestTimestamp(b) - projectLatestTimestamp(a));

  const recommendedProperties = projectsSortedLatest.slice(0, 8);

  const firstSlugs = new Set(recommendedProperties.map((p) => p.slugURL));
  const dailyCityLabel = getDailyRecommendedProjectCityLabel();

  const spotlightProjectPool = projectsSortedLatest
    .filter((p) => projectCityMatchesLabel(p, dailyCityLabel))
    .filter((p) => !firstSlugs.has(p.slugURL))
    .map((p) => ({
      itemKind: "project",
      sort: projectLatestTimestamp(p),
      payload: p,
    }));

  const spotlightListingPool = (Array.isArray(latestPublicListings)
    ? latestPublicListings
    : []
  )
    .filter((row) => row?.slug && row?.title)
    .filter((row) => publicListingMatchesDailyCity(row, dailyCityLabel))
    .map((row) => ({
      itemKind: "property",
      sort: propertyListingLatestTimestamp(row),
      payload: row,
    }));

  const recommendedProjects = [...spotlightProjectPool, ...spotlightListingPool]
    .sort((a, b) => b.sort - a.sort)
    .slice(0, 8)
    .map(({ itemKind, payload }) => ({ itemKind, ...payload }));

  const topDevelopersMarqueeItems = buildTopDevelopersMarqueeItems(
    builders,
    projects,
  );

  // Top Picks: projects from selected builders only, rotates every 30s (testing)
  const mpfTopPicProject = await fetchTopPicksProject();

  try {
    return (
      <>
        {/* Hero section component  */}
        <HeroSection
          projectTypeList={projectTypeList}
          cityList={cityList}
        />

        <section className="container transform-home-section">
          <div className="transform-home-image-wrap">
            <Image
              src="/static/transform_home.png"
              alt="Transform your home visual section"
              fill
              className="transform-home-image"
              sizes="(max-width: 991px) 100vw, 1140px"
              priority={false}
            />
            <div className="transform-home-content">
              <div className="transform-home-headline-stack">
                <h2 className="transform-home-headline-inner">
                  <span className="transform-home-headline-base">Transform yo</span>
                  <span className="transform-home-headline-highlight">
                    ur Home with
                  </span>
                </h2>
                <div className="transform-home-mpf-logo-wrap">
                  <Image
                    src="/static/mpf_text.png"
                    alt="My Property Fact"
                    width={224}
                    height={30}
                    className="transform-home-mpf-logo"
                    sizes="(max-width: 991px) 85vw, 520px"
                  />
                </div>
                <div className="transform-home-why">
                  <h3 className="transform-home-why-title">Why choose us?</h3>
                  <ul className="transform-home-why-list">
                    <li className="transform-home-why-item">
                      <span className="transform-home-why-check" aria-hidden>
                        <svg
                          viewBox="0 0 24 24"
                          width={20}
                          height={20}
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M20 6L9 17l-5-5"
                            stroke="#178c2c"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span className="transform-home-why-text">
                        Compare &amp; choose from{" "}
                        <strong>300+ top verified interior brands</strong>
                      </span>
                    </li>
                    <li className="transform-home-why-item">
                      <span className="transform-home-why-check" aria-hidden>
                        <svg
                          viewBox="0 0 24 24"
                          width={20}
                          height={20}
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M20 6L9 17l-5-5"
                            stroke="#178c2c"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span className="transform-home-why-text">
                        <strong>Calculate your interiors cost instantly</strong>{" "}
                        with our advanced estimator
                      </span>
                    </li>
                  </ul>
                </div>
                <TopDevelopersMarquee items={topDevelopersMarqueeItems} />
                <div className="transform-home-explore-projects-wrap">
                  <Link href="/projects" className="transform-home-explore-projects-btn">
                    Explore Projects
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <HomeRecommendationCards
          title="Recommended Properties"
          subtitle="Exclusively Chosen For You"
          items={recommendedProperties}
          kind="project"
          className="recommended-properties-section"
        />

        {/* MPF-top pick section (refreshes every 30s on client) */}
        <TopPicksWithRotation initialProject={mpfTopPicProject} />
        <HomeRecommendationCards
          title="Recommended Projects"
          subtitle={
            dailyCityLabel === "Noida"
              ? "Latest Projects in Noida & Greater Noida"
              : `Latest Projects in ${dailyCityLabel}`
          }
          items={recommendedProjects}
          kind="mixed"
          viewAllHref="/projects"
        />

        {/* Static Sections */}
        <div className="position-relative">
          {/* Insight section  */}
          <NewInsight />

          {/* featured projects section  */}
          <FeaturedPage
            title="Featured Projects"
            type="Featured"
            autoPlay={false}
            allFeaturedProperties={featuredProjects}
          />
          {/* dream cities section  */}
          <DreamPropertySection />

          {/* Residential + Commercial in one section with tabs */}
          <div className="container">
            <FeaturedPage
              title="Explore Our Premier Residential Projects"
              autoPlay={true}
              allFeaturedProperties={[]}
              residentialProjects={residentialProjects}
              commercialProjects={commercialProjects}
            />
          </div>

          {/* web story section  */}
          <NewsViews title="Realty Updates Web Stories" />

          {/* Top projects container on home page */}
          <NoidaProjectsSection cities={cityList} />

          {/* Latest blogs from our blog section */}
          <SocialFeedPage />

          {/* Social feeds from instagram and facebook */}
          <SocialFeedsOfMPF />

          {/* Popular cities section on home page  */}
          <PopularCitiesSection />
        </div>
      </>
    );
  } catch (error) {
    return (
      <div>
        <h1>Failed to load data</h1>
        <p>The server might be down or unreachable.</p>
      </div>
    );
  }
}
