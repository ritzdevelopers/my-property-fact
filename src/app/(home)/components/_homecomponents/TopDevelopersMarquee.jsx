"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import "../home/home.css";

function sanitizeMetaText(value, fallback = "Developer") {
  const text = String(value || "").trim();
  if (!text || text === "/" || text.toLowerCase() === "null") return fallback;
  return text;
}

function LogoCell({ item, suppressA11y }) {
  const safeName = sanitizeMetaText(item.name, "Developer");
  const logoMeta = `${safeName} — developer logo`;
  const alt = suppressA11y ? logoMeta : logoMeta;
  const img = (
    <img
      src={item.src}
      alt={alt}
      title={logoMeta}
      width={176}
      height={56}
      className="transform-home-developers-logo"
      draggable={false}
    />
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className="transform-home-developers-link"
        title={safeName}
        draggable={false}
      >
        {img}
      </Link>
    );
  }

  return <span className="transform-home-developers-link">{img}</span>;
}

/**
 * @param {{ id: string, name: string, src: string, href: string | null }[]} items
 */
export default function TopDevelopersMarquee({ items = [] }) {
  const marqueeRef = useRef(null);
  const dragStateRef = useRef({ isDragging: false, startX: 0, scrollLeft: 0 });
  const hasDraggedRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const list = items.filter((i) => i?.src);
  if (list.length === 0) return null;

  const stopDragging = () => {
    dragStateRef.current.isDragging = false;
    setIsDragging(false);
  };

  const handleWheel = (event) => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    const delta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;
    if (!delta) return;

    event.preventDefault();
    marquee.scrollLeft += delta;
  };

  const handleMouseDown = (event) => {
    if (event.button !== 0 || !marqueeRef.current) return;

    dragStateRef.current = {
      isDragging: true,
      startX: event.clientX,
      scrollLeft: marqueeRef.current.scrollLeft,
    };
    hasDraggedRef.current = false;
    setIsDragging(true);
  };

  const handleMouseMove = (event) => {
    const marquee = marqueeRef.current;
    const dragState = dragStateRef.current;
    if (!marquee || !dragState.isDragging) return;

    const distance = event.clientX - dragState.startX;
    if (Math.abs(distance) > 4) {
      hasDraggedRef.current = true;
    }

    event.preventDefault();
    marquee.scrollLeft = dragState.scrollLeft - distance;
  };

  const handleClickCapture = (event) => {
    if (!hasDraggedRef.current) return;

    event.preventDefault();
    event.stopPropagation();
    hasDraggedRef.current = false;
  };

  return (
    <div className="transform-home-developers" aria-label="Top developers">
      <div className="transform-home-developers-label" aria-hidden>
        <span className="transform-home-developers-label-line">Top</span>
        <span className="transform-home-developers-label-line">Developers</span>
      </div>
      <div className="transform-home-developers-divider" aria-hidden />
      <div
        ref={marqueeRef}
        className={[
          "transform-home-developers-marquee",
          isDragging && "is-dragging",
        ]
          .filter(Boolean)
          .join(" ")}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        onClickCapture={handleClickCapture}
      >
        <div className="transform-home-developers-track">
          <div className="transform-home-developers-segment">
            {list.map((item) => (
              <div key={item.id} className="transform-home-developers-item">
                <LogoCell item={item} suppressA11y={false} />
              </div>
            ))}
          </div>
          <div className="transform-home-developers-segment" aria-hidden>
            {list.map((item) => (
              <div key={`dup-${item.id}`} className="transform-home-developers-item">
                <LogoCell item={item} suppressA11y />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
