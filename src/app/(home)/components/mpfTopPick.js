import Link from "next/link";
import {
  buildProjectImageUrl,
  DEFAULT_PROJECT_CARD_IMAGE,
} from "@/lib/projectImageUrl";
import { buildProjectDisplayName } from "@/lib/projectDisplayName";
import "./common.css";
import "./mpfTopPick.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { RiArrowRightSLine } from "react-icons/ri";

export default function MpfTopPicks({ topProject }) {
  if (!topProject) {
    return null;
  }

  const {
    builderName,
    builderSlug,
    projectName,
    projectAddress,
    projectConfiguration,
    projectPrice,
    projectLogo,
    projectThumbnailImage,
    projectBannerImage,
    slugURL,
    projectStatusName,
  } = topProject;

  const statusDisplay =
    projectStatusName && String(projectStatusName).trim()
      ? String(projectStatusName).trim()
      : null;
  const statusHoverLabel = statusDisplay
    ? `Project status: ${statusDisplay}`
    : "Project status: not specified in listing — see project page for details";

  const generatePrice = (price) => {
    if (/[a-zA-Z]/.test(price)) {
      return price;
    }
    return price < 1
      ? "₹ " + Math.round(parseFloat(price) * 100) + " Lakh* Onwards"
      : "₹ " + parseFloat(price) + " Cr* Onwards";
  };

  const imageBase =
    (typeof process.env.NEXT_PUBLIC_IMAGE_URL === "string" &&
      process.env.NEXT_PUBLIC_IMAGE_URL) ||
    "";
  const canBuildImageUrl = imageBase && slugURL;

  const bannerImageSrc = buildProjectImageUrl(
    { slugURL, projectThumbnailImage, projectBannerImage },
    { preferThumbnail: true, fallback: DEFAULT_PROJECT_CARD_IMAGE },
  );

  const logoSrc =
    projectLogo && canBuildImageUrl && !projectLogo.startsWith("http")
      ? `${imageBase}properties/${slugURL}/${projectLogo}`
      : projectLogo?.startsWith("http")
        ? projectLogo
        : "/logo_flag_color.png";

  const builderLogoAlt = builderName
    ? `${builderName} — builder logo, My Property Fact Top Picks`
    : "Builder logo — My Property Fact Top Picks";
  const topPicksBannerAlt = projectName
    ? `${projectName} — My Property Fact Top Picks featured project banner`
    : "Top Picks featured project banner — My Property Fact";

  return (
    <div className="mpf-tp mpf-tp--i80">
      <div className="mpf-tp__band">
        <section className="container pt-0 pt-lg-2 top-space">
          <div className="mpf-tp__wrap">
          <header className="mpf-tp__head">
            <div className="mpf-tp__kicker-row">
              <span className="mpf-tp__kicker" aria-hidden="true">
                Featured pick
              </span>
              <span className="mpf-tp__i80-badge">
                <img
                  className="mpf-tp__i80-badge-mark"
                  src="/static/banners/mpf-i80-emblem.webp"
                  alt=""
                  width={48}
                  height={39}
                />
                Independence Day Spotlight
              </span>
            </div>
            <h2 className="mpf-tp__title plus-jakarta-sans-semi-bold">
              My Property Fact&apos;s Top Picks
            </h2>
            <p className="mpf-tp__sub">
              A curated, verified project we spotlight for buyers and investors on
              MPF, celebrating 80 years of India&apos;s growth.
            </p>
          </header>

          <div className="mpf-tp__card">
            <span className="mpf-tp__i80-trim" aria-hidden="true" />
            <div className="mpf-tp__main">
              <div className="mpf-tp__dev">
                <div className="mpf-tp__logo">
                  <img
                    src={logoSrc}
                    alt={builderLogoAlt}
                    title={builderLogoAlt}
                    width={220}
                    height={110}
                    className="mpf-tp__logo-img img-fluid"
                  />
                </div>
                <div className="mpf-tp__dev-txt">
                  <span className="mpf-tp__eyebrow">Developer</span>
                  <p className="mpf-tp__builder plus-jakarta-sans-semi-bold">
                    {builderName}
                  </p>
                  {builderSlug && (
                    <Link
                      href={`/builder/${builderSlug}`}
                      className="mpf-tp__link"
                      aria-label={`View projects by ${builderName}`}
                      title={`View projects by ${builderName}`}
                    >
                      View projects by {builderName}{" "}
                      <RiArrowRightSLine aria-hidden />
                    </Link>
                  )}
                </div>
              </div>

              <h3 className="mpf-tp__project plus-jakarta-sans-semi-bold">
                {buildProjectDisplayName(topProject, projectName)}
              </h3>
              <p className="mpf-tp__addr">
                <FontAwesomeIcon
                  className="mpf-tp__addr-icon"
                  icon={faLocationDot}
                />
                <span>{projectAddress}</span>
              </p>

              <div className="mpf-tp__chips">
                <div className="mpf-tp__chip mpf-tp__chip--price">
                  <img
                    src="/static/icon/arrow.png"
                    alt="Starting price indicator — My Property Fact Top Picks"
                    title="Starting price indicator — My Property Fact Top Picks"
                    width={14}
                    height={14}
                    aria-hidden
                  />
                  <div>
                    <span className="mpf-tp__chip-lbl">Starting from</span>
                    <p>{generatePrice(projectPrice)}</p>
                  </div>
                </div>
                <div className="mpf-tp__chip mpf-tp__chip--config">
                  <img
                    src="/static/icon/home.png"
                    alt="Property configuration icon — My Property Fact Top Picks"
                    title="Property configuration icon — My Property Fact Top Picks"
                    width={16}
                    height={16}
                    aria-hidden
                  />
                  <span>{projectConfiguration}</span>
                </div>
              </div>

              <Link
                href={`/${slugURL}`}
                className="mpf-tp__cta btn-normal-color plus-jakarta-sans-semi-bold"
                aria-label={`View ${projectName} — floor plans, pricing, and details`}
              >
                <span>Explore {projectName}</span>
                <RiArrowRightSLine aria-hidden />
              </Link>
            </div>

              <Link
                href={`/${slugURL}`}
                className="mpf-tp__figure"
                aria-label={`Open ${projectName} — view photos and full details`}
              >
              <img
                src={bannerImageSrc}
                alt={topPicksBannerAlt}
                className="mpf-tp__img"
                loading="lazy"
                fetchPriority="low"
                decoding="async"
               style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
              <div className="mpf-tp__grad" aria-hidden="true" />
              <div className="mpf-tp__status" title={statusHoverLabel}>
                <span className="mpf-tp__status-eyebrow">Status</span>
                <span className="mpf-tp__status-text">
                  {statusDisplay ?? "See project page"}
                </span>
              </div>
            </Link>
          </div>
          </div>
        </section>
      </div>
    </div>
  );
}
