"use client";

import Image from "next/image";
import { AdminTableDeleteIcon, AdminTableEditIcon } from "./admin-table-icons";

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
        <img
          src="/images/admin/edit.svg"
          alt=""
          width={15}
          height={15}
          style={{ filter: "brightness(10)", pointerEvents: "none", display: "block" }}
        />
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
        <img
          src="/images/admin/delete.svg"
          alt=""
          width={12}
          height={15}
          style={{ filter: "brightness(10)", pointerEvents: "none", display: "block" }}
        />
      </button>
    </div>
  );
}
