import {
  buildProjectHeroLcpProps,
  getProjectHeroSlides,
} from "@/lib/optimizedImage";

/**
 * Preload the primary project hero image for LCP on project detail pages.
 * URLs must match the optimized src used by HeroMediaPrimary.
 */
export default function ProjectHeroLcpPreload({ projectDetail }) {
  const slides = getProjectHeroSlides(projectDetail);
  const primary = slides[0];
  if (!primary) return null;

  const { srcSet, sizes } = buildProjectHeroLcpProps(
    primary,
    projectDetail?.projectName,
  );

  return (
    <link
      rel="preload"
      as="image"
      imageSrcSet={srcSet}
      imageSizes={sizes}
      fetchPriority="high"
    />
  );
}
