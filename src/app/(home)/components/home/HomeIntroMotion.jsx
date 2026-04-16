"use client";

/** Wraps home server content (layout wrapper only; gateway motion is header-only). */
export default function HomeIntroMotion({ children }) {
  return <div className="home-page-entrance">{children}</div>;
}
