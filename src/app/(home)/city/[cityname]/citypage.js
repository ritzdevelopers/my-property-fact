"use client";

import "./citypage.css";
import "../../projects/projects-redesign.css";
import Link from "next/link";
import CityProjectsPanel, {
  CityMonumentShowcase,
} from "./components/CityProjectsPanel";
import { useMemo } from "react";
import { slimProjectListForListing } from "@/lib/slimProjectListing";

export default function CityPage({ cityData, initialProjects = [] }) {
  const cityName = cityData?.cityName?.trim() || "City";

  const projects = useMemo(
    () => slimProjectListForListing(initialProjects),
    [initialProjects],
  );

  return (
    <div className="city-page-redesign">
      <div className="city-page-redesign__body">
        <header className="city-page-redesign__header">
          <nav className="city-page-redesign__breadcrumb" aria-label="Breadcrumb">
            <Link href="/" title="Home">Home</Link>
            <span aria-hidden="true">&gt;</span>
            <Link href="/projects" title="Projects">Projects</Link>
            <span aria-hidden="true">&gt;</span>
            <span>{cityName}</span>
          </nav>
          <h1 id="mpf-page-heading" className="city-page-redesign__title">
            {cityName}
          </h1>
        </header>

        <div className="city-page-redesign__split">
          <CityProjectsPanel
            cityData={cityData}
            projects={projects}
            projectsLoading={false}
          />
          <CityMonumentShowcase
            cityData={cityData}
            projectCount={projects.length}
          />
        </div>
      </div>
    </div>
  );
}
