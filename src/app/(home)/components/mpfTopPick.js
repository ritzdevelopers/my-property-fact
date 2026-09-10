"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  LuArrowLeft,
  LuArrowRight,
  LuLeaf,
  LuMapPin,
  LuShieldCheck,
  LuSparkles,
  LuUsers,
} from "react-icons/lu";
import { PiBuildingsFill, PiChartLineUpBold } from "react-icons/pi";
import {
  buildGalleryImageUrl,
  buildProjectImageUrl,
  DEFAULT_PROJECT_CARD_IMAGE,
} from "@/lib/projectImageUrl";
import { getTopPickEditorial } from "./topPicksContent";
import "./common.css";
import "./mpfTopPick.css";

const USP_ICONS = {
  green: LuLeaf,
  amenities: LuUsers,
  gated: LuShieldCheck,
};

const pad2 = (value) => String(value).padStart(2, "0");

/**
 * Half-ellipse matching the curve language of the cream plaque.
 * Object-bounding-box units keep it proportional without matching plaque size.
 */
const MEDIA_CLIP_PATH =
  "M1,0 H0.24 C0.1075,0 0,0.2239 0,0.5 C0,0.7761 0.1075,1 0.24,1 H1 Z";

/** "2 BHK-863 sq.ft, 3 BHK-990 sq.ft, 4 BHK-1552 sq.ft" → "2, 3 & 4 BHK" */
function summariseConfiguration(configuration) {
  const raw = String(configuration ?? "").trim();
  if (!raw) return "";

  const sizes = [...new Set(raw.match(/\d+(?=\s*BHK)/gi) ?? [])].sort(
    (a, b) => Number(a) - Number(b),
  );
  if (sizes.length === 0) return raw.split(",")[0].trim();
  if (sizes.length === 1) return `${sizes[0]} BHK`;
  return `${sizes.slice(0, -1).join(", ")} & ${sizes[sizes.length - 1]} BHK`;
}

function formatStartingPrice(price) {
  const raw = String(price ?? "").trim();
  if (!raw) return "";
  if (/[a-z]/i.test(raw)) return raw;

  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return raw;
  return value < 1 ? `₹ ${Math.round(value * 100)} Lakh*` : `₹ ${value} Cr*`;
}

/** The CMS stores "New Launched"; the badge reads better as "New Launch". */
function formatStatusBadge(status) {
  const raw = String(status ?? "").trim();
  if (!raw) return "";
  return /^new launched$/i.test(raw) ? "New Launch" : raw;
}

function buildSlide(project) {
  const slug = String(project.slugURL ?? "").trim();
  const editorial = getTopPickEditorial(slug);
  const projectName = String(project.projectName ?? "").trim();
  const builderName = String(project.builderName ?? "").trim();
  const isCommercial = project.propertyTypeName === "Commercial";

  // Each stat has a bold "strong" line and a muted caption. `strongFirst`
  // controls which sits on top — the config value leads, the others caption-first.
  const stats = [];
  const configuration = summariseConfiguration(project.projectConfiguration);
  if (configuration) {
    stats.push({
      key: "configuration",
      Icon: PiBuildingsFill,
      strong: configuration,
      muted: isCommercial ? "Commercial Spaces" : "Premium Residences",
      strongFirst: true,
    });
  }
  if (editorial.possession) {
    stats.push({
      key: "possession",
      Icon: LuLeaf,
      strong: editorial.possession,
      muted: "Possession",
      strongFirst: false,
    });
  }
  const price = formatStartingPrice(project.projectPrice);
  if (price) {
    stats.push({
      key: "price",
      Icon: PiChartLineUpBold,
      strong: price,
      muted: "Starting From",
      strongFirst: false,
    });
  }

  const imageAlt = projectName
    ? `${projectName} — My Property Fact Top Picks featured project`
    : "Featured project — My Property Fact Top Picks";
  const logoAlt = builderName
    ? `${builderName} — builder logo, My Property Fact Top Picks`
    : "Builder logo — My Property Fact Top Picks";

  return {
    slug,
    href: slug ? `/${slug}` : "/projects",
    projectName,
    shortName: editorial.shortName || projectName,
    builderName,
    builderSlug: String(project.builderSlug ?? "").trim(),
    address: String(project.projectAddress ?? "").trim(),
    locality: String(project.projectLocality ?? "").trim(),
    city: String(project.cityName ?? "").trim(),
    tagline: editorial.tagline ?? "",
    plaqueTitle: editorial.plaqueTitle ?? "",
    usps: Array.isArray(editorial.usps) ? editorial.usps : [],
    videoUrl: editorial.videoUrl ?? "",
    statusFull: String(project.projectStatusName ?? "").trim(),
    status: formatStatusBadge(project.projectStatusName),
    stats,
    image: buildProjectImageUrl(project, {
      preferThumbnail: false,
      fallback: DEFAULT_PROJECT_CARD_IMAGE,
    }),
    imageAlt,
    logo: buildGalleryImageUrl(slug, project.projectLogo, {
      fallback: "/logo.webp",
    }),
    logoAlt,
  };
}

export default function MpfTopPicks({ topProjects }) {
  const slides = useMemo(
    () =>
      (Array.isArray(topProjects) ? topProjects : [])
        .filter((project) => project && project.projectName)
        .map(buildSlide),
    [topProjects],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const baseId = useId();
  // useId output contains characters that are unsafe inside a CSS url() fragment.
  const clipId = `mpf-tp-clip-${baseId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const total = slides.length;
  const hasMultiple = total > 1;
  const safeIndex = activeIndex < total ? activeIndex : 0;

  const step = useCallback(
    (delta) => {
      setActiveIndex((current) => {
        if (total < 1) return 0;
        return (current + delta + total) % total;
      });
    },
    [total],
  );

  // Auto-advance between projects every minute. The timer resets on every slide
  // change (safeIndex dependency), so a manual click also restarts the countdown.
  useEffect(() => {
    if (!hasMultiple) return undefined;
    const id = setInterval(() => step(1), 60000);
    return () => clearInterval(id);
  }, [hasMultiple, safeIndex, step]);

  if (total === 0) return null;

  return (
    <section
      className="mpf-tp"
      aria-labelledby={`${baseId}-heading`}
      style={{ "--mpf-tp-clip": `url(#${clipId})` }}
    >
      <svg className="mpf-tp__defs" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={MEDIA_CLIP_PATH} />
          </clipPath>
        </defs>
      </svg>
      <div className="mpf-tp__band">
        <div className="container">
          <header className="mpf-tp__head">
            <div className="mpf-tp__head-copy">
              <span className="mpf-tp__kicker">Featured pick</span>
              <h2
                id={`${baseId}-heading`}
                className="mpf-tp__title plus-jakarta-sans-semi-bold"
              >
                My Property Fact&apos;s{" "}
                <span className="mpf-tp__title-accent">Top Picks</span>
              </h2>
              <p className="mpf-tp__sub">
                A curated, verified project we spotlight for buyers and
                investors on MPF
              </p>
            </div>

            {hasMultiple && (
              <div className="mpf-tp__nav">
                <p className="mpf-tp__count">
                  <span className="mpf-tp__count-now">
                    {pad2(safeIndex + 1)}
                  </span>
                  <span className="mpf-tp__count-sep" aria-hidden="true">
                    /
                  </span>
                  <span className="mpf-tp__count-all">{pad2(total)}</span>
                </p>
                <span className="mpf-tp__track" aria-hidden="true">
                  <span
                    className="mpf-tp__track-fill"
                    style={{ width: `${((safeIndex + 1) / total) * 100}%` }}
                  />
                </span>
                <button
                  type="button"
                  className="mpf-tp__arrow"
                  onClick={() => step(-1)}
                  aria-label="Show previous top pick"
                  title="Show previous top pick"
                >
                  <LuArrowLeft aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="mpf-tp__arrow mpf-tp__arrow--next"
                  onClick={() => step(1)}
                  aria-label="Show next top pick"
                  title="Show next top pick"
                >
                  <LuArrowRight aria-hidden="true" />
                </button>
              </div>
            )}
          </header>

          <div className="mpf-tp__stage">
            {slides.map((slide, index) => {
              const isActive = index === safeIndex;
              return (
                <article
                  key={slide.slug || slide.projectName}
                  id={`${baseId}-panel-${index}`}
                  aria-label={`${slide.projectName} — featured top pick`}
                  aria-hidden={!isActive}
                  className={`mpf-tp__card${isActive ? " is-active" : ""}`}
                >
                  <div className="mpf-tp__media">
                    <img
                      src={slide.image}
                      alt={slide.imageAlt}
                      title={slide.imageAlt}
                      className="mpf-tp__img"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                    />
                    <span className="mpf-tp__scrim" aria-hidden="true" />

                    {slide.plaqueTitle && (
                      <div className="mpf-tp__plaque">
                        <p className="mpf-tp__plaque-title">
                          {slide.plaqueTitle}
                        </p>
                        <span
                          className="mpf-tp__plaque-rule"
                          aria-hidden="true"
                        />
                        {(slide.locality || slide.city) && (
                          <p className="mpf-tp__plaque-loc">
                            {slide.locality && <span>{slide.locality}</span>}
                            {slide.city && <span>{slide.city}</span>}
                          </p>
                        )}
                      </div>
                    )}

                    {slide.usps.length > 0 && (
                      <ul className="mpf-tp__usps">
                        {slide.usps.map((usp) => {
                          const Icon = USP_ICONS[usp.icon] ?? LuSparkles;
                          return (
                            <li
                              className="mpf-tp__usp"
                              key={`${usp.title}-${usp.note}`}
                            >
                              <Icon
                                className="mpf-tp__usp-icon"
                                aria-hidden="true"
                              />
                              <span className="mpf-tp__usp-txt">
                                <strong>{usp.title}</strong>
                                {usp.note}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {slide.status && (
                      <p
                        className="mpf-tp__badge"
                        title={`Project status: ${slide.statusFull}`}
                      >
                        {slide.status}
                      </p>
                    )}
                  </div>

                  <div className="mpf-tp__panel">
                    <div className="mpf-tp__dev">
                      <img
                        src={slide.logo}
                        alt={slide.logoAlt}
                        title={slide.logoAlt}
                        className="mpf-tp__dev-logo"
                        width={160}
                        height={64}
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="mpf-tp__dev-rule" aria-hidden="true" />
                      <div className="mpf-tp__dev-txt">
                        <span className="mpf-tp__eyebrow">Developer</span>
                        {slide.builderSlug ? (
                          <Link
                            href={`/builder/${slide.builderSlug}`}
                            className="mpf-tp__dev-name"
                            title={`View projects by ${slide.builderName}`}
                          >
                            {slide.builderName}
                          </Link>
                        ) : (
                          <p className="mpf-tp__dev-name">
                            {slide.builderName}
                          </p>
                        )}
                      </div>
                    </div>

                    <h3 className="mpf-tp__project plus-jakarta-sans-semi-bold">
                      {slide.projectName}
                    </h3>

                    {slide.address && (
                      <p className="mpf-tp__addr">
                        <LuMapPin
                          className="mpf-tp__addr-icon"
                          aria-hidden="true"
                        />
                        <span>{slide.address}</span>
                      </p>
                    )}

                    {slide.tagline && (
                      <p className="mpf-tp__tag">{slide.tagline}</p>
                    )}

                    {slide.stats.length > 0 && (
                      <ul className="mpf-tp__stats">
                        {slide.stats.map(
                          ({ key, Icon, strong, muted, strongFirst }) => {
                            const strongLine = (
                              <strong
                                className="mpf-tp__stat-strong"
                                key="strong"
                              >
                                {strong}
                              </strong>
                            );
                            const mutedLine = (
                              <span className="mpf-tp__stat-muted" key="muted">
                                {muted}
                              </span>
                            );
                            return (
                              <li className="mpf-tp__stat" key={key}>
                                <Icon
                                  className="mpf-tp__stat-icon"
                                  aria-hidden="true"
                                />
                                <span className="mpf-tp__stat-txt">
                                  {strongFirst
                                    ? [strongLine, mutedLine]
                                    : [mutedLine, strongLine]}
                                </span>
                              </li>
                            );
                          },
                        )}
                      </ul>
                    )}

                    <div className="mpf-tp__actions">
                      <Link
                        href={slide.href}
                        className="mpf-tp__cta plus-jakarta-sans-semi-bold"
                        title={`View ${slide.projectName} — floor plans, pricing, and details`}
                      >
                        <span>Explore Project</span>
                        <LuArrowRight aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
