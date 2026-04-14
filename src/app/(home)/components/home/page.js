import dynamic from "next/dynamic";
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

export default async function HomePage() {
  // Fetching all projects with short details
  const [projects, latestPublicProperties] = await Promise.all([
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

  // Latest properties for "Recommended Properties" (prefer clear BHK like 2/3/4 BHK)
  const preferredBhkProperties = [...latestPublicProperties]
    .filter((item) => item?.slug && item?.title)
    .filter((item) => {
      const bed = Number(item?.bedrooms);
      return Number.isFinite(bed) && bed >= 2 && bed <= 4;
    })
    .sort((a, b) => {
      const aTime = new Date(a?.raw?.createdAt || 0).getTime();
      const bTime = new Date(b?.raw?.createdAt || 0).getTime();
      return bTime - aTime;
    })
    .slice(0, 8);
  const fallbackLatestProperties = [...latestPublicProperties]
    .filter((item) => item?.slug && item?.title)
    .sort((a, b) => {
      const aTime = new Date(a?.raw?.createdAt || 0).getTime();
      const bTime = new Date(b?.raw?.createdAt || 0).getTime();
      return bTime - aTime;
    })
    .slice(0, 8);
  const recommendedProperties =
    preferredBhkProperties.length > 0
      ? preferredBhkProperties
      : fallbackLatestProperties;

  const recommendedProjects = projects
    .filter((project) => project?.slugURL && project?.projectName)
    .slice(0, 8);

  // Top Picks: projects from selected builders only, rotates every 30s (testing)
  const mpfTopPicProject = await fetchTopPicksProject();

  try {
    return (
      <>
        {/* Hero section component  */}
        <HeroSection
          projectTypeList={projectTypeList}
          cityList={cityList}
          cityCount={cityList.length}
          builderCount={builders?.builders?.length || 0}
          projectCount={projects.length}
          unitCount={10030}
        />

        <HomeRecommendationCards
          title="Recommended Properties"
          subtitle="Latest 2BHK, 3BHK, 4BHK and more handpicked listings"
          items={recommendedProperties}
          kind="property"
          className="recommended-properties-section"
        />

        {/* MPF-top pick section (refreshes every 30s on client) */}
        <TopPicksWithRotation initialProject={mpfTopPicProject} />
        <HomeRecommendationCards
          title="Recommended Projects"
          subtitle="Trending projects selected for location, demand and value"
          items={recommendedProjects}
          kind="project"
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
