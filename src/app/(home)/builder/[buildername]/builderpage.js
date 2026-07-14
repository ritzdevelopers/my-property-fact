"use client";

import "./builderpage.css";
import "../../projects/projects-redesign.css";
import Link from "next/link";
import { useMemo } from "react";
import { slimProjectListForListing } from "@/lib/slimProjectListing";
import BuilderProjectsPanel, {
  BuilderShowcase,
} from "./components/BuilderProjectsPanel";

export default function BuilderPage({ builderData, initialProjects = [] }) {
  const builderName = builderData?.builderName?.trim() || "Builder";

  const projects = useMemo(
    () => slimProjectListForListing(initialProjects),
    [initialProjects],
  );

  return (
    <div className="builder-page-redesign">
      <div className="builder-page-redesign__body">
        <header className="builder-page-redesign__header">
          <nav
            className="builder-page-redesign__breadcrumb"
            aria-label="Breadcrumb"
          >
            <Link href="/" title="Home">
              Home
            </Link>
            <span aria-hidden="true">&gt;</span>
            <Link href="/projects" title="Projects">
              Projects
            </Link>
            <span aria-hidden="true">&gt;</span>
            <span>{builderName}</span>
          </nav>
          <h1 id="mpf-page-heading" className="builder-page-redesign__title">
            {builderName}
          </h1>
        </header>

        <div className="builder-page-redesign__split">
          <BuilderProjectsPanel
            builderData={builderData}
            projects={projects}
            projectsLoading={false}
          />
          <BuilderShowcase
            builderData={builderData}
            projectCount={projects.length}
          />
        </div>
      </div>
    </div>
  );
}
