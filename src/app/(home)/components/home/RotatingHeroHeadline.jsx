"use client";

import { useEffect, useState } from "react";

const HEADLINES = [
  { base: "Making Property Search ", highlight: "Hassle-Free" },
  { base: "Real Estate, ", highlight: "Simple and Quick!" },
  { base: "Real Estate, ", highlight: "Fast and Simple!" },
];

export default function RotatingHeroHeadline() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSwitchingOut, setIsSwitchingOut] = useState(false);

  useEffect(() => {
    const CYCLE_MS = 5000;
    const SWITCH_MS = 520;

    const timer = setInterval(() => {
      setIsSwitchingOut(true);
      window.setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % HEADLINES.length);
        setIsSwitchingOut(false);
      }, SWITCH_MS);
    }, CYCLE_MS);

    return () => clearInterval(timer);
  }, []);

  const active = HEADLINES[activeIndex];

  return (
    <h2
      className={`transform-home-headline-inner ${
        isSwitchingOut ? "is-switching-out" : "is-switching-in"
      }`}
      aria-live="polite"
    >
      <span className="transform-home-headline-base">{active.base}</span>
      <span className="transform-home-headline-highlight">{active.highlight}</span>
    </h2>
  );
}
