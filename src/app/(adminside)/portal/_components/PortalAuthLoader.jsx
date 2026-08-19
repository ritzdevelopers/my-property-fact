"use client";

import { useEffect, useState } from "react";
import "./PortalAuthLoader.css";

const REAL_ESTATE_IMAGES = [
  { src: "/static/broker-portal/post-property-hero.png", alt: "Property portal" },
  { src: "/static/broker-portal/dashboard/empty-city.png", alt: "Property search" },
  { src: "/static/banners/building.svg", alt: "Buildings" },
  { src: "/static/banners/NoidaBuilding2.svg", alt: "City skyline" },
  { src: "/static/banners/NoidaBuilding3.svg", alt: "Residential towers" },
  { src: "/logo.webp", alt: "My Property Fact" },
];

export default function PortalAuthLoader({ message = "Loading your dashboard…" }) {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % REAL_ESTATE_IMAGES.length);
        setFading(false);
      }, 200);
    }, 1600);
    return () => clearInterval(timer);
  }, []);

  const current = REAL_ESTATE_IMAGES[index];

  return (
    <div className="portal-auth-loader" role="status" aria-live="polite" aria-busy="true">
      <div className="portal-auth-loader__card">
        <div className={`portal-auth-loader__thumb${fading ? " is-fading" : ""}`}>
          <img src={current.src} alt={current.alt} />
        </div>
        <div className="portal-auth-loader__spinner" aria-hidden="true" />
        <p className="portal-auth-loader__text">{message}</p>
      </div>
    </div>
  );
}
