import { BANNER_DESKTOP } from "@/app/(home)/components/_homecomponents/heroBannerAssets";
import {
  buildProjectImageUrl,
  DEFAULT_PROJECT_CARD_IMAGE,
} from "@/lib/projectImageUrl";

/** MPF home hero — used on home-page and site-wide lead forms without project context. */
export const MPF_LEAD_FORM_BANNER = BANNER_DESKTOP.src;

/** Site-wide My Property Fact logo used in lead forms. */
export const MPF_LOGO_SRC = "/logo.webp";
export const MPF_LOGO_ALT = "My Property Fact logo";

export function getProjectLeadFormImage(project) {
  if (!project?.slugURL) return DEFAULT_PROJECT_CARD_IMAGE;

  const desktopHero = project.desktopImages?.[0]?.desktopImage;
  if (desktopHero) {
    const imageBase = process.env.NEXT_PUBLIC_IMAGE_URL || "";
    if (/^https?:\/\//i.test(desktopHero) || desktopHero.startsWith("/")) {
      return desktopHero;
    }
    return `${imageBase}properties/${project.slugURL}/${desktopHero}`;
  }

  return buildProjectImageUrl(project, { preferThumbnail: false });
}

/**
 * Resolve the hero image for a lead form.
 * @param {{ projectDetail?: object | null, preferHomeBanner?: boolean }} options
 */
export function getLeadFormHeroImage({
  projectDetail = null,
  preferHomeBanner = false,
} = {}) {
  if (projectDetail?.slugURL && !preferHomeBanner) {
    return getProjectLeadFormImage(projectDetail);
  }
  return MPF_LEAD_FORM_BANNER;
}

export function getLeadFormHeroAlt({ projectDetail = null } = {}) {
  if (projectDetail?.projectName) {
    return `${projectDetail.projectName} — property enquiry`;
  }
  return "My Property Fact — find your perfect property";
}
