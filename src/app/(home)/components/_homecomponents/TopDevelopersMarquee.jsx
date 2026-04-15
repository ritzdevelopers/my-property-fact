"use client";

import Image from "next/image";
import Link from "next/link";
import "../home/home.css";

function LogoCell({ item, suppressA11y }) {
  const alt = suppressA11y ? "" : `${item.name} — developer logo`;
  const img = (
    <Image
      src={item.src}
      alt={alt}
      width={176}
      height={56}
      className="transform-home-developers-logo"
      sizes="(max-width: 576px) 140px, 176px"
    />
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className="transform-home-developers-link"
        title={item.name}
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
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const list = items.filter((i) => i?.src);
  if (list.length === 0) return null;

  return (
    <div className="transform-home-developers" aria-label="Top developers">
      <div className="transform-home-developers-label" aria-hidden>
        <span className="transform-home-developers-label-line">Top</span>
        <span className="transform-home-developers-label-line">Developers</span>
      </div>
      <div className="transform-home-developers-divider" aria-hidden />
      <div className="transform-home-developers-marquee">
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
