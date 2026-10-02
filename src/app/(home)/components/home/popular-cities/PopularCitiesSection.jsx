"use client";

import Link from "next/link";
import { useDeferredStylesheet } from "@/lib/useDeferredStylesheet";
import {
  buildHomeCardImageProps,
  HOME_CITY_PILL_SIZES,
} from "@/lib/optimizedImage";

/* Row 1 marquee starts with Agra; row 2 uses the same list in reverse */
const cities = [
  { name: "Agra", link: "/city/agra", image: "/dream-cities/pills/agra_pill.webp" },
  { name: "Delhi", link: "/city/delhi", image: "/dream-cities/pills/delhi_pill.webp" },
  { name: "Noida", link: "/city/noida", image: "/dream-cities/pills/noida_pill.webp" },
  { name: "Ghaziabad", link: "/city/ghaziabad", image: "/dream-cities/pills/ghaziabad_pill.webp" },
  { name: "Gurugram", link: "/city/gurugram", image: "/dream-cities/pills/gurugram_pill.webp" },
  { name: "Bangalore", link: "/city/bangalore", image: "/dream-cities/pills/bangalore_pill.webp" },
  { name: "Jaipur", link: "/city/jaipur", image: "/dream-cities/pills/jaipur_pill.webp" },
  { name: "Mumbai", link: "/city/mumbai", image: "/dream-cities/pills/mumbai_pill.webp" },
];

const CITY_PILL_W = 48;
const CITY_PILL_H = 48;

function getRowCities(rowIndex) {
  /** One row forward, one reverse; double the sequence so each strip is long enough to fill very wide viewports. */
  const doubled = [...cities, ...cities];
  if (rowIndex === 0) {
    return doubled;
  }
  return [...doubled].reverse();
}

function CityStrip({ list, idPrefix, ariaHidden = false }) {
  return (
    <div className="pc__group" aria-hidden={ariaHidden} role={ariaHidden ? "none" : undefined}>
      {list.map((city, cityIndex) => {
        const pillAlt = `${city.name} — city image on My Property Fact`;
        const iconProps = buildHomeCardImageProps({
          src: city.image,
          width: CITY_PILL_W,
          height: CITY_PILL_H,
          alt: pillAlt,
          sizes: HOME_CITY_PILL_SIZES,
          quality: 40,
        });
        return (
          <Link
            key={`${idPrefix}-${city.name}-${cityIndex}`}
            href={city.link}
            prefetch={false}
            className="pc__pill"
            title={`Explore properties in ${city.name}`}
            tabIndex={ariaHidden ? -1 : undefined}
          >
            <span className="pc__pill-icon" aria-hidden>
              <img
                {...iconProps}
                className="pc__pill-img"
                width={22}
                height={22}
                loading={ariaHidden ? "lazy" : iconProps.loading}
                fetchPriority={ariaHidden ? "low" : iconProps.fetchPriority}
              />
            </span>
            <span className="pc__pill-text">{city.name}</span>
          </Link>
        );
      })}
    </div>
  );
}

function MarqueeRow({ rowIndex }) {
  const list = getRowCities(rowIndex);
  const reverse = rowIndex % 2 === 1;
  const rowClass = [
    "pc__row",
    reverse ? "pc__row--reverse" : "pc__row--forward",
    `pc__row--s${(rowIndex % 2) + 1}`,
  ].join(" ");

  return (
    <div className={rowClass}>
      <div className="pc__marquee" aria-label={`Popular cities, row ${rowIndex + 1} of 2`}>
        <div className="pc__track">
          <CityStrip list={list} idPrefix={`r${rowIndex}-a`} />
          <CityStrip list={list} idPrefix={`r${rowIndex}-b`} ariaHidden />
          <CityStrip list={list} idPrefix={`r${rowIndex}-c`} ariaHidden />
        </div>
      </div>
    </div>
  );
}

export default function PopularCitiesSection() {
  useDeferredStylesheet(() => import("./PopularCitiesSection.css"));

  return (
    <section className="popular-cities-section" aria-labelledby="popular-cities-heading">
      <div className="pc__head-wrap">
        <div className="pc__head-inner">
 
          <div className="pc__head-title-block">
            <h2
              id="popular-cities-heading"
              className="pc__title plus-jakarta-sans-semi-bold"
            >
              Popular Cities
            </h2>
            <p className="pc__lede">Explore top markets we cover tap a city to see listings &amp; trends.</p>
            <div className="pc__ghost" aria-hidden>
              India
            </div>
          </div>
        </div>
      </div>

      <div className="pc__marquees">
        {[0, 1].map((i) => (
          <MarqueeRow key={i} rowIndex={i} />
        ))}
      </div>
      <div className="pc__head-top" style={{marginTop: "20px"}}>
            {/* <span className="pc__kicker">Cities</span> */}
            <Link
              href="/projects"
              className="pc__cta"
              title="Browse all real estate projects on My Property Fact"
            >
              Explore more
            </Link>
          </div>
    </section>
  );
}
