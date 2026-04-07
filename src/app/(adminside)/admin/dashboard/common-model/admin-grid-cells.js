"use client";

import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";

/** Circular table thumbnail — preserves image display per design. */
export function AdminGridImageThumb({ src, alt, onPreviewClick }) {
  if (!src) {
    return <div className="admin-grid-thumb admin-grid-thumb--empty" aria-hidden />;
  }
  const inner = (
    <div className="admin-grid-thumb">
      <Image
        src={src}
        alt={alt || ""}
        width={40}
        height={40}
        className="admin-grid-thumb__img"
        unoptimized
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

/** Blue edit + red delete icon buttons to match reference UI. */
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
        <FontAwesomeIcon icon={faPencil} />
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
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </div>
  );
}
