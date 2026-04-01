"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const LISTING_PAGE_SIZE = 12;

/**
 * Paginates a client-side list using the `page` query param (?page=2).
 */
export function useProjectListingPagination(allItems, pageSize = LISTING_PAGE_SIZE) {
  const searchParams = useSearchParams();
  const pageRaw = searchParams.get("page");
  const parsed = Math.max(1, parseInt(pageRaw || "1", 10) || 1);
  const total = allItems?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const currentPage = Math.min(parsed, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = useMemo(
    () => (allItems || []).slice(start, start + pageSize),
    [allItems, start, pageSize],
  );
  return {
    pageItems,
    currentPage,
    totalPages,
    totalItems: total,
  };
}

export function ProjectListingPaginationControls({
  currentPage,
  totalPages,
  totalItems,
  pageSize = LISTING_PAGE_SIZE,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalItems <= pageSize) return null;

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams.toString());
    if (p <= 1) next.delete("page");
    else next.set("page", String(p));
    const q = next.toString();
    router.push(q ? `${pathname}?${q}` : pathname, { scroll: true });
  };

  return (
    <nav
      className="d-flex justify-content-center align-items-center gap-2 flex-wrap mt-4 mb-2"
      aria-label="Project list pagination"
    >
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm"
        disabled={currentPage <= 1}
        onClick={() => goToPage(currentPage - 1)}
      >
        Previous
      </button>
      <span className="text-muted small">
        Page {currentPage} of {totalPages}
      </span>
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm"
        disabled={currentPage >= totalPages}
        onClick={() => goToPage(currentPage + 1)}
      >
        Next
      </button>
    </nav>
  );
}
