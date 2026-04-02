"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import styles from "./projectListingPagination.module.css";

export const LISTING_PAGE_SIZE = 12;

/**
 * Page indices to show: numbers and 'ellipsis' for gaps.
 */
function buildVisiblePages(currentPage, totalPages) {
  if (totalPages <= 1) return [1];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const set = new Set([1, totalPages, currentPage]);
  for (let i = currentPage - 1; i <= currentPage + 1; i += 1) {
    if (i >= 1 && i <= totalPages) set.add(i);
  }
  const sorted = [...set].sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      out.push("ellipsis");
    }
    out.push(sorted[i]);
  }
  return out;
}

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
  /** Client-side list (e.g. /projects): updates page without ?page= in the URL. */
  onPageChange,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const visiblePages = useMemo(
    () => buildVisiblePages(currentPage, totalPages),
    [currentPage, totalPages],
  );

  if (totalItems <= pageSize) return null;

  const goToPage = (p) => {
    if (typeof onPageChange === "function") {
      onPageChange(p);
      return;
    }
    const next = new URLSearchParams(searchParams.toString());
    if (p <= 1) next.delete("page");
    else next.set("page", String(p));
    const q = next.toString();
    router.push(q ? `${pathname}?${q}` : pathname, { scroll: true });
  };

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  return (
    <nav className={styles.wrap} aria-label="Project list pagination">
      <p className={styles.meta}>
        Showing <strong>{from}</strong>–<strong>{to}</strong> of{" "}
        <strong>{totalItems}</strong> projects
      </p>
      <div className={styles.bar}>
        <button
          type="button"
          className={styles.navBtn}
          disabled={currentPage <= 1}
          onClick={() => goToPage(currentPage - 1)}
          aria-label="Previous page"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="fa-fw" />
          <span className={styles.navBtnLabel}>Previous</span>
        </button>

        <div className={styles.pages} role="group" aria-label="Page numbers">
          {visiblePages.map((item, idx) =>
            item === "ellipsis" ? (
              <span key={`e-${idx}`} className={styles.ellipsis} aria-hidden>
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={`${styles.pageBtn} ${item === currentPage ? styles.active : ""}`}
                onClick={() => goToPage(item)}
                aria-label={`Page ${item}`}
                aria-current={item === currentPage ? "page" : undefined}
              >
                {item}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          className={styles.navBtn}
          disabled={currentPage >= totalPages}
          onClick={() => goToPage(currentPage + 1)}
          aria-label="Next page"
        >
          <span className={styles.navBtnLabel}>Next</span>
          <FontAwesomeIcon icon={faChevronRight} className="fa-fw" />
        </button>
      </div>
    </nav>
  );
}
