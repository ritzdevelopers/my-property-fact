"use client";

import { usePathname } from "next/navigation";
import ListingCardSkeleton from "@/app/(home)/projects/components/ListingCardSkeleton";
import "@/app/(home)/projects/projects-redesign.css";
import "./propertyV3.css";

function isListingSlugPath(pathname = "") {
  const slug = String(pathname || "")
    .replace(/^\//, "")
    .split(/[?#]/)[0]
    .toLowerCase();
  return Boolean(slug) && slug.includes("-in-");
}

function ProjectDetailSkeleton() {
  return (
    <div className="pd3-root pd3-loading-shell" aria-busy="true" aria-label="Loading project">
      <div className="pd3-loading-topbar" />
      <div className="pd3-container">
        <div className="pd3-hero-collage pd3-hero-collage--loading">
          <div className="pd3-hero-tile pd3-hero-tile--primary pd3-hero-tile--skeleton" />
          <div className="pd3-hero-side">
            <div className="pd3-hero-tile pd3-hero-tile--side pd3-hero-tile--skeleton" />
            <div className="pd3-hero-tile pd3-hero-tile--side pd3-hero-tile--skeleton" />
          </div>
        </div>
        <div className="pd3-summary pd3-summary--skeleton">
          <div className="pd3-skeleton-line pd3-skeleton-line--title" />
          <div className="pd3-skeleton-line pd3-skeleton-line--sub" />
        </div>
      </div>
    </div>
  );
}

function ListingPageSkeleton() {
  return (
    <div className="mpf-projects-page mpf-listing-route-skel" aria-busy="true" aria-label="Loading projects">
      <div className="mpf-listing-route-skel__topbar" />
      <div className="mpf-container">
        <div className="mpf-page-hero">
          <div className="mpf-skel-line mpf-skel-line--crumb" />
          <div className="mpf-skel-line mpf-skel-line--heading" />
          <div className="mpf-skel-line mpf-skel-line--count" />
        </div>
        <div className="mpf-main-layout">
          <aside className="mpf-filters-sidebar mpf-listing-route-skel__sidebar">
            <div className="mpf-skel-line mpf-skel-line--side-title" />
            <div className="mpf-skel-line mpf-skel-line--side" />
            <div className="mpf-skel-line mpf-skel-line--side" />
            <div className="mpf-skel-line mpf-skel-line--side" />
            <div className="mpf-skel-line mpf-skel-line--side-title" />
            <div className="mpf-skel-line mpf-skel-line--side" />
            <div className="mpf-skel-line mpf-skel-line--side" />
            <div className="mpf-skel-line mpf-skel-line--side" />
          </aside>
          <div className="mpf-listings">
            <ListingCardSkeleton count={3} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CatchAllRouteSkeleton() {
  const pathname = usePathname();
  if (isListingSlugPath(pathname)) {
    return <ListingPageSkeleton />;
  }
  return <ProjectDetailSkeleton />;
}
