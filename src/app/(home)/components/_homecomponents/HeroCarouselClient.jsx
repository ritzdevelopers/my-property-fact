"use client";

import dynamic from "next/dynamic";

const HeroBannerSlider = dynamic(() => import("./HeroBannerSlider"), {
  ssr: false,
  loading: () => null,
});

export default function HeroCarouselClient({ slides }) {
  return <HeroBannerSlider slides={slides} />;
}
