import Image from "next/image";
// import dynamic from "next/dynamic";
import SearchFilter from "./searchFIlter";
import "../home/home.css";

/* --- SLIDER CODE (commented for Holi static banner) ---
const HeroBannerSlider = dynamic(() => import("./HeroBannerSlider"), {
  ssr: true,
  loading: () => (
    <div className="hero-banner-slider hero-lcp-fallback" aria-busy="true">
      <div className="position-relative home-banner hero-banner-responsive-images">
        <Image
          src="/static/banners/Irish_phone.jpg"
          alt="Irish - Laying Foundation For Tomorrow"
          width={768}
          height={430}
          className="img-fluid w-100 d-md-none"
          priority
          fetchPriority="high"
          quality={75}
          sizes="100vw"
        />
        <Image
          src="/static/banners/Irish_tablet.jpg"
          alt="Irish - Laying Foundation For Tomorrow"
          width={1024}
          height={576}
          className="img-fluid w-100 d-none d-md-block d-lg-none"
          priority
          fetchPriority="high"
          quality={75}
          sizes="100vw"
        />
        <Image
          src="/static/banners/Irish_desktop.jpg"
          alt="Irish - Laying Foundation For Tomorrow"
          width={1920}
          height={600}
          className="img-fluid w-100 d-none d-lg-block"
          priority
          fetchPriority="high"
          quality={75}
          sizes="100vw"
        />
      </div>
    </div>
  ),
});

const FALLBACK_SLIDES = [
  {
    id: "hero-irish",
    desktop: "/static/banners/Irish_desktop.jpg",
    tablet: "/static/banners/Irish_tablet.jpg",
    mobile: "/static/banners/Irish_phone.jpg",
    alt: "Irish - Laying Foundation For Tomorrow",
    href: `${process.env.NEXT_PUBLIC_UI_URL || ""}/irish-platinum`,
  },
  {
    id: "hero-eldeco",
    desktop: "/static/banners/new_eldeco_desktop.jpg",
    tablet: "/static/banners/eldeco_tablet.jpg",
    mobile: "/static/banners/eldeco_phone.jpg",
    alt: "Eldeco",
    href: `${process.env.NEXT_PUBLIC_UI_URL || ""}/eldeco-7-peaks-residences`,
  },
  {
    id: "hero-ghd",
    desktop: "/static/banners/ghd_laptop.jpg",
    tablet: "/static/banners/ghd_tablet.jpg",
    mobile: "/static/banners/ghd_phone.jpg",
    alt: "GHD Group - Velvet Vista",
    href: `${process.env.NEXT_PUBLIC_UI_URL || ""}/ghd-velvet-vista`,
  },
  {
    id: "hero-saya",
    desktop: "/static/banners/new_saya_dekstop.jpg",
    tablet: "/static/banners/saya_tablet.jpg",
    mobile: "/static/banners/new_saya_mobile.jpg",
    alt: "Saya - Relationships Forever",
    href: `${process.env.NEXT_PUBLIC_UI_URL || ""}/saya-gold-avenue`,
  },
];

function getImageBaseUrl() {
  const base = (process.env.NEXT_PUBLIC_IMAGE_URL || "").trim().replace(/\/?$/, "");
  return base ? `${base}/home-banners` : "";
}

function getHomeBannersApiUrl() {
  const base = (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/?$/, "");
  return base ? `${base}/home-banner/all` : "";
}

function transformBannersToSlides(banners, imageBaseUrl) {
  if (!Array.isArray(banners) || banners.length === 0 || !imageBaseUrl) return [];
  const imageUrl = (name) => (name ? `${imageBaseUrl}/${name}` : null);
  const byLink = new Map();
  for (const b of banners) {
    const key =
      b.bannerLink != null && String(b.bannerLink).trim() !== ""
        ? String(b.bannerLink).trim()
        : "__no_link";
    if (!byLink.has(key)) {
      byLink.set(key, {
        id: b.id,
        desktop: null,
        tablet: null,
        mobile: null,
        alt: b.imageAlt || "Hero banner",
        link: b.bannerLink || null,
      });
    }
    const slide = byLink.get(key);
    const src = imageUrl(b.imageName);
    if (b.deviceType === "desktop") slide.desktop = src;
    else if (b.deviceType === "tablet") slide.tablet = src;
    else if (b.deviceType === "mobile") slide.mobile = src;
    if (b.imageAlt && !slide.alt) slide.alt = b.imageAlt;
  }
  const slides = [];
  let slideIndex = 0;
  for (const [key, s] of byLink) {
    const desktop = s.desktop || s.tablet || s.mobile || "/mpf-banner.jpg";
    const tablet = s.tablet || s.desktop || s.mobile || "/mpf-banner.jpg";
    const mobile = s.mobile || s.tablet || s.desktop || "/mpf-banner.jpg";
    if (s.desktop || s.tablet || s.mobile) {
      slides.push({
        id: key === "__no_link" ? `hero-slide-${slideIndex}` : `hero-${s.id}`,
        desktop,
        tablet,
        mobile,
        alt: s.alt || "Hero banner",
        link: s.link,
        href: s.link,
      });
      slideIndex += 1;
    }
  }
  return slides;
}

async function fetchHomeBanners() {
  const url = getHomeBannersApiUrl();
  if (!url) return [];
  try {
    const res = await fetch(url, { cache: "no-store", headers: { "Content-Type": "application/json" } });
    if (res.ok) return await res.json();
  } catch (_) {
    // ignore
  }
  return [];
}
--- END SLIDER CODE ---
*/

/** Static Holi banner - for Holi purpose only. Tablet & desktop use the same wide image. */
const HOLI_BANNER = {
  mobile: "/static/banners/Happy-Holi-MPF-mobile.png",
  tablet: "/static/banners/Happy-Holi-MPF.png", 
  desktop: "/static/banners/Happy-Holi-MPF.png",
  alt: "Happy Holi - My Property Fact",
};

export default async function HeroSection({ projectTypeList, cityList }) {
  return (
    <>
      <div className="position-relative hero-section-wrapper">
        <div className="mpf-hero-banner position-relative">
          <div className="position-relative">
            {/* Static Holi banner - no API fetch, no slider */}
            <div className="hero-banner-slider hero-lcp-fallback">
              <div className="position-relative home-banner hero-banner-responsive-images">
                <Image
                  src={HOLI_BANNER.mobile}
                  alt={HOLI_BANNER.alt}
                  width={768}
                  height={430}
                  className="img-fluid w-100 d-md-none"
                  priority
                  fetchPriority="high"
                  quality={100}
                  sizes="100vw"
                />
                <Image
                  src={HOLI_BANNER.tablet}
                  alt={HOLI_BANNER.alt}
                  width={1024}
                  height={576}
                  className="img-fluid w-100 d-none d-md-block d-lg-none"
                  priority
                  fetchPriority="high"
                  quality={100}
               
                />
                <Image
                  src={HOLI_BANNER.desktop}
                  alt={HOLI_BANNER.alt}
                  width={1920}
                  height={600}
                  className="img-fluid w-100 d-none d-lg-block"
                  priority
                  fetchPriority="high"
                
   
                />
              </div>
            </div>
            {/* Republic day emblem component on hero section*/}
            {/* <div className="hero-center-emblem">
              <Image
                src="/static/banners/ch.svg"
                alt="Republic Day emblem"
                width={280}
                height={280}
                priority
              />
            </div> */}
          </div>

          {/* Search filter component  */}
          <SearchFilter projectTypeList={projectTypeList} cityList={cityList} />
        </div>
      </div>
    </>
  );
}
