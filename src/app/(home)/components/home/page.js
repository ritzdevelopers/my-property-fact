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
import RecommendedProjectsWithGeolocation from "../_homecomponents/RecommendedProjectsWithGeolocation";
import TopDevelopersMarquee from "../_homecomponents/TopDevelopersMarquee";
import { buildTopDevelopersMarqueeItems } from "../_homecomponents/topDevelopersMarqueeData";
import {
  loadPublicPropertiesForSpotlight,
  buildMixedRecommendationsForRegion,
  pickRecommendedPropertiesShowcase,
} from "./recommendedSpotlight";

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

/** Alternates by calendar day (IST): e.g. one day Delhi, next Noida — SSR fallback before geolocation. */
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

export default async function HomePage() {
  const [projects, latestPublicListings] = await Promise.all([
    getAllProjects(),
    loadPublicPropertiesForSpotlight(),
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

  const recommendedProperties = pickRecommendedPropertiesShowcase(projects, 8);

  const firstSlugs = new Set(recommendedProperties.map((p) => p.slugURL));
  const dailyCityLabel = getDailyRecommendedProjectCityLabel();

  const recommendedProjects = buildMixedRecommendationsForRegion({
    projects,
    latestPublicListings,
    excludeSlugSet: firstSlugs,
    geoCity: dailyCityLabel,
    geoState: "",
    limit: 8,
  });

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
              src="/static/banners/transform.png"
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

        <RecommendedProjectsWithGeolocation
          title="Recommended Properties"
          fallbackItems={recommendedProperties}
          fallbackSubtitle="Exclusively Chosen For You"
          kind="project"
          locationIntent="projects"
          viewAllHref="/projects"
          className="recommended-properties-section"
        />

        {/* MPF-top pick section (refreshes every 30s on client) */}
        <TopPicksWithRotation initialProject={mpfTopPicProject} />
        <RecommendedProjectsWithGeolocation
          title="Recommended Projects"
          fallbackItems={recommendedProjects}
          fallbackSubtitle={
            dailyCityLabel === "Noida"
              ? "Latest Projects in Noida & Greater Noida"
              : `Latest Projects in ${dailyCityLabel}`
          }
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
