"use client";

import { AdminTableDeleteIcon, AdminTableEditIcon } from "./admin-table-icons";

/** Circular table thumbnail — preserves image display per design.
 *  @param {"cover" | "contain"} fit — `contain` for dark-on-light icons (amenities, benefits). */
export function AdminGridImageThumb({ src, alt, onPreviewClick, fit = "cover" }) {
  if (!src) {
    return <div className="admin-grid-thumb admin-grid-thumb--empty" aria-hidden />;
  }
  const thumbClass =
    fit === "contain"
      ? "admin-grid-thumb admin-grid-thumb--contain"
      : "admin-grid-thumb";
  const inner = (
    <div className={thumbClass}>
      <img
        src={src}
        alt={alt || ""}
        width={40}
        height={40}
        className="admin-grid-thumb__img"
      />
    </div>
  );
  if (typeof onPreviewClick === "function") {
    return (
      <button
        type="button"
        className="admin-grid-thumb-button"
        onClick={(e) => {
          e.stopPropagation();
          onPreviewClick(src, alt || "");
        }}
        aria-label="View full image"
      >
        {inner}
      </button>
    );
  }
  return inner;
}

/** Edit / delete using brand SVGs from `/public/images/admin/`. */
export function AdminGridActions({ onEdit, onDelete }) {
  return (
    <div className="admin-grid-actions">
      <button
        type="button"
        className="admin-grid-action admin-grid-action--edit"
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.();
        }}
        aria-label="Edit"
      >
        <AdminTableEditIcon width={15} height={15} />
      </button>
      <button
        type="button"
        className="admin-grid-action admin-grid-action--delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.();
        }}
        aria-label="Delete"
      >
        <AdminTableDeleteIcon width={12} height={15} />
      </button>
    </div>
  );
}
