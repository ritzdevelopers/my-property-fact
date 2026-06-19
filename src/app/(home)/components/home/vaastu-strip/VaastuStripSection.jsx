"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MPF_SOCIAL_REELS_OPEN_CLASS } from "@/app/_global_components/mpfGatewayEvents";
import "./VaastuStripSection.css";

const INSTAGRAM_REELS = [
  { id: "DZg62TblKL-", title: "My Property Fact — Instagram reel" },
  { id: "DZOyVGPiaPw", title: "My Property Fact — Instagram reel" },
  { id: "DY9kSk2THeq", title: "My Property Fact — Instagram reel" },
  { id: "DYq4HHiCQ_c", title: "My Property Fact — Instagram reel" },
  { id: "DYYvCn6lApB", title: "My Property Fact — Instagram reel" },
  { id: "DXv8lr4kVIu", title: "My Property Fact — Instagram reel" },
];

const MEDIA_CARDS = [
  {
    id: "vaastu-business-growth",
    reelId: "DZg62TblKL-",
    imageSrc: "/static/vaastu-strip/signal-2026-06-17-173831_003.jpeg",
    alt: "Vaastu insights thumbnail: business growth secret tips",
    title: "Vaastu insights: business growth secret tips",
  },
  {
    id: "vaastu-ambani-house",
    reelId: "DZOyVGPiaPw",
    imageSrc: "/static/vaastu-strip/signal-2026-06-17-173831_002.jpeg",
    alt: "Vaastu insights thumbnail: Ambani house powerful Vastu",
    title: "Vaastu insights: Ambani house powerful Vastu",
  },
  {
    id: "vaastu-simple-solution",
    reelId: "DY9kSk2THeq",
    imageSrc: "/static/vaastu-strip/signal-2026-06-17-173831_004.jpeg",
    alt: "Vaastu insights thumbnail: one simple solution for your problems",
    title: "Vaastu insights: one simple solution for your problems",
  },
];

const getInstagramEmbedUrl = (reelId) =>
  `https://www.instagram.com/reel/${reelId}/embed/`;

const getInstagramThumbnailUrl = (reelId) =>
  `https://www.instagram.com/reel/${reelId}/media/?size=l`;

const getPlayIconLabel = (label) => `Play reel: ${label}`;

export default function VaastuStripSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef([]);
  const scrollerRef = useRef(null);
  const openIndexRef = useRef(0);
  const isScrollingRef = useRef(false);

  const openReels = useCallback((cardIndex) => {
    const reelId = MEDIA_CARDS[cardIndex]?.reelId;
    const reelIndex = INSTAGRAM_REELS.findIndex((reel) => reel.id === reelId);
    const nextIndex = reelIndex >= 0 ? reelIndex : 0;
    openIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
    setIsOpen(true);
  }, []);

  const closeReels = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(0);
  }, []);

  const scrollToReel = useCallback((index, behavior = "smooth") => {
    isScrollingRef.current = true;
    itemRefs.current[index]?.scrollIntoView({ block: "start", behavior });
    window.setTimeout(() => {
      isScrollingRef.current = false;
    }, behavior === "smooth" ? 420 : 0);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        closeReels();
        return;
      }
      if (e.key === "ArrowDown" && activeIndex < INSTAGRAM_REELS.length - 1) {
        e.preventDefault();
        scrollToReel(activeIndex + 1);
      }
      if (e.key === "ArrowUp" && activeIndex > 0) {
        e.preventDefault();
        scrollToReel(activeIndex - 1);
      }
    },
    [isOpen, closeReels, activeIndex, scrollToReel],
  );

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add(MPF_SOCIAL_REELS_OPEN_CLASS);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prev || "unset";
      document.body.classList.remove(MPF_SOCIAL_REELS_OPEN_CLASS);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => {
      scrollToReel(openIndexRef.current, "auto");
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen, scrollToReel]);

  useEffect(() => {
    if (!isOpen || !scrollerRef.current) return;

    const root = scrollerRef.current;

    const updateActiveFromScroll = () => {
      if (isScrollingRef.current) return;

      const viewportMid = root.scrollTop + root.clientHeight / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      itemRefs.current.forEach((node, index) => {
        if (!node) return;
        const nodeMid = node.offsetTop + node.clientHeight / 2;
        const distance = Math.abs(viewportMid - nodeMid);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex((prev) => (prev === closestIndex ? prev : closestIndex));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;

        let bestIndex = null;
        let bestRatio = 0;

        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Number(entry.target.dataset.reelIndex);
          if (Number.isNaN(index)) return;
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIndex = index;
          }
        });

        if (bestIndex !== null && bestRatio >= 0.6) {
          setActiveIndex((prev) => (prev === bestIndex ? prev : bestIndex));
        }
      },
      {
        root,
        threshold: [0.6, 0.75, 0.9],
      },
    );

    itemRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });

    root.addEventListener("scroll", updateActiveFromScroll, { passive: true });

    return () => {
      observer.disconnect();
      root.removeEventListener("scroll", updateActiveFromScroll);
    };
  }, [isOpen]);

  return (
    <section className="vaastu-strip-section">
      <div className="container">
        <div className="vaastu-strip" role="list" aria-label="Explore insights">
          <button
            type="button"
            className="vaastu-strip-card vaastu-strip-card--explore"
            role="listitem"
            aria-label="Explore Vaastu Insights for Your Property"
            title="Explore Vaastu Insights for Your Property"
            onClick={() => openReels(0)}
          >
            <div className="vaastu-strip-explore__inner">
              <p className="vaastu-strip-explore__eyebrow">Explore</p>
              <h3 className="vaastu-strip-explore__title">
                Vaastu Insights for Your Property
              </h3>
            </div>
          </button>

          {MEDIA_CARDS.map((card, index) => (
            <button
              key={card.id}
              type="button"
              className={`vaastu-strip-card vaastu-strip-card--media vaastu-strip-card--media-${index + 1}`}
              role="listitem"
              aria-label={card.title}
              title={card.title}
              onClick={() => openReels(index)}
            >
              <span className="vaastu-strip-media__play" aria-hidden="true">
                <img
                  src="/static/vaastu-strip/play-circle-line.svg"
                  alt={getPlayIconLabel(card.title)}
                  title={getPlayIconLabel(card.title)}
                  width={34}
                  height={34}
                  decoding="async"
                />
              </span>
              <img
                src={card.imageSrc}
                alt={card.alt}
                title={card.title}
                className="vaastu-strip-media__img"
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      </div>

      {isOpen && (
        <div
          className="vaastu-reels-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Instagram reels viewer"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeReels();
          }}
        >
          <div className="vaastu-reels-layout" onClick={(e) => e.stopPropagation()}>
            <div className="vaastu-reels-stage">
              <div className="vaastu-reels-shell-wrap">
                <button
                  type="button"
                  className="vaastu-reels-close"
                  aria-label="Close reels"
                  onClick={closeReels}
                >
                  ×
                </button>

                <div className="vaastu-reels-shell">
              <p className="vaastu-reels-hint" aria-hidden="true">
                Scroll for next reel
              </p>

              <div
                ref={scrollerRef}
                className="vaastu-reels-scroller"
                aria-label="Instagram reels"
              >
                {INSTAGRAM_REELS.map((reel, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <div
                      key={reel.id}
                      className={`vaastu-reels-item${isActive ? " is-active" : ""}`}
                      data-reel-index={index}
                      ref={(el) => {
                        itemRefs.current[index] = el;
                      }}
                    >
                      {isActive ? (
                        <iframe
                          key={`${reel.id}-active-${activeIndex}`}
                          src={getInstagramEmbedUrl(reel.id)}
                          title={reel.title}
                          className="vaastu-reels-iframe"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share"
                        />
                      ) : (
                        <div className="vaastu-reels-slide-idle" aria-hidden="true">
                          <img
                            src={getInstagramThumbnailUrl(reel.id)}
                            alt={reel.title}
                            title={reel.title}
                            className="vaastu-reels-thumb"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="vaastu-reels-thumb-dim" />
                          <span className="vaastu-reels-thumb-play">
                            <img
                              src="/static/vaastu-strip/play-circle-line.svg"
                              alt={getPlayIconLabel(reel.title)}
                              title={getPlayIconLabel(reel.title)}
                              width={52}
                              height={52}
                              decoding="async"
                            />
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
                </div>
              </div>

              <div className="vaastu-reels-nav-rail" aria-label="Reel navigation">
                <button
                  type="button"
                  className="vaastu-reels-nav-btn"
                  aria-label="Previous reel"
                  disabled={activeIndex === 0}
                  onClick={() => scrollToReel(activeIndex - 1)}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M6 15L12 9L18 15"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  className="vaastu-reels-nav-btn"
                  aria-label="Next reel"
                  disabled={activeIndex === INSTAGRAM_REELS.length - 1}
                  onClick={() => scrollToReel(activeIndex + 1)}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
