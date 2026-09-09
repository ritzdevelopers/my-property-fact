import Link from "next/link";
import HeroSection from "../_homecomponents/heroSection";
import {
  fetchCityData,
  fetchProjectTypes,
  getAllProjects,
  fetchBuilderData,
  fetchTopPicksProject,
  fetchLatestBlogs,
} from "@/app/_global_components/masterFunction";
import RecommendedProjectsWithGeolocation from "../_homecomponents/RecommendedProjectsWithGeolocation";
import TopDevelopersMarquee from "../_homecomponents/TopDevelopersMarquee";
import { buildTopDevelopersMarqueeItems } from "../_homecomponents/topDevelopersMarqueeData";
import {
  buildLatestProjectsForRegion,
  buildNewLaunchProjectsForRegion,
  buildSubtitleNewLaunchesNear,
} from "./recommendedSpotlight";
import {
  isDelhiNcrProject,
  scopeHomeProjectsToDelhiNcr,
} from "@/app/_global_components/popularRightNowProjects";
import RotatingHeroHeadline from "./RotatingHeroHeadline";
import HomeDeferredSections from "./HomeDeferredSections";
import {
  slimProjectForListing,
  slimProjectListForListing,
} from "@/lib/slimProjectListing";

/** Keep first HTML small — carousels still work; client sections hydrate below the fold. */
const HOME_SSR_CARD_LIMIT = 6;
const HOME_FEATURED_TAB_LIMIT = 6;
const HOME_MARQUEE_LOGO_LIMIT = 16;

const HOME_NCR_LABEL = "Delhi NCR";

function slimCityForHome(city) {
  if (!city || typeof city !== "object") return city;
  return {
    id: city.id,
    cityName: city.cityName,
    slugURL: city.slugURL || city.slugUrl,
  };
}

function slimProjectTypeForHome(type) {
  if (!type || typeof type !== "object") return type;
  return {
    id: type.id,
    projectTypeName: type.projectTypeName || type.name,
    name: type.name,
    slugURL: type.slugURL || type.slugUrl,
  };
}

function slimBlogForHome(blog) {
  if (!blog || typeof blog !== "object") return blog;
  return {
    id: blog.id,
    blogTitle: blog.blogTitle,
    slugUrl: blog.slugUrl || blog.slugURL,
    blogImage: blog.blogImage,
    createdAt: blog.createdAt,
    authorName: blog.authorName,
    author: blog.author,
    blogDescription: blog.blogDescription,
    blogMetaDescription: blog.blogMetaDescription,
  };
}

async function fetchHomeTestimonials() {
  try {
    const base = (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/?$/, "");
    if (!base) return [];
    const response = await fetch(`${base}/testimonial/get-active`, {
      next: { revalidate: 60 },
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
  const [
    projects,
    buildersRes,
    testimonials,
    cityListRaw,
    projectTypeListRaw,
    mpfTopPicProjectRaw,
    homeBlogsRaw,
  ] = await Promise.all([
    getAllProjects(),
    fetchBuilderData(),
    fetchHomeTestimonials(),
    fetchCityData(),
    fetchProjectTypes(),
    fetchTopPicksProject(),
    fetchLatestBlogs(3),
  ]);

  const cityList = Array.isArray(cityListRaw)
    ? cityListRaw.map(slimCityForHome)
    : [];
  const projectTypeList = Array.isArray(projectTypeListRaw)
    ? projectTypeListRaw.map(slimProjectTypeForHome)
    : [];
  const mpfTopPicProject = mpfTopPicProjectRaw
    ? slimProjectForListing(mpfTopPicProjectRaw)
    : mpfTopPicProjectRaw;
  const homeBlogs = Array.isArray(homeBlogsRaw)
    ? homeBlogsRaw.map(slimBlogForHome)
    : [];

  const residentialSlugs = [
    "eldeco-camelot",
    "saya-gold-avenue",
    "eldeco-7-peaks-residences",
    "ghd-velvet-vista",
    "irish-platinum",
  ];

  const commercialSlugs = [
    "saya-piazza",
    "gulshan-one29",
    "exotica-132",
  ];

  const residentialFirst = residentialSlugs
    .map((slug) => projects.find((p) => p.slugURL === slug))
    .filter(Boolean);
  const residentialRest = projects
    .filter(
      (p) =>
        p.propertyTypeName === "Residential" &&
        p.slugURL &&
        !residentialSlugs.includes(p.slugURL) &&
        isDelhiNcrProject(p),
    )
    .slice(0, HOME_FEATURED_TAB_LIMIT);

  const residentialProjects = [...residentialFirst, ...residentialRest].slice(
    0,
    HOME_FEATURED_TAB_LIMIT,
  );

  const commercialFirst = commercialSlugs
    .map((slug) => projects.find((p) => p.slugURL === slug))
    .filter(Boolean);
  const commercialRest = projects
    .filter(
      (p) =>
        p.propertyTypeName === "Commercial" &&
        p.slugURL &&
        !commercialSlugs.includes(p.slugURL) &&
        isDelhiNcrProject(p),
    )
    .slice(0, HOME_FEATURED_TAB_LIMIT);
  const commercialProjects = [...commercialFirst, ...commercialRest].slice(
    0,
    HOME_FEATURED_TAB_LIMIT,
  );

  const ncrHomeScope = scopeHomeProjectsToDelhiNcr({
    projects,
    city: HOME_NCR_LABEL,
  });

  const recommendedProperties = buildNewLaunchProjectsForRegion({
    projects: ncrHomeScope.projects,
    excludeSlugSet: new Set(),
    geoCity: ncrHomeScope.geoCity,
    geoState: ncrHomeScope.geoState,
    geoTokens: ncrHomeScope.geoTokens,
    limit: HOME_SSR_CARD_LIMIT,
  });

  const firstSlugs = new Set(recommendedProperties.map((p) => p.slugURL));

  const recommendedProjects = buildLatestProjectsForRegion({
    projects: ncrHomeScope.projects,
    excludeSlugSet: firstSlugs,
    geoCity: ncrHomeScope.geoCity,
    geoState: ncrHomeScope.geoState,
    geoTokens: ncrHomeScope.geoTokens,
    limit: HOME_SSR_CARD_LIMIT,
  });

  const topDevelopersMarqueeItems = buildTopDevelopersMarqueeItems(buildersRes).slice(
    0,
    HOME_MARQUEE_LOGO_LIMIT,
  );

  const slimResidential = slimProjectListForListing(residentialProjects);
  const slimCommercial = slimProjectListForListing(commercialProjects);
  const slimRecommendedProperties = slimProjectListForListing(recommendedProperties);
  const slimRecommendedProjects = slimProjectListForListing(recommendedProjects);
  const popularSubtitle = `Explore the Best-Selling Properties Today nearby ${HOME_NCR_LABEL}`;

  try {
    const row = (i, node) => <div key={i}>{node}</div>;

    return (
      <>
        {row(
          0,
          <HeroSection
            projectTypeList={projectTypeList}
            cityList={cityList}
          />,
        )}
        {row(
          1,
          <RecommendedProjectsWithGeolocation
            title="New Property Launches"
            fallbackItems={slimRecommendedProperties}
            fallbackSubtitle={
              buildSubtitleNewLaunchesNear(HOME_NCR_LABEL, "").trim() ||
              "Explore New Residential & Commercial Properties"
            }
            kind="project"
            locationIntent="projects"
            viewAllHref="/projects"
            sectionId="new-property-launches"
            className="recommended-properties-section"
            eagerImageCount={2}
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
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                      />
                    </div>
                    <TopDevelopersMarquee items={topDevelopersMarqueeItems} />
                    <div className="transform-home-explore-projects-wrap">
                      <Link
                        href="/projects"
                        title="Explore Projects"
                        className="transform-home-explore-projects-btn"
                      >
                        Explore Projects
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>,
        )}

        {row(3, null)}

        <HomeDeferredSections
          mpfTopPicProject={mpfTopPicProject}
          slimRecommendedProjects={slimRecommendedProjects}
          popularSubtitle={popularSubtitle}
          slimResidential={slimResidential}
          slimCommercial={slimCommercial}
          cityList={cityList}
          testimonials={testimonials}
          homeBlogs={homeBlogs}
        />
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
