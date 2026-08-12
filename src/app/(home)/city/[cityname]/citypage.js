"use client";

import "./citypage.css";
import "../../projects/projects-redesign.css";
import CityProjectsPanel from "./components/CityProjectsPanel";
import CityHeroBanner from "./components/CityHeroBanner";
import CityGuideSection from "./components/CityGuideSection";
import { useMemo } from "react";
import { slimProjectListForListing } from "@/lib/slimProjectListing";

export default function CityPage({ cityData, initialProjects = [] }) {
  const projects = useMemo(
    () => slimProjectListForListing(initialProjects),
    [initialProjects],
  );

  return (
    <div className="city-page-redesign">
      <CityHeroBanner cityData={cityData} projectCount={projects.length} />

      <div className="city-page-redesign__body">
        <CityProjectsPanel
          cityData={cityData}
          projects={projects}
          projectsLoading={false}
        />

        <CityGuideSection cityData={cityData} />
      </div>
    </div>
  );
}
