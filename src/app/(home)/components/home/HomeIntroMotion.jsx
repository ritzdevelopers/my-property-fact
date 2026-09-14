"use client";

import "./home-new.css";

/** Wraps home server content (layout wrapper only; gateway motion is header-only). */
export default function HomeIntroMotion({ children }) {
  return <div className="home-page-entrance mpf-home-r26">{children}</div>;
}
