"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ACTIVITY_CHANGED_EVENT,
  isShortlisted,
  toggleProjectShortlist,
} from "@/lib/userActivity";

export default function ProjectShortlistButton({ project, className = "" }) {
  const slug = project?.slugURL || project?.slug || "";
  const id = project?.id;
  const label = project?.projectName || project?.name || slug;
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(isShortlisted(slug || id));
    sync();
    window.addEventListener(ACTIVITY_CHANGED_EVENT, sync);
    return () => window.removeEventListener(ACTIVITY_CHANGED_EVENT, sync);
  }, [slug, id]);

  const onClick = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleProjectShortlist({
        id,
        slug,
        label,
        href: slug ? `/${slug}` : "",
      }).then((next) => setSaved(Boolean(next)));
    },
    [id, slug, label],
  );

  if (!slug && id == null) return null;

  return (
    <button
      type="button"
      className={`mpf-shortlist-btn${saved ? " is-saved" : ""}${className ? ` ${className}` : ""}`}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${label} from shortlist` : `Shortlist ${label}`}
      title={saved ? "Remove from shortlist" : "Shortlist this property"}
      onClick={onClick}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} aria-hidden>
        <path
          d="M12 21s-6.4-4.35-9.2-8.2C1.1 10.5 1.3 7.2 3.5 5.5 5.4 4 8 4.4 9.5 6.2L12 9l2.5-2.8C16 4.4 18.6 4 20.5 5.5c2.2 1.7 2.4 5 0.7 7.3C18.4 16.65 12 21 12 21z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
