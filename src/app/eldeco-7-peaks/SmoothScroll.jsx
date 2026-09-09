"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const HEADER_OFFSET = -90;
const CLEAR = "transform,filter";

function baseTrigger(trigger, start = "top 86%") {
  return {
    trigger,
    start,
    once: true,
  };
}

function fadeUp(targets, trigger, vars = {}) {
  if (!targets || (targets.length !== undefined && !targets.length)) return;

  gsap.fromTo(
    targets,
    { autoAlpha: 0, y: vars.fromY ?? 36 },
    {
      autoAlpha: 1,
      y: 0,
      duration: vars.duration ?? 0.8,
      delay: vars.delay ?? 0,
      stagger: vars.stagger,
      ease: vars.ease ?? "power3.out",
      clearProps: "transform",
      scrollTrigger: baseTrigger(trigger, vars.start),
      ...vars.extra,
    },
  );
}

/**
 * Lenis smooth scroll + richer per-section ScrollTrigger reveals.
 * Uses transform/opacity only so layout and responsiveness stay intact.
 */
export default function SmoothScroll({ children }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === "undefined") return;

    const html = document.documentElement;
    const body = document.body;
    html.classList.add("eldeco-7peaks-hide-scrollbar");
    body.classList.add("eldeco-7peaks-hide-scrollbar");

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const clearPageHash = () => {
      if (!window.location.hash) return;
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    };

    const scrollToPageTop = (smoothScroller) => {
      clearPageHash();
      if (smoothScroller) {
        smoothScroller.scrollTo(0, { duration: 1.15 });
        return;
      }
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    };

    if (prefersReducedMotion) {
      const onScrollTop = () => scrollToPageTop(null);
      window.addEventListener("7peaks-scroll-top", onScrollTop);
      return () => {
        window.removeEventListener("7peaks-scroll-top", onScrollTop);
        html.classList.remove("eldeco-7peaks-hide-scrollbar");
        body.classList.remove("eldeco-7peaks-hide-scrollbar");
      };
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 1.5,
      syncTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tickerFn = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const syncScrollLock = () => {
      const locked =
        document.body.style.overflow === "hidden" ||
        document.body.style.position === "fixed";
      if (locked) lenis.stop();
      else lenis.start();
    };

    const lockObserver = new MutationObserver(syncScrollLock);
    lockObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });
    syncScrollLock();

    const onAnchorClick = (event) => {
      const anchor = event.target.closest?.('a[href^="#"]');
      if (!anchor) return;

      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#" || hash === "#top") {
        event.preventDefault();
        scrollToPageTop(lenis);
        return;
      }

      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      if (window.location.hash !== hash) {
        window.history.pushState(null, "", hash);
      }
      lenis.scrollTo(target, {
        offset: HEADER_OFFSET,
        duration: 1.15,
      });
    };

    const onScrollTop = () => scrollToPageTop(lenis);
    document.addEventListener("click", onAnchorClick);
    window.addEventListener("7peaks-scroll-top", onScrollTop);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* —— Hero —— */
        const heroSection = document.querySelector("#top");
        const heroImg = heroSection?.querySelector("img");
        if (heroSection && heroImg) {
          gsap.set(heroSection, { overflow: "hidden" });

          gsap.fromTo(
            heroImg,
            { autoAlpha: 0, scale: 1.08 },
            {
              autoAlpha: 1,
              scale: 1,
              duration: 1.3,
              ease: "power2.out",
              clearProps: CLEAR,
            },
          );

          gsap.to(heroImg, {
            yPercent: 10,
            ease: "none",
            scrollTrigger: {
              trigger: heroSection,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
          });
        }

        /* —— Overview —— */
        const overview = document.querySelector("#overview");
        if (overview) {
          const title = overview.querySelector("h2");
          const copy = overview.querySelector("p");
          const cta = overview.querySelector("button");

          if (title) {
            gsap.fromTo(
              title,
              { autoAlpha: 0, y: 40, filter: "blur(8px)" },
              {
                autoAlpha: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.95,
                ease: "power3.out",
                clearProps: CLEAR,
                scrollTrigger: baseTrigger(overview, "top 82%"),
              },
            );
          }

          fadeUp(copy, overview, {
            fromY: 48,
            duration: 1,
            delay: 0.12,
            start: "top 82%",
          });

          if (cta) {
            gsap.fromTo(
              cta,
              { autoAlpha: 0, y: 24, scale: 0.9 },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.75,
                delay: 0.28,
                ease: "back.out(1.45)",
                clearProps: CLEAR,
                scrollTrigger: baseTrigger(overview, "top 82%"),
              },
            );
          }
        }

        /* —— Highlights —— */
        const highlights = document.querySelector("#highlights");
        if (highlights) {
          const title = highlights.querySelector("h2");
          const subtitle = highlights.querySelector(
            ":scope > div.relative > p, :scope > div > p",
          );
          const cards = highlights.querySelectorAll("article");

          if (title) {
            gsap.fromTo(
              title,
              { autoAlpha: 0, y: 36, filter: "blur(6px)" },
              {
                autoAlpha: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.85,
                ease: "power3.out",
                clearProps: CLEAR,
                scrollTrigger: baseTrigger(highlights, "top 80%"),
              },
            );
          }

          fadeUp(subtitle, highlights, {
            fromY: 22,
            delay: 0.1,
            start: "top 80%",
          });

          if (cards.length) {
            gsap.fromTo(
              cards,
              { autoAlpha: 0, y: 52, scale: 0.88 },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.75,
                stagger: 0.08,
                ease: "power3.out",
                clearProps: CLEAR,
                scrollTrigger: baseTrigger(cards[0], "top 90%"),
              },
            );

            gsap.fromTo(
              highlights.querySelectorAll("article img"),
              { autoAlpha: 0, scale: 0.55, rotate: -14 },
              {
                autoAlpha: 1,
                scale: 1,
                rotate: 0,
                duration: 0.65,
                stagger: 0.08,
                ease: "back.out(1.7)",
                clearProps: CLEAR,
                scrollTrigger: baseTrigger(cards[0], "top 90%"),
              },
            );
          }
        }

        /* —— Price —— */
        const price = document.querySelector("#price");
        if (price) {
          const title = price.querySelector("h2");
          const subtitle = price.querySelector(":scope > p");
          const cards = price.querySelectorAll("article");
          const buttons = price.querySelectorAll("button");
          const enquire = buttons[buttons.length - 1];

          if (title) {
            gsap.fromTo(
              title,
              { autoAlpha: 0, y: 36, filter: "blur(6px)" },
              {
                autoAlpha: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.85,
                ease: "power3.out",
                clearProps: CLEAR,
                scrollTrigger: baseTrigger(price, "top 82%"),
              },
            );
          }

          fadeUp(subtitle, price, { fromY: 20, start: "top 82%" });

          cards.forEach((card, i) => {
            gsap.fromTo(
              card,
              {
                autoAlpha: 0,
                x: i % 2 === 0 ? -56 : 56,
                y: 28,
                rotate: i % 2 === 0 ? -2 : 2,
              },
              {
                autoAlpha: 1,
                x: 0,
                y: 0,
                rotate: 0,
                duration: 0.9,
                ease: "power3.out",
                clearProps: CLEAR,
                scrollTrigger: baseTrigger(card, "top 90%"),
              },
            );
          });

          if (enquire) {
            gsap.fromTo(
              enquire,
              { autoAlpha: 0, y: 28, scale: 0.92 },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.7,
                ease: "back.out(1.35)",
                clearProps: CLEAR,
                scrollTrigger: baseTrigger(enquire, "top 94%"),
              },
            );
          }
        }

        /* —— Floor plan —— */
        const floor = document.querySelector("#floor-plan");
        const floorImg = floor?.querySelector("img");
        if (floor && floorImg) {
          gsap.set(floor, { overflow: "hidden" });
          gsap.fromTo(
            floorImg,
            { autoAlpha: 0, scale: 1.1, y: 48 },
            {
              autoAlpha: 1,
              scale: 1,
              y: 0,
              duration: 1.2,
              ease: "power3.out",
              clearProps: CLEAR,
              scrollTrigger: baseTrigger(floor, "top 85%"),
            },
          );
        }

        /* —— Location —— */
        const location = document.querySelector("#location");
        if (location) {
          const eyebrow = location.querySelector('[class*="tracking-"]');
          const title = location.querySelector("h2");
          const intro = location.querySelector(":scope > div > p");
          const grid = location.querySelector(":scope > div.mx-auto");
          const mapCol = grid?.children?.[0];
          const listCol = grid?.children?.[1];
          const landmarks = listCol?.querySelectorAll(".flex.flex-col.gap-4 > div");

          if (eyebrow) {
            gsap.fromTo(
              eyebrow,
              { autoAlpha: 0, y: 14 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.65,
                ease: "power2.out",
                clearProps: "transform",
                scrollTrigger: baseTrigger(location, "top 86%"),
              },
            );
          }

          if (title) {
            gsap.fromTo(
              title,
              { autoAlpha: 0, y: 36, filter: "blur(6px)" },
              {
                autoAlpha: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.9,
                ease: "power3.out",
                clearProps: CLEAR,
                scrollTrigger: baseTrigger(location, "top 84%"),
              },
            );
          }

          fadeUp(intro, location, { fromY: 22, start: "top 84%" });

          if (mapCol) {
            gsap.fromTo(
              mapCol,
              { autoAlpha: 0, x: -60, scale: 0.96 },
              {
                autoAlpha: 1,
                x: 0,
                scale: 1,
                duration: 1,
                ease: "power3.out",
                clearProps: CLEAR,
                scrollTrigger: baseTrigger(mapCol, "top 88%"),
              },
            );
          }

          if (listCol) {
            const heading = listCol.querySelector("h3");
            if (heading) {
              gsap.fromTo(
                heading,
                { autoAlpha: 0, x: 40 },
                {
                  autoAlpha: 1,
                  x: 0,
                  duration: 0.7,
                  ease: "power2.out",
                  clearProps: "transform",
                  scrollTrigger: baseTrigger(listCol, "top 88%"),
                },
              );
            }
          }

          if (landmarks?.length) {
            gsap.fromTo(
              landmarks,
              { autoAlpha: 0, x: 44, y: 10 },
              {
                autoAlpha: 1,
                x: 0,
                y: 0,
                duration: 0.55,
                stagger: 0.075,
                ease: "power2.out",
                clearProps: "transform",
                scrollTrigger: baseTrigger(landmarks[0], "top 92%"),
              },
            );
          }
        }

        /* —— Amenities —— */
        const amenities = document.querySelector("#amenities");
        if (amenities) {
          const title = amenities.querySelector("h2");
          const grids = amenities.querySelectorAll(":scope > div.grid");
          const iconGrid = grids[0];
          const featureGrid = grids[1];
          const bookBtn = amenities.querySelector("button");

          if (title) {
            gsap.fromTo(
              title,
              { autoAlpha: 0, y: 36, filter: "blur(6px)" },
              {
                autoAlpha: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.85,
                ease: "power3.out",
                clearProps: CLEAR,
                scrollTrigger: baseTrigger(amenities, "top 84%"),
              },
            );
          }

          if (iconGrid?.children?.length) {
            gsap.fromTo(
              iconGrid.children,
              { autoAlpha: 0, y: 40, scale: 0.86 },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.55,
                stagger: { each: 0.045, from: "center" },
                ease: "power2.out",
                clearProps: CLEAR,
                scrollTrigger: baseTrigger(iconGrid, "top 88%"),
              },
            );
          }

          if (featureGrid?.children?.length) {
            gsap.fromTo(
              featureGrid.children,
              { autoAlpha: 0, y: 64, scale: 1.05 },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.95,
                stagger: 0.15,
                ease: "power3.out",
                clearProps: CLEAR,
                scrollTrigger: baseTrigger(featureGrid, "top 88%"),
              },
            );
          }

          if (bookBtn) {
            gsap.fromTo(
              bookBtn,
              { autoAlpha: 0, y: 24, scale: 0.92 },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.7,
                ease: "back.out(1.4)",
                clearProps: CLEAR,
                scrollTrigger: baseTrigger(bookBtn, "top 94%"),
              },
            );
          }
        }

        /* —— Gallery —— */
        const gallery = document.querySelector("#gallery");
        if (gallery) {
          const title = gallery.querySelector("h2");
          const content = gallery.querySelector(".relative.z-10 > div");

          if (title) {
            gsap.fromTo(
              title,
              { autoAlpha: 0, x: -48, filter: "blur(6px)" },
              {
                autoAlpha: 1,
                x: 0,
                filter: "blur(0px)",
                duration: 0.95,
                ease: "power3.out",
                clearProps: CLEAR,
                scrollTrigger: baseTrigger(gallery, "top 78%"),
              },
            );
          }

          if (content) {
            gsap.fromTo(
              content,
              { autoAlpha: 0, y: 52, scale: 0.97 },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 1.05,
                ease: "power3.out",
                clearProps: CLEAR,
                scrollTrigger: baseTrigger(gallery, "top 76%"),
              },
            );
          }
        }

        /* —— Enquiry —— */
        const enquiry = document.querySelector("#enquiry");
        if (enquiry) {
          const headingBlock = enquiry.querySelector(".relative.z-10");
          const form = enquiry.querySelector("form");

          if (headingBlock) {
            gsap.fromTo(
              headingBlock,
              { autoAlpha: 0, y: 40, filter: "blur(8px)" },
              {
                autoAlpha: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.95,
                ease: "power3.out",
                clearProps: CLEAR,
                scrollTrigger: baseTrigger(enquiry, "top 82%"),
              },
            );
          }

          if (form) {
            gsap.fromTo(
              form,
              { autoAlpha: 0, y: 60, scale: 0.95 },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 1,
                delay: 0.12,
                ease: "power3.out",
                clearProps: CLEAR,
                scrollTrigger: baseTrigger(enquiry, "top 80%"),
              },
            );
          }
        }

        /* —— Footer —— */
        const footer = document.querySelector("footer");
        if (footer) {
          fadeUp(footer, footer, { fromY: 18, duration: 0.55, start: "top 98%" });
        }
      });

      return () => mm.revert();
    }, root);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      document.removeEventListener("click", onAnchorClick);
      window.removeEventListener("7peaks-scroll-top", onScrollTop);
      lockObserver.disconnect();
      gsap.ticker.remove(tickerFn);
      ctx.revert();
      lenis.destroy();
      ScrollTrigger.getAll().forEach((st) => st.kill());
      html.classList.remove("eldeco-7peaks-hide-scrollbar");
      body.classList.remove("eldeco-7peaks-hide-scrollbar");
    };
  }, []);

  return (
    <div ref={rootRef} className="contents">
      {children}
    </div>
  );
}
