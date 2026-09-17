/*
  Real Figma exports, downloaded from the asset URLs returned by
  get_design_context for file to28JffFfMbVRJHdRR4C0i, node 1:3, and committed
  under /public/eldeco-terraNSole/ so nothing depends on the ~7-day URL expiry.

  `node` is the Figma node the export came from; `width`/`height` are its
  intrinsic pixel size in the 1440 frame.
*/

const a = (src, node, width, height) => ({ src, node, width, height });

const DIR = "/eldeco-terraNSole";

export const ASSETS = {
  // Section 1 — hero
  hero: a(`${DIR}/hero.png`, "1:4 Rectangle 1", 1440, 775),
  logo: a(`${DIR}/logo.png`, "1:8 image 2", 253, 64),

  // Section 2 — overview
  overview1: a(`${DIR}/overview-1.png`, "1:87 Rectangle 4", 616, 345),
  overview2: a(`${DIR}/overview-2.png`, "1:88 Rectangle 5", 616, 345),

  // Section 3 — key highlights
  highlightsBg: a(`${DIR}/highlights-bg.png`, "1:123 Rectangle 9", 1440, 744),
  highlightImage: a(`${DIR}/highlight-image.png`, "1:128 Vector 3", 399.5, 424.315),
  highlightMask: a(`${DIR}/highlight-mask.svg`, "1:128 Vector 2 mask", 411, 425),
  headlineBrush: a(`${DIR}/headline-brush.svg`, "1:129 Rectangle 11", 283, 35),

  // Section 4 — amenities
  amenityActive: a(`${DIR}/amenity-active.png`, "1:217 active-image", 696, 280),

  // Section 5 — apartment pricing
  pricingBg: a(`${DIR}/pricing-bg.png`, "1:256 section background", 1440, 582),

  // Section 6 — gallery
  galleryMain: a(`${DIR}/gallery-main.png`, "1:300 Rectangle 13", 1097, 494),
  gallerySide: a(`${DIR}/gallery-side.png`, "1:301 Rectangle 14", 226, 494),
  galleryCircle: a(`${DIR}/gallery-circle.svg`, "1:302 Group 1", 102, 102),

  // Section 7 — location
  map: a(`${DIR}/map.png`, "1:306 Rectangle 15", 1440, 401),

  // Section 8 — virtual tour
  videoPoster: a(`${DIR}/video-poster.png`, "1:391 Rectangle 16", 672, 319),
  playBadge: a(`${DIR}/play-badge.png`, "1:392 image 15", 94, 65),

  // Section 10 — footer
  footerBg: a(`${DIR}/footer-bg.png`, "1:393 Rectangle 17", 1440, 500),
  footerLogo: a(`${DIR}/footer-logo.png`, "1:444 image 17", 355, 90),

  // Shared button ornament (Figma "Ellipse 2" / "Ellipse 3")
  pillEllipseGold: a(`${DIR}/pill-ellipse-gold.svg`, "1:96 Ellipse 2", 28.3234, 42),
  pillEllipseLight: a(`${DIR}/pill-ellipse-light.svg`, "1:170 Ellipse 3", 28.3234, 42),
};
