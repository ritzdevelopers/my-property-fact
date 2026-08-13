import dynamic from "next/dynamic";
import Link from "next/link";
import NewsViews from "./new-views/page";
import SocialFeedPage from "./social-feed/page";
import HeroSection from "../_homecomponents/heroSection";
import FeaturedPage from "./featured/FeaturedPage";
import {
  fetchCityData,
  fetchProjectTypes,
  getAllProjects,
  fetchBuilderData,
  fetchTopPicksProject,
} from "@/app/_global_components/masterFunction";
import RecommendedProjectsWithGeolocation from "../_homecomponents/RecommendedProjectsWithGeolocation";
import TopDevelopersMarquee from "../_homecomponents/TopDevelopersMarquee";
import { buildTopDevelopersMarqueeItems } from "../_homecomponents/topDevelopersMarqueeData";
import {
  buildLatestProjectsForRegion,
  buildNewLaunchProjectsForRegion,
  buildSubtitleNewLaunchesNear,
} from "./recommendedSpotlight";
import RotatingHeroHeadline from "./RotatingHeroHeadline";
import TestimonialSection from "./testimonials/TestimonialSection";
import { slimProjectListForListing } from "@/lib/slimProjectListing";

const TopPicksWithRotation = dynamic(() => import("../TopPicksWithRotation"), {
  loading: () => <section className="py-5" style={{ minHeight: 180 }} aria-busy="true" />,
});
const NewInsight = dynamic(() => import("../_homecomponents/NewInsight"), {
  ssr: true,
  loading: () => <section className="py-4" style={{ minHeight: 668 }} aria-busy="true" />,
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

const VaastuStripSection = dynamic(
  () => import("./vaastu-strip/VaastuStripSection"),
  { loading: () => <div className="py-3" /> }
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

async function fetchHomeTestimonials() {
  try {
    const base = (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/?$/, "");
    if (!base) return [];
    const response = await fetch(`${base}/testimonial/get-active`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [projects, buildersRes] = await Promise.all([
    getAllProjects(),
    fetchBuilderData(),
  ]);
  const testimonials = await fetchHomeTestimonials();

  // Allowed slugs for featured projects
  const allowedSlugs = [
    "eldeco-camelot",
    "eldeco-7-peaks-residences",
    "eldeco-whispers-of-wonder",
  ];

  const FEATURED_PROJECT_LOGOS = {
    "eldeco-camelot": "/icon/eldeco_camelot.png",
    "eldeco-7-peaks-residences": "/icon/logo%20(1).png",
    "eldeco-whispers-of-wonder": "/icon/eldeco-banner-ai.png",
  };

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
  const [cityList, projectTypeList] = await Promise.all([
    fetchCityData(),
    fetchProjectTypes(),
  ]);

  // Featured: slug-ordered first
  const featuredProjects = allowedSlugs
    .map((slug) => {
      const project = projects.find((p) => p.slugURL === slug);
      if (!project) return null;
      const logoOverride = FEATURED_PROJECT_LOGOS[slug];
      return logoOverride ? { ...project, projectLogo: logoOverride } : project;
    })
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

  const dailyCityLabel = getDailyRecommendedProjectCityLabel();

  const recommendedProperties = buildNewLaunchProjectsForRegion({
    projects,
    excludeSlugSet: new Set(),
    geoCity: dailyCityLabel,
    geoState: "",
    limit: 8,
  });

  const firstSlugs = new Set(recommendedProperties.map((p) => p.slugURL));

  const recommendedProjects = buildLatestProjectsForRegion({
    projects,
    excludeSlugSet: firstSlugs,
    geoCity: dailyCityLabel,
    geoState: "",
    limit: 8,
  });

  const topDevelopersMarqueeItems = buildTopDevelopersMarqueeItems(buildersRes);

  const slimFeatured = slimProjectListForListing(featuredProjects);
  const slimResidential = slimProjectListForListing(residentialProjects);
  const slimCommercial = slimProjectListForListing(commercialProjects);
  const slimRecommendedProperties = slimProjectListForListing(recommendedProperties);
  const slimRecommendedProjects = slimProjectListForListing(recommendedProjects);

  // Top Picks: projects from selected builders only, rotates every 30s (testing)
  const mpfTopPicProject = await fetchTopPicksProject();

  try {
    const row = (i, node) => <div key={i}>{node}</div>;

    return (
      <>
        {row(
          0,
          <HeroSection
            projectTypeList={projectTypeList}
            cityList={cityList}
            title="Find Flats & Property Across India | Buy & Invest"
            subtitle="Browse flats, apartments, and commercial properties in India with verified listings, price trends, and expert insights."
          />,
        )}

        {row(
          1,
          <RecommendedProjectsWithGeolocation
            title="New Property Launches"
            fallbackItems={slimRecommendedProperties}
            fallbackSubtitle={
              buildSubtitleNewLaunchesNear(dailyCityLabel, "").trim() ||
              "Explore New Residential & Commercial Properties"
            }
            kind="project"
            locationIntent="projects"
            viewAllHref="/projects"
            className="recommended-properties-section"
          />,
        )}

        {row(
          1.5,
          <section className="mpf-expert-band" aria-label="Talk to an expert">
            <div className="container mpf-expert-band__inner">
              <div>
                <p className="mpf-expert-band__title">
                  Need help choosing the right property?
                </p>
                <p className="mpf-expert-band__sub">
                  Browse flats, apartments, and commercial properties with verified
                  listings, price trends, and expert insights.
                </p>
              </div>
              <Link
                href="/contact-us"
                title="Contact us"
                className="mpf-expert-band__cta"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contact us
              </Link>
            </div>
          </section>,
        )}

        {row(
          2,
          <section className="container transform-home-section">
            <div className="transform-home-image-wrap">
              <img
                src="/static/transform_new.png"
                alt="Transform your home visual section"
                title="Transform your home visual section"
                className="transform-home-image"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
              <div className="transform-home-copy">
                <div className="transform-home-content">
                  <div className="transform-home-headline-stack">
                    <RotatingHeroHeadline />
                    <div className="transform-home-mpf-logo-wrap">
                      <img
                        src="/static/mpf_text.png"
                        alt="My Property Fact"
                        title="My Property Fact"
                        width={224}
                        height={30}
                        className="transform-home-mpf-logo"
                      />
                    </div>
                    <TopDevelopersMarquee items={topDevelopersMarqueeItems} />
                    <div className="transform-home-explore-projects-wrap">
                      <Link href="/projects" title="Explore Projects" className="transform-home-explore-projects-btn">
                        Explore Projects
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {row(
          3,
          // <FeaturedPage
          //   title="Featured Projects"
          //   type="Featured"
          //   autoPlay={false}
          //   allFeaturedProperties={slimFeatured}
          // />,
        )}

        {row(
          4,
          <TopPicksWithRotation initialProject={mpfTopPicProject} />,
        )}

        {row(
          5,
          <RecommendedProjectsWithGeolocation
            title="Popular Projects"
            fallbackItems={slimRecommendedProjects}
            fallbackSubtitle={`Explore the Best-Selling Properties Today nearby ${dailyCityLabel}`}
            kind="project"
            locationIntent="latest-projects"
            viewAllHref="/projects"
          />,
        )}

        <div className="position-relative">
          {row(6, <NewInsight />)}

          {row(7, <DreamPropertySection />)}

          {row(
            8,
            <div className="container">
              <FeaturedPage
                title="Explore Our Premier Residential Projects"
                autoPlay={true}
                allFeaturedProperties={[]}
                residentialProjects={slimResidential}
                commercialProjects={slimCommercial}
              />
            </div>,
          )}

          {row(9, <NewsViews title="Realty Updates Web Stories" />)}

          {row(10, <NoidaProjectsSection cities={cityList} />)}

          {row(11, <SocialFeedPage />)}

          {row(12, <TestimonialSection testimonials={testimonials} />)}

          {row(13, <VaastuStripSection />)}

          {row(14, <SocialFeedsOfMPF />)}

          {row(15, <PopularCitiesSection />)}
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
