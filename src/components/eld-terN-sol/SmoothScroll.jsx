"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function SmoothScroll({ children }) {
  const container = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const lenis = new Lenis({
        duration: 1.15,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.1,
      });

      const updateScrollTrigger = () => ScrollTrigger.update();
      const updateLenis = (time) => lenis.raf(time * 1000);

      lenis.on("scroll", updateScrollTrigger);
      gsap.ticker.add(updateLenis);
      gsap.ticker.lagSmoothing(0);

      const sections = Array.from(container.current.children).filter(
        (element) => element.tagName === "SECTION",
      );

      sections.forEach((section, index) => {
        if (index === 0) {
          gsap.fromTo(
            section,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              duration: 1.2,
              ease: "power2.out",
              clearProps: "opacity,visibility",
            },
          );
        } else {
          gsap.fromTo(
            section,
            { autoAlpha: 0, y: 48 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1.15,
              ease: "power3.out",
              clearProps: "transform,opacity,visibility",
              scrollTrigger: {
                trigger: section,
                start: "top 86%",
                once: true,
              },
            },
          );
        }

        const contentElements = Array.from(
          section.querySelectorAll("h1, h2, h3, p, li, form"),
        ).filter((element) => {
          if (element.matches("p") && element.closest("li, form")) {
            return false;
          }

          return true;
        });

        if (contentElements.length > 0) {
          if (index === 0) {
            gsap.fromTo(
              contentElements,
              { autoAlpha: 0, y: 22 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.9,
                delay: 0.15,
                stagger: 0.07,
                ease: "power2.out",
                clearProps: "transform,opacity,visibility",
              },
            );
          } else {
            gsap.fromTo(
              contentElements,
              { autoAlpha: 0, y: 28 },
              {
                autoAlpha: 1,
                y: 0,
                stagger: 0.08,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: section,
                  start: "top 88%",
                  end: "top 42%",
                  scrub: 0.8,
                },
              },
            );
          }
        }

        const images = Array.from(section.querySelectorAll("img")).filter(
          (image) => !image.closest("a, button") && !image.hasAttribute("data-hero-slide"),
        );

        if (images.length > 0) {
          gsap.fromTo(
            images,
            { yPercent: -1.5, scale: 1.025 },
            {
              yPercent: 1.5,
              scale: 1.025,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.2,
              },
            },
          );
        }
      });

      ScrollTrigger.refresh();

      return () => {
        lenis.off("scroll", updateScrollTrigger);
        gsap.ticker.remove(updateLenis);
        lenis.destroy();
      };
    },
    { scope: container },
  );

  return <main ref={container}>{children}</main>;
}
