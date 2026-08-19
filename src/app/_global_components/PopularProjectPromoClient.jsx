"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  isHomeGatewayRevealDone,
  MPF_GATEWAY_HIDDEN_EVENT,
} from "./mpfGatewayEvents";
import "./PopularProjectPromo.css";

/* Slower full-card out/in; must stay in sync with PopularProjectPromo.css */
const AUTO_ROTATE_MS = 30000;
/* Match CSS: exit transition 1.2s, enter keyframe 1.25s + small buffer */
const SLIDE_OUT_MS = 1250;
const SLIDE_IN_MS = 1350;

function imageBaseUrl() {
  const raw = (process.env.NEXT_PUBLIC_IMAGE_URL || "").trim();
  if (!raw) return "";
  return raw.endsWith("/") ? raw : `${raw}/`;
}

function buildImageUrl(project) {
  const slug = project?.slugURL || project?.slugUrl;
  const raw =
    project?.projectBannerImage ||
    project?.projectThumbnailImage ||
    project?.bannerImage ||
    "";
  if (typeof raw === "string" && raw.startsWith("http")) return raw;
  const base = imageBaseUrl();
  if (base && slug && raw) return `${base}properties/${slug}/${raw}`;
  return "/static/no_image.png";
}

function toPromoItem(project) {
  const slug = project?.slugURL || project?.slugUrl;
  if (!slug) return null;
  const name = String(project?.projectName || "").trim() || "Project";
  return {
    key: slug,
    name,
    href: `/${slug}`,
    imageUrl: buildImageUrl(project),
  };
}

function getSlideDurations() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return { out: SLIDE_OUT_MS, inn: SLIDE_IN_MS };
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return { out: 0, inn: 0 };
  }
  return { out: SLIDE_OUT_MS, inn: SLIDE_IN_MS };
}

/**
 * @param {Object} props
 * @param {Array<{ key: string; name: string; href: string; imageUrl: string }>} props.items
 * @param {number} [props.showAfterMs]
 */
export default function PopularProjectPromoClient({ items, showAfterMs = 1000 }) {
  const pathname = usePathname() || "/";
  const isHome = pathname === "/";
  const [dismissed, setDismissed] = useState(false);
  /** On `/`, defer promo until the entry loader (WebsiteGateway) finishes or is skipped (SPA). */
  const [gatewayRevealDone, setGatewayRevealDone] = useState(() => !isHome);
  /** On home, wait until the user scrolls down before showing the promo. */
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [ready, setReady] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [displayIdx, setDisplayIdx] = useState(0);
  const [cardPhase, setCardPhase] = useState("idle");
  const hoverRef = useRef(false);
  const [locationItems, setLocationItems] = useState(null);
  const list = Array.isArray(locationItems) && locationItems.length
    ? locationItems
    : Array.isArray(items)
      ? items
      : [];

  // This location-based promotional card belongs exclusively on the home page.
  const hideByRoute = !isHome;

  useEffect(() => {
    if (!isHome) {
      setGatewayRevealDone(true);
      return undefined;
    }
    const sync = () => {
      if (isHomeGatewayRevealDone()) setGatewayRevealDone(true);
    };
    sync();
    if (isHomeGatewayRevealDone()) return undefined;

    const onHidden = () => setGatewayRevealDone(true);
    window.addEventListener(MPF_GATEWAY_HIDDEN_EVENT, onHidden);
    return () => window.removeEventListener(MPF_GATEWAY_HIDDEN_EVENT, onHidden);
  }, [isHome]);

  useEffect(() => {
    if (!isHome) {
      setScrolledPastHero(true);
      return undefined;
    }

    const SHOW_AFTER_SCROLL_PX = Math.max(360, Math.round(window.innerHeight * 0.45));
    const update = () => {
      setScrolledPastHero(window.scrollY >= SHOW_AFTER_SCROLL_PX);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isHome]);

  useEffect(() => {
    if (list.length === 0 || hideByRoute || dismissed || !gatewayRevealDone) {
      setReady(false);
      return undefined;
    }
    if (isHome && !scrolledPastHero) {
      setReady(false);
      return undefined;
    }
    const t = window.setTimeout(() => setReady(true), showAfterMs);
    return () => window.clearTimeout(t);
  }, [
    list.length,
    hideByRoute,
    dismissed,
    showAfterMs,
    gatewayRevealDone,
    isHome,
    scrolledPastHero,
  ]);

  useEffect(() => {
    if (hideByRoute || dismissed) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude, accuracy } = pos.coords;
          const q = new URLSearchParams({
            lat: String(latitude),
            lon: String(longitude),
            intent: "popular-promo",
          });
          if (typeof accuracy === "number" && Number.isFinite(accuracy)) {
            q.set("accuracy", String(Math.round(accuracy)));
          }
          const res = await fetch(`/api/home/recommended-by-location?${q.toString()}`);
          const data = await res.json();
          if (!cancelled && data?.success && Array.isArray(data?.items) && data.items.length) {
            const mapped = data.items.map(toPromoItem).filter(Boolean);
            if (mapped.length) setLocationItems(mapped);
          }
        } catch {
          // Keep server fallback list
        }
      },
      () => {
        // Permission denied/unavailable -> keep fallback list
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 20000,
      },
    );

    return () => {
      cancelled = true;
    };
  }, [hideByRoute, dismissed]);

  useEffect(() => {
    if (!ready || dismissed || list.length <= 1) return undefined;
    const id = window.setInterval(() => {
      if (hoverRef.current) return;
      setActiveIdx((i) => (i + 1) % list.length);
    }, AUTO_ROTATE_MS);
    return () => window.clearInterval(id);
  }, [ready, dismissed, list.length]);

  useEffect(() => {
    if (!ready) return undefined;
    if (list.length === 0) return undefined;
    if (activeIdx === displayIdx) return undefined;

    const { out, inn } = getSlideDurations();
    if (out === 0 && inn === 0) {
      setDisplayIdx(activeIdx);
      setCardPhase("idle");
      return undefined;
    }

    let innerT;
    setCardPhase("exit");
    const outT = window.setTimeout(() => {
      setDisplayIdx(activeIdx);
      setCardPhase("enter");
      innerT = window.setTimeout(() => {
        setCardPhase("idle");
      }, inn);
    }, out);

    return () => {
      window.clearTimeout(outT);
      if (innerT) window.clearTimeout(innerT);
    };
  }, [activeIdx, displayIdx, ready, list.length]);

  const goTo = useCallback((idx) => {
    setActiveIdx(idx);
  }, []);

  if (list.length === 0 || hideByRoute || dismissed || !ready) return null;

  const current = list[displayIdx] || list[0];
  if (!current) return null;

  const thumbAltTitle = `${current.name} — popular project preview, My Property Fact`;

  const cardClass = [
    "popular-project-promo",
    cardPhase === "exit" ? "popular-project-promo--card-exit" : "",
    cardPhase === "enter" ? "popular-project-promo--card-enter" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cardClass}
      role="complementary"
      aria-label="Popular projects"
      aria-hidden={cardPhase === "exit"}
      onMouseEnter={() => {
        hoverRef.current = true;
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
      }}
    >
      <button
        type="button"
        className="popular-project-promo__close"
        onClick={() => setDismissed(true)}
        aria-label="Close"
      >
        ×
      </button>
      <div className="popular-project-promo__labelRow">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="popular-project-promo__labelIcon"
          aria-hidden="true"
        >
          <path d="M7 10v12" />
          <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
        </svg>
        <p className="popular-project-promo__label">Popular right now</p>
      </div>
      <div className="popular-project-promo__row" key={current.key}>
        <div className="popular-project-promo__thumb">
          <img
            src={current.imageUrl}
            alt={thumbAltTitle}
            title={thumbAltTitle}
            width={56}
            height={56}
            loading="lazy"
            onError={(e) => {
              if (e.currentTarget) e.currentTarget.src = "/static/no_image.png";
            }}
          />
        </div>
        <div className="popular-project-promo__text">
          <p className="popular-project-promo__name" title={current.name}>
            {current.name}
          </p>
          <Link
            href={current.href}
            className="popular-project-promo__explore"
            target="_blank"
            rel="noopener noreferrer"
            title={`Explore ${current.name}`}
          >
            Explore
          </Link>
        </div>
      </div>
      {list.length > 1 && (
        <div
          className="popular-project-promo__dots"
          role="tablist"
          aria-label="Switch popular project"
        >
          {list.map((it, idx) => (
            <button
              key={it.key}
              type="button"
              role="tab"
              aria-selected={idx === activeIdx}
              className={
                idx === activeIdx
                  ? "popular-project-promo__dot popular-project-promo__dot--active"
                  : "popular-project-promo__dot"
              }
              title={it.name}
              aria-label={`Show ${it.name}`}
              onClick={() => goTo(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
