"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import RecommendedProjectsWithGeolocation from "../_homecomponents/RecommendedProjectsWithGeolocation";
import SocialFeed from "./social-feed/socialfeed";

const sectionPlaceholder = (minHeight) => (
  <section className="py-4" style={{ minHeight }} aria-busy="true" />
);

const TopPicksWithRotation = dynamic(() => import("../TopPicksWithRotation"), {
  ssr: false,
  loading: () => sectionPlaceholder(180),
});
const NewInsight = dynamic(() => import("../_homecomponents/NewInsight"), {
  ssr: false,
  loading: () => sectionPlaceholder(320),
});
const DreamPropertySection = dynamic(
  () => import("./dream-project/DreamPropertySection"),
  { ssr: false, loading: () => sectionPlaceholder(200) },
);
/** Client Featured UI — do not dynamic-import async RSC FeaturedPage (causes remount/fetch loops). */
const Featured = dynamic(() => import("./featured/featured"), {
  ssr: false,
  loading: () => sectionPlaceholder(360),
});
const SocialFeedsOfMPF = dynamic(
  () => import("../_homecomponents/SocialFeedsOfMPF"),
  { ssr: false, loading: () => sectionPlaceholder(320) },
);
const PopularCitiesSection = dynamic(
  () => import("./popular-cities/PopularCitiesSection"),
  { ssr: false, loading: () => sectionPlaceholder(200) },
);
const NoidaProjectsSection = dynamic(
  () => import("./noida-projects/NoidaProjectsSection"),
  { ssr: false, loading: () => sectionPlaceholder(400) },
);
const VaastuStripSection = dynamic(
  () => import("./vaastu-strip/VaastuStripSection"),
  { ssr: false, loading: () => sectionPlaceholder(160) },
);
const TestimonialSection = dynamic(
  () => import("./testimonials/TestimonialSection"),
  { ssr: false, loading: () => sectionPlaceholder(280) },
);

/**
 * Below-fold homepage sections — client-only so heavy markup/videos stay out of first HTML.
 * Mount after idle so PSI/Lighthouse can finish first-paint work first.
 */
export default function HomeDeferredSections({
  mpfTopPickProjects,
  slimRecommendedProjects,
  popularSubtitle,
  slimResidential,
  slimCommercial,
  cityList,
  testimonials,
  homeBlogs = [],
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idleId;
    let timeoutId;
    const reveal = () => setReady(true);

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(reveal, { timeout: 1800 });
      return () => {
        if (typeof window.cancelIdleCallback === "function") {
          window.cancelIdleCallback(idleId);
        }
      };
    }

    timeoutId = window.setTimeout(reveal, 900);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!ready) {
    return (
      <>
        {sectionPlaceholder(180)}
        {sectionPlaceholder(320)}
        {sectionPlaceholder(320)}
        {sectionPlaceholder(200)}
        {sectionPlaceholder(360)}
        {sectionPlaceholder(400)}
        {sectionPlaceholder(280)}
        {sectionPlaceholder(280)}
        {sectionPlaceholder(160)}
        {sectionPlaceholder(320)}
        {sectionPlaceholder(200)}
      </>
    );
  }

  const row = (i, node) => <div key={i}>{node}</div>;

  return (
    <>
      {row(4, <TopPicksWithRotation initialProjects={mpfTopPickProjects} />)}
      {row(
        5,
        <RecommendedProjectsWithGeolocation
          title="Popular Projects"
          fallbackItems={slimRecommendedProjects}
          fallbackSubtitle={popularSubtitle}
          kind="project"
          locationIntent="latest-projects"
          viewAllHref="/projects"
          sectionId="popular-projects"
          eagerImageCount={0}
        />,
      )}

      <div className="position-relative">
        {row(6, <NewInsight />)}
        {row(7, <DreamPropertySection />)}
        {row(
          8,
          <Featured
            title="Explore Our Premier Residential Projects"
            autoPlay={true}
            allProjects={[]}
            badgeVariant="home-featured"
            residentialProjects={slimResidential}
            commercialProjects={slimCommercial}
          />,
        )}
        {row(9, <NoidaProjectsSection cities={cityList} />)}
        {row(
          10,
          homeBlogs?.length ? <SocialFeed data={homeBlogs} /> : null,
        )}
        {row(11, <TestimonialSection testimonials={testimonials} />)}
        {row(12, <VaastuStripSection />)}
        {row(13, <SocialFeedsOfMPF />)}
        {row(14, <PopularCitiesSection />)}
      </div>
    </>
  );
}
