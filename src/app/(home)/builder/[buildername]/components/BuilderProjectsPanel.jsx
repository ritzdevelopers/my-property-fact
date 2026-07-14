"use client";

import { useRef } from "react";
import ProjectCard from "@/app/(home)/projects/components/ProjectCard";
import {
  LISTING_PAGE_SIZE,
  ProjectListingPaginationControls,
  useProjectListingPagination,
} from "@/app/_global_components/projectListingPagination";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import BuilderShowcase from "./BuilderShowcase";

export default function BuilderProjectsPanel({
  builderData,
  projects,
  projectsLoading,
}) {
  const builderName = builderData?.builderName?.trim() || "this builder";
  const listingsRef = useRef(null);
  const { pageItems, currentPage, totalPages, totalItems, setPage } =
    useProjectListingPagination(projects, LISTING_PAGE_SIZE);

  return (
    <section
      className="builder-projects-panel"
      aria-labelledby="builder-projects-heading"
    >
      <div className="builder-projects-panel__header">
        <h2 id="builder-projects-heading" className="builder-projects-heading">
          Projects by {builderName}
        </h2>
        {!projectsLoading && totalItems > 0 ? (
          <p className="builder-projects-panel__count">
            {totalItems} project{totalItems === 1 ? "" : "s"} available
          </p>
        ) : null}
      </div>

      {projectsLoading ? (
        <div className="builder-projects-panel__loading">
          <LoadingSpinner show={true} />
        </div>
      ) : (
        <>
          <div className="builder-projects-panel__grid" ref={listingsRef}>
            {pageItems.length > 0 ? (
              pageItems.map((item, index) => (
                <ProjectCard
                  key={
                    item?.id != null
                      ? String(item.id)
                      : `builder-project-${index}`
                  }
                  project={item}
                  imagePriority={index < 3}
                />
              ))
            ) : (
              <p className="builder-projects-panel__empty">
                No projects found for {builderName} right now.
              </p>
            )}
          </div>

          <ProjectListingPaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={LISTING_PAGE_SIZE}
            onPageChange={setPage}
            scrollTargetRef={listingsRef}
          />
        </>
      )}
    </section>
  );
}

export { BuilderShowcase };
