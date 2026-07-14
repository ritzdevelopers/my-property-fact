"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { sanitizeHtml } from "@/app/_global_components/sanitize";
import {
  buildBuilderLogoImageUrl,
  sanitizeBuilderDescriptionHtml,
} from "@/lib/builderLogoImageUrl";

export default function BuilderShowcase({ builderData, projectCount = 0 }) {
  const panelRef = useRef(null);
  const builderName = builderData?.builderName?.trim() || "Builder";
  const logoSrc = buildBuilderLogoImageUrl(builderData);
  const logoAlt = `${builderName} — developer logo`;
  const initials = builderName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
  const rawDescription =
    builderData?.builderDescription || builderData?.builderDesc || "";
  const description = sanitizeBuilderDescriptionHtml(
    sanitizeHtml(rawDescription),
    builderName,
  );

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const frame = window.requestAnimationFrame(() => {
      panel.classList.add("is-visible");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <aside className="builder-showcase" aria-label={`${builderName} overview`}>
      <div className="builder-showcase__panel" ref={panelRef}>
        <div className="builder-showcase__hero-card">
          <div className="builder-showcase__hero-image">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={logoAlt}
                title={logoAlt}
                className="builder-showcase__logo"
                loading="eager"
                fetchPriority="high"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                  const fallback = event.currentTarget.nextElementSibling;
                  if (fallback) fallback.hidden = false;
                }}
              />
            ) : null}
            <div
              className="builder-showcase__logo-fallback"
              hidden={Boolean(logoSrc)}
              aria-hidden={Boolean(logoSrc)}
            >
              <span>{initials || "B"}</span>
            </div>
          </div>
          <div className="builder-showcase__hero-info">
            <p className="builder-showcase__name">{builderName}</p>
            <p className="builder-showcase__tagline">Trusted Developer</p>
            <div className="builder-showcase__stats">
              {projectCount > 0 ? (
                <span className="builder-showcase__stat">
                  <strong>{projectCount}</strong> Project
                  {projectCount === 1 ? "" : "s"}
                </span>
              ) : null}
              <span className="builder-showcase__stat builder-showcase__stat--rera">
                RERA Verified
              </span>
            </div>
          </div>
        </div>

        <div className="builder-showcase__connector" aria-hidden="true">
          <span className="builder-showcase__connector-line" />
          <span className="builder-showcase__connector-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 5v14M5 13l7 7 7-7"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        <div className="builder-showcase__details">
          <div className="builder-showcase__description-wrap">
            {description ? (
              <div
                className="builder-showcase__description"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <p className="builder-showcase__description builder-showcase__description--plain">
                Explore premium residential and commercial projects by{" "}
                {builderName}. Discover thoughtfully designed spaces built for
                modern living.
              </p>
            )}
          </div>

          <div className="builder-showcase__cta">
            <p className="builder-showcase__cta-text">
              Need help choosing a project by {builderName}?
            </p>
            <Link href="/contact-us" className="builder-showcase__cta-btn" title="Contact us">
              Talk to an expert
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
