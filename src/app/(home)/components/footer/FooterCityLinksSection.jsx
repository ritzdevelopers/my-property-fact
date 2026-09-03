"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSiteData } from "@/app/_global_components/contexts/SiteDataContext";

const DELHI_NCR_CITY_NAMES = [
  "Delhi",
  "Noida",
  "Gurugram",
  "Faridabad",
  "Ghaziabad",
  "Greater Noida",
  "Noida Extension",
  "Sonipat",
];

const COMMERCIAL_HIDDEN_CITY_NAMES = [
  "Agra",
  "Bareilly",
  "Chennai",
  "Dehradun",
  "Kochi",
  "Thiruvananthapuram",
  "Vrindavan",
  "Sonipat",
  "Panipat",
  "Karnal",
  "Meerut",
];

const APARTMENTS_HIDDEN_CITY_NAMES = ["Karnal"];

const SCROLL_HINT_MIN_CITIES = 4;

function generateSlug(prefix) {
  return `/${prefix.replace(/ /g, "-").toLowerCase().trim()}`;
}

function sortCitiesDelhiNCRFirst(cities) {
  if (!Array.isArray(cities) || cities.length === 0) return cities;
  const ncrSet = new Set(DELHI_NCR_CITY_NAMES.map((n) => n.toLowerCase().trim()));
  return [...cities].sort((a, b) => {
    const aName = (a?.cityName || "").trim();
    const bName = (b?.cityName || "").trim();
    const aNCR = ncrSet.has(aName.toLowerCase());
    const bNCR = ncrSet.has(bName.toLowerCase());
    if (aNCR && !bNCR) return -1;
    if (!aNCR && bNCR) return 1;
    if (aNCR && bNCR) {
      const aIdx = DELHI_NCR_CITY_NAMES.findIndex((n) => n.toLowerCase() === aName.toLowerCase());
      const bIdx = DELHI_NCR_CITY_NAMES.findIndex((n) => n.toLowerCase() === bName.toLowerCase());
      return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
    }
    return aName.localeCompare(bName);
  });
}

function renderCityList(cities, category, prefix, generateSlugFn) {
  const useScroll = cities.length >= SCROLL_HINT_MIN_CITIES;

  return (
    <div className="footer-new-links-body">
      <div className={useScroll ? "footer-new-links-scroll" : "footer-new-links-static"}>
        <ul className="footer-new-links">
          {cities.map((city, index) => (
            <li key={`${category}-${city.id || index}`}>
              <Link
                href={`${generateSlugFn(prefix)}${city.slugURL}`}
                prefetch={false}
                className="footer-new-link"
                title={`${prefix}${city.cityName}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {prefix}
                {city.cityName}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {useScroll && (
        <div
          className="footer-scroll-hint"
          role="status"
          aria-label="Scroll the list above to view more links"
        >
          <span className="footer-scroll-hint__pulse" aria-hidden>
            <span className="footer-scroll-hint__pulse-dot" />
          </span>
          <span className="footer-scroll-hint__text">Scroll to view more</span>
        </div>
      )}
    </div>
  );
}

export default function FooterCityLinksSection({ cityList: cityListProp, className = "" }) {
  const { cityList: contextCityList = [] } = useSiteData();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const safeCityList = useMemo(() => {
    if (Array.isArray(cityListProp)) return cityListProp;
    if (isMounted && Array.isArray(contextCityList)) return contextCityList;
    return [];
  }, [cityListProp, contextCityList, isMounted]);

  const apartmentsCities = useMemo(
    () =>
      sortCitiesDelhiNCRFirst(
        safeCityList.filter(
          (item) =>
            item?.cityName && !APARTMENTS_HIDDEN_CITY_NAMES.includes(item.cityName),
        ),
      ),
    [safeCityList],
  );

  const newProjectsCities = useMemo(
    () =>
      sortCitiesDelhiNCRFirst(
        safeCityList.filter((item) => item?.cityName && !["Agra"].includes(item.cityName)),
      ),
    [safeCityList],
  );

  const flatsCities = useMemo(
    () => sortCitiesDelhiNCRFirst(safeCityList),
    [safeCityList],
  );

  const commercialCities = useMemo(
    () =>
      sortCitiesDelhiNCRFirst(
        safeCityList.filter(
          (item) =>
            item?.cityName && !COMMERCIAL_HIDDEN_CITY_NAMES.includes(item.cityName),
        ),
      ),
    [safeCityList],
  );

  if (!safeCityList.length) return null;

  return (
    <div className={`container footer-city-links-section ${className}`.trim()}>
      <div className="footer-bottom-column">
        <div className="footer-new-heading">Apartments in India</div>
        {renderCityList(apartmentsCities, "apartments", "Apartments in ", generateSlug)}
      </div>
      <div className="footer-bottom-column">
        <div className="footer-new-heading">New Projects in India</div>
        {renderCityList(newProjectsCities, "newProjects", "New Projects in ", generateSlug)}
      </div>
      <div className="footer-bottom-column">
        <div className="footer-new-heading">Commercial Property in India</div>
        {renderCityList(commercialCities, "commercial", "Commercial Property in ", generateSlug)}
      </div>
      <div className="footer-bottom-column">
        <div className="footer-new-heading">Flats in India</div>
        {renderCityList(flatsCities, "flats", "Flats in ", generateSlug)}
      </div>
    </div>
  );
}
