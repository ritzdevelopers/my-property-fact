"use client";

import { useRef } from "react";
import ProjectCard from "@/app/(home)/projects/components/ProjectCard";
import {
  LISTING_PAGE_SIZE,
  ProjectListingPaginationControls,
  useProjectListingPagination,
} from "@/app/_global_components/projectListingPagination";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import CityMonumentShowcase from "./CityMonumentShowcase";

export default function CityProjectsPanel({
  cityData,
  projects,
  projectsLoading,
}) {
  const cityName = cityData?.cityName?.trim() || "this city";
  const listingsRef = useRef(null);
  const { pageItems, currentPage, totalPages, totalItems, setPage } =
    useProjectListingPagination(projects, LISTING_PAGE_SIZE);

  return (
    <section className="city-projects-panel" aria-labelledby="city-projects-heading">
      <div className="city-projects-panel__header">
        <h2 id="city-projects-heading" className="city-projects-heading">
          Projects in {cityName}
        </h2>
        {!projectsLoading && totalItems > 0 ? (
          <p className="city-projects-panel__count">
            {totalItems} project{totalItems === 1 ? "" : "s"} available
          </p>
        ) : null}
      </div>

      {projectsLoading ? (
        <div className="city-projects-panel__loading">
          <LoadingSpinner show={true} />
        </div>
      ) : (
        <>
          <div className="city-projects-panel__grid" ref={listingsRef}>
            {pageItems.length > 0 ? (
              pageItems.map((item, index) => (
                <ProjectCard
                  key={
                    item?.id != null
                      ? String(item.id)
                      : `city-project-${index}`
                  }
                  project={item}
                  imagePriority={index < 3}
                />
              ))
            ) : (
              <p className="city-projects-panel__empty">
                No projects found in {cityName} right now.
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

export { CityMonumentShowcase };
