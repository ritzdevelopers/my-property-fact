"use client";

/**
 * Wraps home server content. Entry motion is driven by `body.mpf-post-gateway-reveal`
 * (set in WebsiteGateway when the splash overlay finishes).
 */
export default function HomeIntroMotion({ children }) {
  return <div className="home-page-entrance">{children}</div>;
}
