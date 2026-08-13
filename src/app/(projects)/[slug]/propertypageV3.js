"use client";

/**
 * Property Detail V3 — 99acres-style layout, MPF branding.
 * Consumes the same props as V1/V2 (`projectDetail`, `similarProjects`, `nearbyBenefitsList`).
 */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { formatDistanceKm } from "@/lib/utils";
import { peekListingReturnState } from "@/lib/listingScrollRestore";
import {
  getCityPageHref,
  resolveCitySlug,
} from "@/app/_global_components/cityAliasUtils";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faLocationDot,
  faPhone,
  faPlus,
  faCamera,
  faShieldHalved,
  faHouseChimney,
  faCube,
  faArrowRight,
  faArrowLeft,
  faDownload,
  faTimes,
  faMagnifyingGlass,
  faMicrophone,
  faStop,
} from "@fortawesome/free-solid-svg-icons";
import { Modal } from "react-bootstrap";
import CommonPopUpform from "../../(home)/components/common/popupform";
import { sanitizeHtml } from "../../_global_components/sanitize";
import {
  findBestProjectBySearch,
  scoreProjectSearchMatch,
} from "../../_global_components/projectSearchUtils";
import { buildProjectImageUrl } from "@/lib/projectImageUrl";
import { buildProjectDisplayName } from "@/lib/projectDisplayName";
import "./propertyV3.css";
/** Amenity grid + “View more” side panel + gallery lightbox (shared with V2). */
import "./propertyV2.css";

/* ---------------------------- Utilities ---------------------------- */

function generatePrice(price) {
  if (price == null || price === "") return "Price on Request";
  if (/[a-zA-Z]/.test(String(price))) return String(price);
  const num = parseFloat(price);
  if (!Number.isFinite(num)) return "Price on Request";
  return num < 1
    ? `₹ ${Math.round(num * 100)} Lakh* Onwards`
    : `₹ ${num} Cr* Onwards`;
}

function getFloorPlanArea(plan) {
  const sqFt = plan?.areaSqFt ?? plan?.areaSqft ?? plan?.area ?? plan?.size;
  const sqMt = plan?.areaSqMt != null ? parseFloat(plan.areaSqMt) : null;
  if (!sqFt && sqMt == null) return "On Request";
  const parts = [];
  if (sqFt) parts.push(`${String(sqFt).trim()} sq ft`);
  if (Number.isFinite(sqMt)) parts.push(`${sqMt.toFixed(2)} sq mt`);
  return parts.length ? parts.join(" · ") : "On Request";
}

/** Extract BHK bucket label, e.g. "3 BHK Apartment". */
function getBhkLabel(plan) {
  const raw = String(plan?.planType || "").trim();
  if (!raw) return "Other";
  const m = raw.match(/(\d+)\s*BHK/i);
  if (m) return `${m[1]} BHK`;
  return raw.length > 16 ? `${raw.slice(0, 16)}…` : raw;
}

/** Strip HTML to short plain-text bullets. */
function extractBullets(html, max = 4) {
  if (!html || typeof html !== "string") return [];
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return [];
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10 && s.length < 160);
  return parts.slice(0, max);
}

/* ---------------------------- Project search (with voice input) ---------------------------- */

/**
 * Compact search used inside the brand top-bar.
 * - Text input with debounced suggestions from `${NEXT_PUBLIC_API_URL}projects`.
 * - Voice input via the Web Speech API (Chrome/Edge/Safari).
 * - Submitting navigates to the matched project slug, or to `/projects?search=…` as a fallback.
 */
function ProjectSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const recogRef = useRef(null);
  const wrapRef = useRef(null);

  // Lazy-load the project list only once (public endpoint) when the user focuses the input.
  const ensureProjectsLoaded = useCallback(async () => {
    if (projects.length || !process.env.NEXT_PUBLIC_API_URL) return;
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}projects`);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setProjects(list);
    } catch {
      // silent – fallback still works via /projects?search=
    }
  }, [projects.length]);

  const runSearchFromText = useCallback(
    (rawText) => {
      const text = String(rawText || "").trim();
      if (!text) return;
      const match = findBestProjectBySearch(text, projects);
      const slug = match?.slugURL || match?.slug;
      if (slug) {
        setOpen(false);
        router.push(`/${slug}`);
        return;
      }
      router.push(`/projects?search=${encodeURIComponent(text)}`);
    },
    [projects, router],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR =
      window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (!SR) return;
    setVoiceSupported(true);
    const r = new SR();
    r.lang = "en-IN";
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.continuous = false;
    r.onresult = (ev) => {
      const transcript = Array.from(ev.results)
        .map((res) => res[0]?.transcript || "")
        .join(" ")
        .trim();
      if (transcript) {
        setVoiceError("");
        setQuery(transcript);
        setOpen(true);
        runSearchFromText(transcript);
      }
    };
    r.onerror = () => {
      setListening(false);
      setVoiceError("Microphone access blocked or unavailable.");
    };
    r.onend = () => setListening(false);
    recogRef.current = r;
    return () => {
      try {
        r.abort();
      } catch {
        /* noop */
      }
    };
  }, [runSearchFromText]);

  // Close dropdown on outside click.
  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Debounced local filter over projectName / city / locality.
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return undefined;
    }
    const q = query.trim();
    const t = setTimeout(() => {
      const pool = Array.isArray(projects) ? projects : [];
      const ranked = [];
      for (const p of pool) {
        const name = String(p?.projectName || "");
        const city = String(p?.city || "");
        const loc = String(p?.projectLocality || "");
        if (!name && !city && !loc) continue;
        let score = scoreProjectSearchMatch(name, q);
        if (score < 0) {
          const locCity = `${loc} ${city}`.toLowerCase();
          if (locCity.includes(q.toLowerCase())) score = 6;
        }
        if (score >= 0) ranked.push({ p, score });
      }
      ranked.sort((a, b) => a.score - b.score);
      setSuggestions(ranked.slice(0, 6).map((x) => x.p));
    }, 120);
    return () => clearTimeout(t);
  }, [query, projects]);

  const goToSuggestion = useCallback(
    (item) => {
      const slug = item?.slugURL || item?.slug;
      if (slug) {
        setOpen(false);
        router.push(`/${slug}`);
      }
    },
    [router],
  );

  const handleSubmit = useCallback(
    (e) => {
      if (e && typeof e.preventDefault === "function") e.preventDefault();
      const q = query.trim();
      if (!q) return;
      if (suggestions.length) {
        goToSuggestion(suggestions[0]);
        return;
      }
      // Fallback: send the raw query to the projects listing page.
      router.push(`/projects?search=${encodeURIComponent(q)}`);
    },
    [query, suggestions, goToSuggestion, router],
  );

  const toggleVoice = () => {
    const r = recogRef.current;
    if (!r) return;
    if (listening) {
      try {
        r.stop();
      } catch {
        /* noop */
      }
      setListening(false);
      return;
    }
    setVoiceError("");
    ensureProjectsLoaded();
    try {
      r.start();
      setListening(true);
      setOpen(true);
    } catch {
      setListening(false);
      setVoiceError("Unable to start voice input on this browser.");
    }
  };

  return (
    <form
      className="pd3-search"
      role="search"
      aria-label="Search projects"
      onSubmit={handleSubmit}
      ref={wrapRef}
    >
      <span className="pd3-search__icon" aria-hidden="true">
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </span>
      <input
        type="search"
        className="pd3-search__input"
        placeholder="Search projects, builders or localities"
        aria-label="Search projects"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          ensureProjectsLoaded();
          if (suggestions.length) setOpen(true);
        }}
        autoComplete="off"
      />
      {voiceSupported ? (
        <button
          type="button"
          className={`pd3-search__mic${listening ? " is-listening" : ""}`}
          onClick={toggleVoice}
          aria-pressed={listening}
          aria-label={listening ? "Stop voice search" : "Start voice search"}
          title={listening ? "Stop voice search" : "Voice search"}
        >
          <FontAwesomeIcon icon={listening ? faStop : faMicrophone} />
        </button>
      ) : null}
      <button
        type="submit"
        className="pd3-search__submit"
        aria-label="Search"
      >
        Search
      </button>

      {open && (suggestions.length || listening) ? (
        <div className="pd3-search__dropdown" role="listbox">
          {listening ? (
            <div className="pd3-search__hint">
              <span className="pd3-search__pulse" aria-hidden="true" />
              Listening… say a project name
            </div>
          ) : null}
          {suggestions.map((p) => {
            const slug = p?.slugURL || p?.slug || "";
            return (
              <button
                type="button"
                key={slug || p?.id}
                className="pd3-search__option"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => goToSuggestion(p)}
                role="option"
                aria-selected={false}
              >
                <span className="pd3-search__option-name">
                  {p.projectName}
                </span>
                <span className="pd3-search__option-loc">
                  {[p.projectLocality, p.city].filter(Boolean).join(", ")}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
      {voiceError ? (
        <p className="pd3-search__error" role="status" aria-live="polite">
          {voiceError}
        </p>
      ) : null}
    </form>
  );
}

/* ---------------------------- Hero single image ---------------------------- */

function HeroMediaPrimary({ slides, totalCount, onOpenAtIndex, primaryLcp }) {
  const list = slides.length ? slides : ["/static/no_image.png"];
  const primary = list[0];
  const secondary = list[1] || list[0];
  const tertiary = list[2] || list[1] || list[0];
  const total = Math.max(totalCount || 0, list.length);
  const moreCount = Math.max(total - 3, 0);

  const {
    src: lcpSrc,
    srcSet: lcpSrcSet,
    sizes: lcpSizes,
    alt: lcpAlt,
    ...lcpRest
  } = primaryLcp || {};

  return (
    <div className="pd3-hero-collage">
      <div className="pd3-hero-tile pd3-hero-tile--primary">
        <img
          {...lcpRest}
          src={lcpSrc || primary}
          srcSet={lcpSrcSet}
          sizes={lcpSizes}
          alt={lcpAlt || "Project primary photo"}
          title={lcpAlt || "Project primary photo"}
          className="pd3-tile-img"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          width={1200}
          height={800}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <button
          type="button"
          className="pd3-hero-tile-hit"
          onClick={() => onOpenAtIndex(0)}
          aria-label={`Open photo gallery. ${total} photos`}
        />
      </div>

      <div className="pd3-hero-side">
        <button
          type="button"
          className="pd3-hero-tile pd3-hero-tile--side"
          onClick={() => onOpenAtIndex(Math.min(1, list.length - 1))}
          aria-label="Open photo gallery"
        >
          <img
            src={secondary}
            alt="Project secondary photo"
            title="Project secondary photo"
            className="pd3-tile-img"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            width={600}
            height={400}
           style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
        </button>
        <button
          type="button"
          className="pd3-hero-tile pd3-hero-tile--side pd3-hero-tile--more"
          onClick={() => onOpenAtIndex(Math.min(2, list.length - 1))}
          aria-label={`Open photo gallery${moreCount ? `, ${moreCount} more photos` : ""}`}
        >
          <img
            src={tertiary}
            alt="Project additional photo"
            title="Project additional photo"
            className="pd3-tile-img"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            width={600}
            height={400}
           style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
          {moreCount > 0 ? (
            <span className="pd3-hero-more-overlay">
              <span className="pd3-hero-more-plus">+</span>
              <span className="pd3-hero-more-count">{moreCount} more</span>
            </span>
          ) : (
            <span className="pd3-hero-more-overlay pd3-hero-more-overlay--soft">
              <FontAwesomeIcon icon={faCamera} />
              <span className="pd3-hero-more-count">View all</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------- Sidebar: opens standard enquiry modal ---------------------------- */

function SidebarEnquireCTA({ onOpen }) {
  return (
    <div className="pd3-enquire pd3-enquire--cta-only">
      <p className="pd3-enquire__title">Interested in this project?</p>
      <p className="pd3-enquire__sub">
        Request a callback — our team will reach out shortly.
      </p>
      <button
        type="button"
        className="pd3-btn pd3-btn--primary pd3-btn--lg"
        onClick={onOpen}
      >
        Request a Callback
      </button>
    </div>
  );
}

/* ---------------------------- Main component ---------------------------- */

const TAB_LIST = [
  { id: "overview", label: "Overview" },
  { id: "amenities", label: "Amenities" },
  { id: "floorplan", label: "Floor Plans & Price" },
  { id: "gallery", label: "Gallery" },
  { id: "location", label: "Location" },
  { id: "about", label: "About Builder" },
  { id: "faq", label: "FAQs" },
];

export default function PropertyV3({
  projectDetail,
  similarProjects = [],
  nearbyBenefitsList,
  heroSlides: heroSlidesProp,
  heroPrimaryLcp,
}) {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeBhk, setActiveBhk] = useState(null);
  const [popUp, setPopUp] = useState(false);
  const [touchForm, setTouchForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [showAllAmenitiesPanel, setShowAllAmenitiesPanel] = useState(false);
  const [isAmenitiesInView, setIsAmenitiesInView] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [nearby, setNearby] = useState(() =>
    Array.isArray(nearbyBenefitsList) ? nearbyBenefitsList : [],
  );
  const sectionRefs = useRef({});
  const galleryStripRef = useRef(null);
  const router = useRouter();

  /* --------- Hooks must run before any early return --------- */

  useEffect(() => {
    if (Array.isArray(nearbyBenefitsList)) return;
    (async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}nearby-benefit/get-all`,
        );
        setNearby(res.data);
      } catch (err) {
        // silent
      }
    })();
  }, [nearbyBenefitsList]);

  /** Scroll-spy for sticky tab active state. */
  useEffect(() => {
    const opts = {
      rootMargin: "-120px 0px -55% 0px",
      threshold: [0, 0.25, 0.5, 0.75],
    };
    const io = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActiveTab(visible[0].target.id);
    }, opts);
    TAB_LIST.forEach(({ id }) => {
      const el = sectionRefs.current[id];
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  /** Reveal amenity cards when section enters view (same pattern as V2). */
  useEffect(() => {
    const el = document.getElementById("amenities");
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsAmenitiesInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [projectDetail?.slugURL]);

  useEffect(() => {
    if (!showAllAmenitiesPanel) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setShowAllAmenitiesPanel(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAllAmenitiesPanel]);

  /* --------- Derived values (safe even if projectDetail missing) --------- */

  const imageBase = process.env.NEXT_PUBLIC_IMAGE_URL || "";
  const slugURL = projectDetail?.slugURL || "";
  const projectImageSrc = useCallback(
    (filename) =>
      filename && slugURL
        ? `${imageBase}properties/${slugURL}/${filename}`
        : "/static/no_image.png",
    [imageBase, slugURL],
  );

  const builderSlug = String(
    projectDetail?.builder?.slugURL ||
      projectDetail?.builder?.slugUrl ||
      projectDetail?.builder?.slug ||
      projectDetail?.builder?.builderSlug ||
      "",
  ).trim();
  const builderHref = builderSlug ? `/builder/${builderSlug}` : null;
  const topbarDeveloperLogo = projectDetail?.projectLogo
    ? projectImageSrc(projectDetail.projectLogo)
    : "/static/no_image.png";

  const desktopImages = Array.isArray(projectDetail?.desktopImages)
    ? projectDetail.desktopImages
    : [];
  const galleryImages = Array.isArray(projectDetail?.galleryImages)
    ? projectDetail.galleryImages
    : [];
  const allImagesForHero = useMemo(() => {
    if (Array.isArray(heroSlidesProp) && heroSlidesProp.length) {
      return heroSlidesProp;
    }
    const d = desktopImages
      .map((b) => b?.desktopImage)
      .filter(Boolean)
      .map((f) => projectImageSrc(f));
    const g = galleryImages
      .map((b) => b?.imageName)
      .filter(Boolean)
      .map((f) => projectImageSrc(f));
    return [...d, ...g];
  }, [heroSlidesProp, desktopImages, galleryImages, projectImageSrc]);
  const totalMediaCount = allImagesForHero.length;

  const aboutBuilderImageSrc = useMemo(() => {
    if (!projectDetail) return "/static/no_image.png";
    const raw =
      projectDetail?.builder?.builderImage ||
      projectDetail?.builder?.image ||
      projectDetail?.projectThumbnail ||
      projectDetail?.desktopImages?.[0]?.desktopImage ||
      "";
    if (!raw) return "/static/no_image.png";
    if (/^https?:\/\//i.test(String(raw)) || String(raw).startsWith("/"))
      return String(raw);
    return projectImageSrc(raw);
  }, [projectDetail, projectImageSrc]);

  const openLightboxAt = useCallback(
    (index) => {
      const n = allImagesForHero.length;
      if (!n) return;
      setActiveGalleryIndex(((index % n) + n) % n);
      setShowGalleryModal(true);
    },
    [allImagesForHero.length],
  );

  const showPrevGalleryImage = useCallback(() => {
    const n = allImagesForHero.length;
    if (n < 2) return;
    setActiveGalleryIndex((prev) => (prev === 0 ? n - 1 : prev - 1));
  }, [allImagesForHero.length]);

  const showNextGalleryImage = useCallback(() => {
    const n = allImagesForHero.length;
    if (n < 2) return;
    setActiveGalleryIndex((prev) => (prev === n - 1 ? 0 : prev + 1));
  }, [allImagesForHero.length]);

  const scrollGalleryStrip = useCallback((direction) => {
    const el = galleryStripRef.current;
    if (!el) return;
    const amount = Math.max(220, Math.round(el.clientWidth * 0.7));
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!showGalleryModal) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setShowGalleryModal(false);
      if (e.key === "ArrowLeft") showPrevGalleryImage();
      if (e.key === "ArrowRight") showNextGalleryImage();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showGalleryModal, showPrevGalleryImage, showNextGalleryImage]);

  const floorPlans = Array.isArray(projectDetail?.floorPlans)
    ? projectDetail.floorPlans
    : [];
  const floorPlanDescription =
    projectDetail?.floorPlanDescription || projectDetail?.floorPlanDesc || "";
  const bhkGroups = useMemo(() => {
    const m = new Map();
    floorPlans.forEach((p) => {
      const k = getBhkLabel(p);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(p);
    });
    return Array.from(m.entries()).map(([bhk, items]) => ({ bhk, items }));
  }, [floorPlans]);

  /** Keep tab selection valid across project navigations; never leave selection null when groups exist. */
  useEffect(() => {
    if (!bhkGroups.length) {
      if (activeBhk != null) setActiveBhk(null);
      return;
    }
    const stillValid = bhkGroups.some((g) => g.bhk === activeBhk);
    if (!stillValid) setActiveBhk(bhkGroups[0].bhk);
  }, [bhkGroups, activeBhk, projectDetail?.slugURL]);

  const resolvedActiveBhk =
    (activeBhk && bhkGroups.some((g) => g.bhk === activeBhk)
      ? activeBhk
      : bhkGroups[0]?.bhk) || null;

  const amenities = Array.isArray(projectDetail?.amenities)
    ? projectDetail.amenities
    : [];
  const AMENITIES_PREVIEW_MAX = 8;
  const amenitiesPreviewList = amenities.slice(0, AMENITIES_PREVIEW_MAX);
  const hasMoreAmenities = amenities.length > AMENITIES_PREVIEW_MAX;
  const showAmenityCards = isAmenitiesInView;
  const amenityIconBase = `${process.env.NEXT_PUBLIC_IMAGE_URL || ""}amenity/`;
  const amenityDescription =
    projectDetail?.amenityDescription || projectDetail?.amenityDesc || "";

  const locationBenefits = Array.isArray(projectDetail?.locationBenefits)
    ? projectDetail.locationBenefits
    : [];
  const locationAddressLine = [
    projectDetail?.projectAddress,
    projectDetail?.projectLocality,
  ]
    .filter(Boolean)
    .join(", ");
  const locationState = projectDetail?.state || "";
  const locationCity = projectDetail?.city || "";
  const locationCountry = projectDetail?.country || "India";
  const mapQuery = [
    projectDetail?.projectName,
    projectDetail?.projectAddress,
    projectDetail?.projectLocality,
    projectDetail?.city,
    projectDetail?.state,
    projectDetail?.country,
  ]
    .filter(Boolean)
    .join(", ");
  const mapHref = mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
    : null;
  const faqs = Array.isArray(projectDetail?.faqs) ? projectDetail.faqs : [];

  const findNearbyIcon = useCallback(
    (name) => {
      const n = typeof name === "string" ? name.trim().toLowerCase() : "";
      if (!n || !Array.isArray(nearby) || !nearby.length) return null;
      const b = nearby.find((x) => {
        const bn = String(x?.benefitName || "").toLowerCase();
        return bn && (bn === n || bn.includes(n) || n.includes(bn));
      });
      return b?.benefitIcon
        ? `${process.env.NEXT_PUBLIC_IMAGE_URL}nearby-benefit/${b.benefitIcon}`
        : null;
    },
    [nearby],
  );

  const overviewHtml = projectDetail?.projectWalkthroughDescription || "";
  const whyBullets = useMemo(() => extractBullets(overviewHtml, 4), [
    overviewHtml,
  ]);

  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
    setActiveTab(id);
    setMobileMenuOpen(false);
  }, []);

  /**
   * Return to the listing/page the user came from.
   * Prefer the saved listing return path (same-tab from /projects), then real
   * history when available. Never call history.back() solely because referrer
   * is same-origin — that breaks new-tab opens (referrer set, history empty).
   */
  const goBackToPrevious = useCallback(() => {
    const cityHref = projectDetail?.city
      ? getCityPageHref(projectDetail.city)
      : null;

    const saved = peekListingReturnState();
    if (saved?.pathname) {
      // Legacy/wrong saves used `/{city}` instead of `/city/{city}`.
      const citySlug = projectDetail?.city
        ? resolveCitySlug(
            String(projectDetail.city).toLowerCase().replace(/\s+/g, "-"),
          )
        : "";
      if (citySlug && saved.pathname === `/${citySlug}` && cityHref) {
        router.push(cityHref);
        return;
      }
      router.push(`${saved.pathname}${saved.search || ""}`);
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    if (cityHref) {
      router.push(cityHref);
      return;
    }

    router.push("/projects");
  }, [router, projectDetail?.city]);

  /* --------- Early return if no data --------- */

  if (!projectDetail) {
    notFound();
    return null;
  }

  const activeBhkItems =
    bhkGroups.find((g) => g.bhk === resolvedActiveBhk)?.items || [];

  const handleTouchFormChange = (field) => (e) => {
    setTouchForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleTouchFormSubmit = (e) => {
    e.preventDefault();
    setPopUp(true);
  };

  /* ---------------------------- Render ---------------------------- */

  return (
    <div className="pd3-root" id="pd3-root">
      {/* Top bar — developer logo (left), search (center), MPF logo (right) */}
      <header className="pd3-topbar">
        <div className="pd3-container pd3-topbar__inner">
          <button
            type="button"
            className="pd3-mobile-menu-btn"
            aria-label="Open section menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(true)}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          <Link
            title="View builder profile"
            href={builderHref || "#"}
            className="pd3-topbar__dev"
            aria-label={projectDetail?.builder?.builderName || "Project developer"}
            {...(builderHref
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            <img
              src={topbarDeveloperLogo}
              alt={projectDetail?.builder?.builderName || projectDetail?.projectName}
              title={projectDetail?.builder?.builderName || projectDetail?.projectName}
              className="pd3-topbar__dev-logo"
            />
          </Link>
          <ProjectSearchBar />
          <Link
            title="My Property Fact home"
            href="/"
            className="pd3-topbar__brand"
            aria-label="My Property Fact — home"
          >
            <span className="pd3-topbar__logo-chip">
              <img loading="eager"
                src="/logo.webp"
                alt="My Property Fact"
                title="My Property Fact"
                width={252}
                height={100}
                className="pd3-topbar__logo"
              />
            </span>
          </Link>
        </div>
      </header>

      <div
        className={`pd3-mobile-menu-backdrop${mobileMenuOpen ? " is-open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <aside
        className={`pd3-mobile-menu${mobileMenuOpen ? " is-open" : ""}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="pd3-mobile-menu__head">
          <img
            src="/images/admin/logo.svg"
            alt="My Property Fact"
            title="My Property Fact"
            width={188}
            height={56}
            className="pd3-mobile-menu__logo"
          />
          <button
            type="button"
            className="pd3-mobile-menu__close"
            aria-label="Close section menu"
            onClick={() => setMobileMenuOpen(false)}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="pd3-mobile-menu__search">
          <ProjectSearchBar />
        </div>
        <nav className="pd3-mobile-menu__nav" aria-label="Mobile section navigation">
          {TAB_LIST.map(({ id, label }) => (
            <button
              key={`mobile-${id}`}
              type="button"
              className={`pd3-mobile-menu__link${activeTab === id ? " is-active" : ""}`}
              onClick={() => scrollToSection(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Breadcrumb + back */}
      <div className="pd3-container">
        <div className="pd3-breadcrumb-row">
          <button
            type="button"
            className="pd3-back-btn"
            onClick={goBackToPrevious}
            title="Go back to previous page"
            aria-label="Go back to previous page"
          >
            <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
            <span>Back</span>
          </button>
          <div className="pd3-breadcrumb" aria-label="Breadcrumb">
            <Link title="Home" href="/">Home</Link>
            <span className="pd3-breadcrumb__sep">›</span>
            {projectDetail.city ? (
              <>
                <Link
                  title={`Projects in ${projectDetail.city}`}
                  href={getCityPageHref(projectDetail.city)}
                >
                  Projects in {projectDetail.city}
                </Link>
                <span className="pd3-breadcrumb__sep">›</span>
              </>
            ) : null}
            <span className="pd3-breadcrumb__current">{projectDetail.projectName}</span>
          </div>
        </div>
      </div>

      {/* Hero: collage layout (primary + 2 side tiles; clickable to open full gallery) */}
      <section className="pd3-hero">
        <div className="pd3-container">
          <HeroMediaPrimary
            slides={
              allImagesForHero.length ? allImagesForHero : ["/static/no_image.png"]
            }
            totalCount={totalMediaCount}
            onOpenAtIndex={openLightboxAt}
            primaryLcp={heroPrimaryLcp}
          />

          {/* Summary card */}
          <div className="pd3-summary">
            <div className="pd3-summary__top">
              <div className="pd3-summary__titlewrap">
                <div className="pd3-summary__title">
                  <h1>{buildProjectDisplayName(projectDetail)}</h1>
                </div>
                <div className="pd3-summary__location">
                  <FontAwesomeIcon icon={faLocationDot} />
                  <span>
                    {[projectDetail.projectLocality, projectDetail.city, projectDetail.state]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              </div>
              <div className="pd3-summary__cta">
                <button
                  type="button"
                  className="pd3-btn pd3-btn--outline pd3-btn--lg"
                  onClick={() => setPopUp(true)}
                >
                  <FontAwesomeIcon icon={faPhone} /> View Number
                </button>
                <button
                  type="button"
                  className="pd3-btn pd3-btn--primary pd3-btn--lg"
                  onClick={() => setPopUp(true)}
                >
                  Enquire Now
                </button>
              </div>
            </div>

            <div className="pd3-summary__badges">
              {projectDetail.reraNo ? (
                <span className="pd3-badge pd3-badge--rera">
                  <FontAwesomeIcon icon={faShieldHalved} /> RERA: {projectDetail.reraNo}
                </span>
              ) : (
                <span className="pd3-badge pd3-badge--rera">
                  <FontAwesomeIcon icon={faShieldHalved} /> RERA Status
                </span>
              )}
              {floorPlans.length ? (
                <span className="pd3-badge pd3-badge--brand">
                  <FontAwesomeIcon icon={faCube} /> {floorPlans.length} Floor Plans
                </span>
              ) : null}
              {amenities.length ? (
                <span className="pd3-badge">
                  <span className="pd3-badge__dot" />+{amenities.length} Amenities
                </span>
              ) : null}
              {projectDetail.projectStatusName ? (
                <span className="pd3-badge pd3-badge--status">
                  <FontAwesomeIcon icon={faHouseChimney} /> {projectDetail.projectStatusName}
                </span>
              ) : null}
            </div>

            <div className="pd3-summary__meta">
              <div className="pd3-meta-item">
                <span className="pd3-meta-item__label">Price</span>
                <span className="pd3-meta-item__value">
                  {generatePrice(projectDetail.projectPrice)}
                </span>
              </div>
              {projectDetail.projectConfiguration ? (
                <div className="pd3-meta-item">
                  <span className="pd3-meta-item__label">Configurations</span>
                  <span className="pd3-meta-item__value">
                    {projectDetail.projectConfiguration}
                  </span>
                </div>
              ) : null}
              {projectDetail.propertyTypeName ? (
                <div className="pd3-meta-item">
                  <span className="pd3-meta-item__label">Property Type</span>
                  <span className="pd3-meta-item__value">
                    {projectDetail.propertyTypeName}
                  </span>
                </div>
              ) : null}
              {projectDetail?.builder?.builderName ? (
                <div className="pd3-meta-item">
                  <span className="pd3-meta-item__label">Developed By</span>
                  <span className="pd3-meta-item__value">
                    {projectDetail.builder.builderName}
                  </span>
                </div>
              ) : null}
              {projectDetail.projectStatusName ? (
                <div className="pd3-meta-item">
                  <span className="pd3-meta-item__label">Construction</span>
                  <span className="pd3-meta-item__value">
                    {projectDetail.projectStatusName}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky tab strip */}
      <nav className="pd3-tabs" aria-label="Section navigation">
        <div className="pd3-container">
          <div className="pd3-tabs__inner" role="tablist">
            {TAB_LIST.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                title={`${label} — ${projectDetail.projectName || "project"}`}
                className={`pd3-tab${activeTab === id ? " is-active" : ""}`}
                role="tab"
                aria-selected={activeTab === id}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(id);
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Body (main + sticky aside) */}
      <div className="pd3-container">
        <div className="pd3-body">
          <main className="pd3-main">
            {/* Overview */}
            {overviewHtml ? (
              <section
                id="overview"
                ref={(el) => (sectionRefs.current.overview = el)}
                className="pd3-card"
              >
                <div className="pd3-card__head">
                  <h2 className="pd3-card__title">
                    About {projectDetail.projectName}
                  </h2>
                </div>
                <div
                  className="pd3-card__body"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(overviewHtml),
                  }}
                />
              </section>
            ) : null}

            {/* Amenities — same layout / “View more” side panel as V2 */}
            {amenities.length ? (
              <div
                className="container-fluid py-4 mb-4 amenities-section rounded-3"
                id="amenities"
                ref={(el) => {
                  sectionRefs.current.amenities = el;
                }}
              >
                <div className="container amenities-content">
                  <div className="amenities-head">
                    <h2 className="amenities-title">Amenities</h2>
                  </div>
                  {amenityDescription ? (
                    <div
                      className="amenities-description text-center mb-4"
                      dangerouslySetInnerHTML={{
                        __html: amenityDescription,
                      }}
                    />
                  ) : null}
                  <div className="amenities-preview-wrap">
                    <div className="amenities-grid amenities-grid--compact">
                      {amenitiesPreviewList.map((item, index) => (
                        <div
                          key={`${item.id || item.title}-preview-${index}`}
                          className={`amenity-modern-card amenity-modern-card--compact ${showAmenityCards ? "is-visible" : ""}`}
                          style={{ transitionDelay: `${index * 35}ms` }}
                        >
                          <div className="amenity-modern-icon-wrap">
                            <img
                              src={`${amenityIconBase}${item.image}`}
                              height={32}
                              width={32}
                              alt={item.altTag || item.title || "Amenity icon"}
                              title={item.altTag || item.title || "Amenity icon"}
                              className="d-flex mx-auto amenity-modern-icon-img"
                            />
                          </div>
                          <p className="amenity-modern-title">{item.title}</p>
                        </div>
                      ))}
                    </div>
                    {hasMoreAmenities ? (
                      <div className="amenities-view-more-row">
                        <button
                          type="button"
                          className="amenities-view-more-btn"
                          onClick={() => setShowAllAmenitiesPanel(true)}
                        >
                          <span>View more</span>
                          <FontAwesomeIcon
                            icon={faPlus}
                            className="amenities-view-more-btn__icon"
                          />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Floor Plans with BHK tabs */}
            {floorPlans.length || floorPlanDescription ? (
              <section
                id="floorplan"
                ref={(el) => (sectionRefs.current.floorplan = el)}
                className="pd3-card"
              >
                <div className="pd3-card__head">
                  <h2 className="pd3-card__title">Floor Plans &amp; Pricing</h2>
                </div>
                {floorPlanDescription ? (
                  <div
                    className="pd3-card__body pd3-fp-description"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(floorPlanDescription),
                    }}
                  />
                ) : null}
                {floorPlans.length ? (
                  <>
                    <div className="pd3-bhk-tabs" role="tablist">
                      {bhkGroups.map(({ bhk, items }) => (
                        <button
                          key={bhk}
                          type="button"
                          role="tab"
                          aria-selected={resolvedActiveBhk === bhk}
                          className={`pd3-bhk-tab${
                            resolvedActiveBhk === bhk ? " is-active" : ""
                          }`}
                          onClick={() => setActiveBhk(bhk)}
                        >
                          {bhk}
                          <span style={{ opacity: 0.6, marginLeft: 6 }}>
                            ({items.length})
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="pd3-fp-count">
                      {activeBhkItems.length} Floor Plan
                      {activeBhkItems.length === 1 ? "" : "s"} Available
                    </div>
                    <div className="pd3-fp-grid">
                      {activeBhkItems.map((plan, i) => (
                        <div
                          className="pd3-fp-card"
                          key={`${plan?.planType || "plan"}-${i}`}
                        >
                          <div className="pd3-fp-card__head">
                            <span>{plan.planType}</span>
                            <span className="pd3-fp-card__head-sub">
                              {getFloorPlanArea(plan)}
                            </span>
                          </div>
                          <div className="pd3-fp-card__img">
                            <img
                              src={
                                plan.floorPlanImage
                                  ? projectImageSrc(plan.floorPlanImage)
                                  : "/static/floor_plans.png"
                              }
                              alt={`${plan.planType} floor plan`}
                              title={`${plan.planType} floor plan`}
                              className="pd3-tile-img"
                              style={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                          <div className="pd3-fp-card__body">
                            <div className="pd3-fp-card__price">
                              {plan.price
                                ? generatePrice(plan.price)
                                : "Price on Request"}
                            </div>
                            {projectDetail.projectStatusName ? (
                              <div className="pd3-fp-card__status">
                                {projectDetail.projectStatusName}
                              </div>
                            ) : null}
                            <button
                              type="button"
                              className="pd3-fp-card__cta"
                              onClick={() => setPopUp(true)}
                            >
                              Request Callback{" "}
                              <FontAwesomeIcon icon={faArrowRight} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </section>
            ) : null}

            {/* Gallery */}
            {galleryImages.length ? (
              <section
                id="gallery"
                ref={(el) => (sectionRefs.current.gallery = el)}
                className="pd3-card"
              >
                <div className="pd3-card__head">
                  <h2 className="pd3-card__title">Gallery</h2>
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--pd3-muted)",
                      fontWeight: 500,
                    }}
                  >
                    {galleryImages.length} photos
                  </span>
                </div>
                <div className="pd3-gallery-slider">
                  {galleryImages.length > 1 ? (
                    <>
                      <button
                        type="button"
                        className="pd3-gallery-nav pd3-gallery-nav--prev"
                        onClick={() => scrollGalleryStrip(-1)}
                        aria-label="Previous gallery images"
                      >
                        <FontAwesomeIcon icon={faArrowLeft} />
                      </button>
                      <button
                        type="button"
                        className="pd3-gallery-nav pd3-gallery-nav--next"
                        onClick={() => scrollGalleryStrip(1)}
                        aria-label="Next gallery images"
                      >
                        <FontAwesomeIcon icon={faArrowRight} />
                      </button>
                    </>
                  ) : null}
                  <div className="pd3-gallery-strip" ref={galleryStripRef}>
                    {galleryImages.map((img, i) => {
                      const src = projectImageSrc(img.imageName);
                      const lbIdx = allImagesForHero.indexOf(src);
                      const openIdx = lbIdx >= 0 ? lbIdx : i;
                      return (
                        <button
                          type="button"
                          key={`${img?.id || i}`}
                          className="pd3-gallery-strip__item"
                          onClick={() => openLightboxAt(openIdx)}
                          aria-label={`Open gallery image ${i + 1}`}
                        >
                          <img
                            src={src}
                            alt={img.altTag || `Gallery image ${i + 1}`}
                            title={img.altTag || `Gallery image ${i + 1}`}
                            className="pd3-tile-img"
                           style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            ) : null}

            {/* Location */}
            {(locationBenefits.length || projectDetail.locationMap) ? (
              <section
                id="location"
                ref={(el) => (sectionRefs.current.location = el)}
                className="pd3-card"
              >
                <div className="pd3-card__head">
                  <h2 className="pd3-card__title">Location</h2>
                  {locationBenefits.length ? (
                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--pd3-muted)",
                        fontWeight: 500,
                      }}
                    >
                      {locationBenefits.length} nearby
                    </span>
                  ) : null}
                </div>
                {(projectDetail.locationDescription ||
                  projectDetail.locationDesc) && (
                  <div
                    className="pd3-card__body"
                    style={{ marginBottom: 16 }}
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(
                        projectDetail.locationDescription ||
                          projectDetail.locationDesc ||
                          "",
                      ),
                    }}
                  />
                )}
                {locationBenefits.length ? (
                  <div className="pd3-loc-grid">
                    {locationBenefits.map((b, i) => {
                      const icon = findNearbyIcon(b.benefitName);
                      return (
                        <div
                          className="pd3-loc-item"
                          key={`${b.benefitName || "b"}-${i}`}
                        >
                          <img
                            className="pd3-loc-item__icon"
                            src={icon || "/icon/fallback-icon.png"}
                            alt={b.benefitName || "Nearby"}
                            title={b.benefitName || "Nearby"}
                            loading="lazy"
                          />
                          <div>
                            <div className="pd3-loc-item__name">
                              {b.benefitName}
                            </div>
                            {b.distance ? (
                              <div className="pd3-loc-item__dist">
                                {formatDistanceKm(b.distance)}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                {projectDetail.locationMap ? (
                  <div className="pd3-location-map-wrap">
                    <div className="pd3-location-facts">
                      <div className="pd3-location-facts__grid">
                        <div className="pd3-location-facts__item">
                          <h3>Address</h3>
                          <p>{locationAddressLine || "On Request"}</p>
                        </div>
                        <div className="pd3-location-facts__item">
                          <h3>State</h3>
                          <p>{locationState || "On Request"}</p>
                        </div>
                        <div className="pd3-location-facts__item">
                          <h3>City</h3>
                          <p>{locationCity || "On Request"}</p>
                        </div>
                        <div className="pd3-location-facts__item">
                          <h3>Country</h3>
                          <p>{locationCountry || "On Request"}</p>
                        </div>
                      </div>
                      {mapHref ? (
                        <div className="pd3-location-facts__cta">
                          <a
                            href={mapHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pd3-location-map-btn"
                            title={`View ${projectDetail.projectName || "project"} on Google Maps`}
                          >
                            View On Map
                          </a>
                        </div>
                      ) : null}
                    </div>
                    <div className="pd3-map">
                      <img
                        src={projectImageSrc(projectDetail.locationMap)}
                        alt="Project location map"
                        title="Project location map"
                       style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
                    </div>
                  </div>
                ) : null}
              </section>
            ) : null}

            {/* Brochure card */}
            {/* <div className="pd3-brochure">
              <div>
                <h3 className="pd3-brochure__title">
                  View Official Brochure
                </h3>
                <p className="pd3-brochure__sub">
                  {projectDetail.projectName} brochure &amp; payment plan
                </p>
              </div>
              <button
                type="button"
                className="pd3-btn pd3-btn--primary"
                onClick={() => setPopUp(true)}
              >
                <FontAwesomeIcon icon={faDownload} /> Download Brochure
              </button>
            </div> */}

            {/* About The Builder — soft brand gradient band (no photo) */}
            {projectDetail.builder?.builderName ? (
              <section
                id="about"
                ref={(el) => (sectionRefs.current.about = el)}
                className="pd3-builder-hero"
              >
                <h2 className="pd3-builder-hero__title text-center fw-bold mb-4">
                  About The Builder {projectDetail.builder.builderName}
                </h2>
                <div className="container mb-4">
                  <div
                    className="pd3-builder-hero__desc text-center"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(
                        projectDetail.builder.builderDescription || "",
                      ),
                    }}
                  />
                </div>
                <div className="text-center">
                  <Link
                    title="Check More Projects"
                    href={builderHref || "#"}
                    className="btn btn-success px-4 py-2 rounded-pill shadow-sm"
                    {...(builderHref
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    Check More Projects
                  </Link>
                </div>
              </section>
            ) : null}

            {/* Get in Touch */}
            <section className="pd3-card pd3-touch">
              <div className="pd3-card__head">
                <h2 className="pd3-card__title">Get in Touch</h2>
              </div>
              <div className="pd3-touch__grid">
                <div className="pd3-touch__content">
                  <p className="pd3-touch__desc">
                    If you have any additional queries regarding the project or
                    would like to take the next step in your investment journey,
                    our team will be happy to assist you.
                  </p>
                  <ul className="pd3-touch__list">
                    <li>Book a Site Visit</li>
                    <li>Ask For a Brochure</li>
                    <li>Speak to a Representative</li>
                    <li>Ask for a Quotation</li>
                  </ul>
                </div>
                <form className="pd3-touch__form" onSubmit={handleTouchFormSubmit}>
                  <input
                    type="text"
                    className="pd3-touch__input"
                    placeholder="Full Name"
                    value={touchForm.name}
                    onChange={handleTouchFormChange("name")}
                  />
                  <input
                    type="email"
                    className="pd3-touch__input"
                    placeholder="Email Id"
                    value={touchForm.email}
                    onChange={handleTouchFormChange("email")}
                  />
                  <input
                    type="tel"
                    className="pd3-touch__input"
                    placeholder="Phone Number"
                    value={touchForm.phone}
                    onChange={handleTouchFormChange("phone")}
                  />
                  <textarea
                    className="pd3-touch__input pd3-touch__textarea"
                    placeholder="Message"
                    value={touchForm.message}
                    onChange={handleTouchFormChange("message")}
                  />
                  <button type="submit" className="pd3-btn pd3-btn--primary pd3-touch__submit">
                    Submit Enquiry
                  </button>
                </form>
              </div>
            </section>

            {/* FAQs */}
            {faqs.length ? (
              <section
                id="faq"
                ref={(el) => (sectionRefs.current.faq = el)}
                className="pd3-card"
              >
                <div className="pd3-card__head">
                  <h2 className="pd3-card__title">Frequently Asked Questions</h2>
                </div>
                <div className="pd3-faqs">
                  {faqs.map((f, i) => {
                    const isOpen = openFaq === i;
                    return (
                      <div
                        key={i}
                        className={`pd3-faq${isOpen ? " is-open" : ""}`}
                      >
                        <button
                          type="button"
                          className="pd3-faq__q"
                          onClick={() => setOpenFaq(isOpen ? null : i)}
                          aria-expanded={isOpen}
                        >
                          <span>{f.question}</span>
                          <FontAwesomeIcon
                            icon={faPlus}
                            className="pd3-faq__icon"
                          />
                        </button>
                        {isOpen ? (
                          <div
                            className="pd3-faq__a"
                            dangerouslySetInnerHTML={{
                              __html: sanitizeHtml(f.answer || ""),
                            }}
                          />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {/* Similar projects */}
            {similarProjects && similarProjects.length ? (
              <section className="pd3-card">
                <div className="pd3-card__head">
                  <h2 className="pd3-card__title">Similar Projects</h2>
                  <Link
                    title={`View all projects in ${projectDetail.city || "this city"}`}
                    href={getCityPageHref(projectDetail.city)}
                    className="pd3-link"
                  >
                    View all <FontAwesomeIcon icon={faArrowRight} />
                  </Link>
                </div>
                <div className="pd3-sim-grid">
                  {similarProjects.slice(0, 8).map((p) => {
                    const simName = buildProjectDisplayName(p, "Project");
                    const simImgMeta = `${simName} — similar project photo on My Property Fact`;
                    return (
                    <Link
                      key={p.id || p.slugURL}
                      href={`/${p.slugURL}`}
                      className="pd3-sim-card"
                      aria-label={`View details about ${simName}`}
                    >
                      <div className="pd3-sim-card__img">
                        <img
                          src={buildProjectImageUrl(p, { preferThumbnail: true })}
                          alt={simImgMeta}
                          loading="lazy"
                          decoding="async"
                         style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
                        {p.projectStatusName ? (
                          <span className="pd3-sim-card__badge">
                            {p.projectStatusName}
                          </span>
                        ) : null}
                      </div>
                      <div className="pd3-sim-card__body">
                        <div className="pd3-sim-card__name">
                          {simName}
                        </div>
                        {p.projectAddress ? (
                          <div className="pd3-sim-card__addr">
                            {p.projectAddress}
                          </div>
                        ) : null}
                        {p.projectPrice ? (
                          <div className="pd3-sim-card__price">
                            {generatePrice(p.projectPrice)}
                          </div>
                        ) : null}
                      </div>
                    </Link>
                  );
                  })}
                </div>
              </section>
            ) : null}
          </main>

          {/* Sidebar */}
          <aside className="pd3-aside" aria-label="Project summary sidebar">
            <div className="pd3-aside-card">
              <div className="pd3-aside-card__head">
                <span className="pd3-aside-card__icon">
                  <FontAwesomeIcon icon={faHouseChimney} />
                </span>
                <p className="pd3-aside-card__title">
                  Why you should consider {projectDetail.projectName}?
                </p>
              </div>
              <ul className="pd3-aside-card__list">
                {whyBullets.length ? (
                  whyBullets.map((b, i) => <li key={i}>{b}</li>)
                ) : (
                  <>
                    <li>Well-planned {projectDetail.propertyTypeName || "residences"} at prime location</li>
                    <li>Developed by trusted builder with RERA approval</li>
                    <li>Modern amenities and connectivity advantages</li>
                    <li>Investment-friendly pricing and payment plans</li>
                  </>
                )}
              </ul>
              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="pd3-link"
                  style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer" }}
                  onClick={() => setPopUp(true)}
                >
                  View 4 more <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
            </div>

            {projectDetail.builder?.builderName ? (
              <div className="pd3-developer">
                <span className="pd3-developer__label">Developed By</span>
                <div className="pd3-developer__row">
                  <span className="pd3-developer__name">
                    {projectDetail.builder.builderName}
                  </span>
                  <img
                    src={projectImageSrc(projectDetail.projectLogo)}
                    alt={projectDetail.builder.builderName}
                    title={projectDetail.builder.builderName}
                    className="pd3-developer__logo"
                  />
                </div>
              </div>
            ) : null}

            <SidebarEnquireCTA onOpen={() => setPopUp(true)} />
          </aside>
        </div>
      </div>

      {/* Mobile CTA bar */}
      <div className="pd3-mobile-cta" role="region" aria-label="Quick actions">
        <button
          type="button"
          className="pd3-btn pd3-btn--outline pd3-btn--lg"
          onClick={() => setPopUp(true)}
        >
          <FontAwesomeIcon icon={faPhone} /> Call
        </button>
        <button
          type="button"
          className="pd3-btn pd3-btn--primary pd3-btn--lg"
          onClick={() => setPopUp(true)}
        >
          Enquire Now
        </button>
      </div>

      {/* Standard enquiry popup (no animated headline) */}
      <CommonPopUpform
        show={popUp}
        handleClose={setPopUp}
        from="Project Detail"
        data={projectDetail}
      />

      {showAllAmenitiesPanel ? (
        <>
          <button
            type="button"
            className="amenities-all-backdrop"
            aria-label="Close amenities list"
            onClick={() => setShowAllAmenitiesPanel(false)}
          />
          <aside
            className="amenities-all-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="amenities-all-panel-title"
          >
            <div className="amenities-all-panel-header">
              <h3 id="amenities-all-panel-title" className="amenities-all-panel-title">
                All amenities
              </h3>
              <button
                type="button"
                className="amenities-all-panel-close"
                onClick={() => setShowAllAmenitiesPanel(false)}
                aria-label="Close"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="amenities-all-panel-body">
              <div className="amenities-all-grid">
                {amenities.map((item, index) => (
                  <div
                    key={`${item.id || item.title}-all-${index}`}
                    className="amenity-modern-card amenity-modern-card--compact amenity-modern-card--panel"
                  >
                    <div className="amenity-modern-icon-wrap">
                      <img
                        src={`${amenityIconBase}${item.image}`}
                        height={28}
                        width={28}
                        alt={item.altTag || item.title || "Amenity icon"}
                        title={item.altTag || item.title || "Amenity icon"}
                        className="d-flex mx-auto amenity-modern-icon-img"
                      />
                    </div>
                    <p className="amenity-modern-title">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </>
      ) : null}

      <Modal
        show={showGalleryModal}
        onHide={() => setShowGalleryModal(false)}
        centered
        size="xl"
        className="gallery-zoom-modal"
        backdropClassName="gallery-zoom-backdrop"
      >
        <Modal.Body>
          <button
            type="button"
            className="gallery-modal-close-btn"
            aria-label="Close gallery preview"
            onClick={() => setShowGalleryModal(false)}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>

          <div className="gallery-zoom-head">
            <div className="gallery-zoom-count">
              {activeGalleryIndex + 1}/{allImagesForHero.length} Project Photos
            </div>
            <div className="gallery-zoom-thumbs" role="tablist" aria-label="Gallery thumbnails">
              {allImagesForHero.map((img, idx) => (
                <button
                  type="button"
                  key={`${img}-${idx}`}
                  className={`gallery-zoom-thumb${idx === activeGalleryIndex ? " is-active" : ""}`}
                  onClick={() => setActiveGalleryIndex(idx)}
                  aria-label={`Open image ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    title={`Thumbnail ${idx + 1}`}
                    width={88}
                    height={52}
                    className="gallery-zoom-thumb-img"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="gallery-zoom-viewer">
            {allImagesForHero.length > 1 ? (
              <>
                <button
                  type="button"
                  className="gallery-modal-nav-btn gallery-modal-nav-btn--prev"
                  onClick={showPrevGalleryImage}
                  aria-label="Previous image"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <button
                  type="button"
                  className="gallery-modal-nav-btn gallery-modal-nav-btn--next"
                  onClick={showNextGalleryImage}
                  aria-label="Next image"
                >
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </>
            ) : null}
            {allImagesForHero[activeGalleryIndex] ? (
              <img
                key={`gallery-img-${activeGalleryIndex}`}
                src={allImagesForHero[activeGalleryIndex]}
                alt={`Gallery ${activeGalleryIndex + 1}`}
                title={`Gallery ${activeGalleryIndex + 1}`}
                width={1400}
                height={1000}
                className="gallery-zoom-image"
              />
            ) : null}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
