"use client";

import PropertyContainer from "@/app/(home)/components/common/page";
import {
  LISTING_PAGE_SIZE,
  ProjectListingPaginationControls,
  useProjectListingPagination,
} from "@/app/_global_components/projectListingPagination";

export default function PropertyPage({ projectTypeDetails }) {
  const list = Array.isArray(projectTypeDetails?.projectList)
    ? projectTypeDetails.projectList
    : [];
  const projectTypeName = String(projectTypeDetails?.projectTypeName || "")
    .trim()
    .toLowerCase();
  const pageHeadingByType = {
    residential:
      "Explore Top Residential Properties in India with Luxury Apartments, & Amenities",
    commercial:
      "Explore Premium Commercial Properties in India with Prime Locations & High ROI.",
    "new launches":
      "Explore New Real Estate Projects in India, Top Locations, & Investment Deals.",
    "new-launches":
      "Explore New Real Estate Projects in India, Top Locations, & Investment Deals.",
  };
  const projectsPageH2 = pageHeadingByType[projectTypeName] || "";

  const { pageItems, currentPage, totalPages, totalItems, setPage } =
    useProjectListingPagination(list, LISTING_PAGE_SIZE);

  return (
    <div className="container my-5">
      {projectsPageH2 ? (
        <section className="mb-4 mb-md-5">
          <div className="mx-auto px-2 text-center" style={{ maxWidth: "980px" }}>
            <h2 className="fw-semibold lh-base mb-0">{projectsPageH2}</h2>
          </div>
        </section>
      ) : null}
      <div className="row g-3">
        {pageItems.length > 0 ? (
          pageItems.map((item, index) => (
            <div
              key={item?.id != null ? String(item.id) : `project-${index}`}
              className="col-12 col-sm-6 col-md-4"
            >
              <PropertyContainer data={item} />
            </div>
          ))
        ) : (
          <p className="text-center fs-4 fw-bold">No projects found</p>
        )}
      </div>
      <ProjectListingPaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={LISTING_PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
