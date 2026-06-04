"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./latestproject.css";

const NO_IMAGE = "/static/no_image.png";

function cleanMetaText(value, fallback = "") {
  const text = String(value ?? "").trim();
  if (!text || text === "/" || text.toLowerCase() === "null") return fallback;
  return text;
}

function formatProjectPrice(value) {
  if (value == null || value === "") return "Price on request";
  const strValue = String(value).trim();
  if (!strValue) return "Price on request";
  if (/[a-zA-Z]/.test(strValue)) return strValue;
  const numericValue = Number.parseFloat(strValue.replace(/,/g, ""));
  if (!Number.isFinite(numericValue) || numericValue <= 0) return "Price on request";
  if (numericValue < 1) return `₹ ${Math.round(numericValue * 100)} Lakh* Onwards`;
  return `₹ ${numericValue} Cr* Onwards`;
}

function resolveProjectImage(project) {
  const imageBase =
    (typeof process.env.NEXT_PUBLIC_IMAGE_URL === "string" &&
      process.env.NEXT_PUBLIC_IMAGE_URL) ||
    "";
  const slug = project?.slugURL || project?.slugUrl || project?.projectName;
  const rawImage =
    project?.projectBannerImage || project?.projectThumbnailImage || project?.bannerImage || "";

  let primary = null;
  if (typeof rawImage === "string" && rawImage.trim()) {
    if (rawImage.startsWith("http")) primary = rawImage.trim();
    else if (imageBase && slug) {
      primary = `${imageBase}properties/${slug}/${rawImage.trim()}`;
    }
  }

  return { primary, fallback: NO_IMAGE };
}

function getProjectLocation(project) {
  return (
    project?.projectAddress ||
    [project?.projectLocality, project?.cityName, project?.stateName].filter(Boolean).join(", ") ||
    [project?.cityName, project?.stateName].filter(Boolean).join(", ") ||
    "Location details available on project page"
  );
}

function slugifyBuilderName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getBuilderHref(project) {
  const slug = cleanMetaText(
    project?.builderSlug ||
      project?.builderSlugURL ||
      project?.builder?.slugUrl ||
      project?.builder?.slugURL ||
      slugifyBuilderName(project?.builderName),
  );
  return slug ? `/builder/${slug}` : null;
}

function parseProjectConfiguration(config) {
  const text = cleanMetaText(config);
  if (!text) return { type: "", area: "" };

  const areaMatch = text.match(/(\d[\d,]*(?:\.\d+)?\s*(?:sq\.?\s*ft\.?|sqft))/i);
  const area = areaMatch ? areaMatch[1].replace(/\s+/g, " ").replace(/sqft/i, "sq.ft") : "";

  let type = text;
  if (areaMatch) {
    type = text
      .replace(areaMatch[0], "")
      .replace(/\s*[-–,|]\s*$/g, "")
      .trim();
  }

  return { type, area };
}

function mapProjectToCard(project) {
  const title = cleanMetaText(project?.projectName, "Project");
  const builderName = cleanMetaText(project?.builderName, "Developer");
  const { type, area } = parseProjectConfiguration(project?.projectConfiguration);
  const slug = project?.slugURL || project?.slugUrl;
  const images = resolveProjectImage(project);

  return {
    key: slug || title,
    href: slug ? `/${slug}` : "/projects",
    primaryImage: images.primary,
    fallbackImage: images.fallback,
    title,
    location: getProjectLocation(project),
    price: formatProjectPrice(project?.projectPrice ?? project?.projectStartingPrice),
    type: type || "",
    area: area || "",
    builderName,
    builderHref: getBuilderHref(project),
  };
}

function ProjectCardImage({ primarySrc, fallbackSrc = NO_IMAGE, alt }) {
  const [src, setSrc] = useState(primarySrc || fallbackSrc);
  const isPlaceholder = src === fallbackSrc;

  useEffect(() => {
    setSrc(primarySrc || fallbackSrc);
  }, [primarySrc, fallbackSrc]);

  const handleError = () => {
    if (src !== fallbackSrc) setSrc(fallbackSrc);
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`lp-card__img${isPlaceholder ? " lp-card__img--placeholder" : ""}`}
      onError={handleError}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
}

function ProjectCard({ card }) {
  return (
    <article className="lp-card">
      <div className="lp-card__inner">
        <div className="lp-card__left">
          <Link href={card.href} className="lp-card__thumb" title={`View ${card.title}`}>
            <ProjectCardImage
              primarySrc={card.primaryImage}
              fallbackSrc={card.fallbackImage}
              alt={card.title}
            />
          </Link>
          <div className="lp-card__builder">
            <p className="lp-card__builderName">{card.builderName}</p>
            {card.builderHref ? (
              <Link
                href={card.builderHref}
                className="lp-card__builderLink"
                title={`View projects by ${card.builderName}`}
              >
                View Projects by {card.builderName}
                <span className="lp-card__arrow" aria-hidden>
                  ›
                </span>
              </Link>
            ) : (
              <span className="lp-card__builderLink">
                View Projects by {card.builderName}
                <span className="lp-card__arrow" aria-hidden>
                  ›
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="lp-card__right">
          <Link href={card.href} className="lp-card__head" title={`View ${card.title}`}>
            <h3 className="lp-card__title">{card.title}</h3>
            <p className="lp-card__location">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/static/icon/map.png" alt="" aria-hidden className="lp-card__pin" />
              <span>{card.location}</span>
            </p>
            <p className="lp-card__price">{card.price}</p>
            <div className="lp-card__specs">
              {card.type ? <p className="lp-card__bhk">{card.type}</p> : null}
              {card.area ? <p className="lp-card__sqft">{card.area}</p> : null}
            </div>
          </Link>
        </div>
      </div>
    </article>
  );
}

/**
 * @param {{ projects?: object[], className?: string, ariaLabel?: string }} props
 */
export default function LatestProject({
  projects = [],
  className = "",
  ariaLabel = "Latest projects",
}) {
  const cards = (Array.isArray(projects) ? projects : [])
    .filter((project) => project?.projectName || project?.slugURL)
    .map(mapProjectToCard);

  if (!cards.length) return null;

  const renderSegment = (prefix) =>
    cards.map((card) => <ProjectCard key={`${prefix}-${card.key}`} card={card} />);

  return (
    <section className={`lp-section container ${className}`.trim()} aria-label={ariaLabel}>
      <div className="lp-marquee">
        <div className="lp-track">
          <div className="lp-track__seg">{renderSegment("a")}</div>
          <div className="lp-track__seg" aria-hidden>
            {renderSegment("b")}
          </div>
        </div>
      </div>
    </section>
  );
}
