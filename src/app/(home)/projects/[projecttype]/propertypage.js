"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PropertyContainer from "@/app/(home)/components/common/page";
import "../project.css";
import {
  LISTING_PAGE_SIZE,
  ProjectListingPaginationControls,
  useProjectListingPagination,
} from "@/app/_global_components/projectListingPagination";
import { projectNameMatchesSearch } from "@/app/_global_components/projectSearchUtils";
import { slimProjectListForListing } from "@/lib/slimProjectListing";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";

export default function PropertyPage({ projectTypeDetails, projectTypeSlug }) {
  const [list, setList] = useState([]);
  const [listLoading, setListLoading] = useState(() => Boolean(projectTypeSlug));
  const [projectSearchTerm, setProjectSearchTerm] = useState("");
  const listingsRef = useRef(null);

  useEffect(() => {
    const slug = String(projectTypeSlug || "").trim();
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
    if (!slug || !apiBase) {
      setListLoading(false);
      return;
    }

    let cancelled = false;
    setListLoading(true);

    fetch(`${apiBase}project-types/get/${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        setList(slimProjectListForListing(data?.projectList || []));
      })
      .catch(() => {
        if (!cancelled) setList([]);
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectTypeSlug]);
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

  const filteredList = useMemo(() => {
    const q = String(projectSearchTerm || "").trim();
    if (!q) return list;
    return list.filter((item) =>
      projectNameMatchesSearch(item?.projectName, q),
    );
  }, [list, projectSearchTerm]);

  const { pageItems, currentPage, totalPages, totalItems, setPage } =
    useProjectListingPagination(filteredList, LISTING_PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [projectSearchTerm, setPage]);

  return (
    <div className="container my-5">
      {projectsPageH2 ? (
        <section className="mb-4 mb-md-5">
          <div className="mx-auto px-2 text-center" style={{ maxWidth: "980px" }}>
            <h2 className="fw-semibold lh-base mb-0">{projectsPageH2}</h2>
          </div>
        </section>
      ) : null}
      <section className="mb-4">
        <div className="projects-top-search projects-top-search--compact projects-top-search--projecttype mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="projects-top-search-icon"
            aria-hidden
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="projects-top-search-input projects-top-search-input--compact"
            value={projectSearchTerm}
            onChange={(e) => setProjectSearchTerm(e.target.value)}
            placeholder='Search "Eldeco, M3M, Godrej..."'
        
          />
          {projectSearchTerm ? (
            <button
              type="button"
              className="projecttype-search-clear"
              onClick={() => setProjectSearchTerm("")}
              aria-label="Clear project search"
            >
              ×
            </button>
          ) : (
            <span className="projecttype-search-count">
              {filteredList.length}
            </span>
          )}
        </div>
        {/* <div className="projecttype-search-label text-center mt-2">
          Search project by name
        </div> */}
      </section>
      {listLoading ? (
        <div
          className="d-flex justify-content-center align-items-center my-5"
          style={{ minHeight: "320px" }}
        >
          <LoadingSpinner show={true} />
        </div>
      ) : (
        <div className="row g-3" ref={listingsRef}>
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
      )}
      <ProjectListingPaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={LISTING_PAGE_SIZE}
        onPageChange={setPage}
        scrollTargetRef={listingsRef}
      />
    </div>
  );
}
