"use client";

import { useEffect, useRef, useState } from "react";
import { sanitizeHtml } from "@/app/_global_components/sanitize";

const COLLAPSED_HEIGHT = 280;

export default function ListingPageSeoContent({ content }) {
  const html = sanitizeHtml(String(content?.content || "").trim());
  const bodyRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    const measure = () => {
      const height = el.scrollHeight;
      setContentHeight(height);
      setCanExpand(height > COLLAPSED_HEIGHT + 4);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);

    return () => observer.disconnect();
  }, [html]);

  if (!html) return null;

  const isCollapsed = canExpand && !expanded;
  const clipHeight = canExpand
    ? isCollapsed
      ? COLLAPSED_HEIGHT
      : contentHeight
    : undefined;

  return (
    <section className="listing-seo-content" aria-label="Page information">
      <div className="listing-seo-content__box">
        <div
          className={`listing-seo-content__clip${isCollapsed ? " is-collapsed" : ""}${expanded ? " is-expanded" : ""}`}
          style={{ maxHeight: clipHeight }}
        >
          <div
            ref={bodyRef}
            className="listing-seo-content__body"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>

        {canExpand && (
          <button
            type="button"
            className={`listing-seo-content__toggle${expanded ? " is-expanded" : ""}`}
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
          >
            <span>{expanded ? "Read less" : "Read more"}</span>
            <svg
              className="listing-seo-content__toggle-icon"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3.5 5.25L7 8.75L10.5 5.25"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}
