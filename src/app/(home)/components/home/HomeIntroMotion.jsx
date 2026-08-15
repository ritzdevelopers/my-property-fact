"use client";

import "./home-redesign.css";
import "./rakshabandhan.css";

/** Wraps home server content (layout wrapper only; gateway motion is header-only). */
export default function HomeIntroMotion({ children }) {
  return <div className="home-page-entrance mpf-home-r26">{children}</div>;
}
