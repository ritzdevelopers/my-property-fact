  import Image from "next/image";
  import dynamic from "next/dynamic";
  import SearchFilter from "./searchFIlter";
  import "../home/home.css";

  const HeroBannerSlider = dynamic(() => import("./HeroBannerSlider"), {
    ssr: true,

    loading: () => (
      <div className="hero-banner-slider hero-lcp-fallback" aria-busy="true">
        <div className="position-relative home-banner hero-banner-responsive-images">
          <div className="hero-banner-frame hero-banner-frame-mobile d-md-none">
            <Image
              src="/static/banners/ghd_mobile_final.jpg"
              alt="GHD Group Velvet Vista — hero home banner"
              title="GHD Group Velvet Vista — hero home banner"
              fill
              className="hero-banner-image"
              priority
              fetchPriority="high"
              quality={60}
              sizes="100vw"
            />
          </div>
          <div className="hero-banner-frame hero-banner-frame-tablet d-none d-md-block d-lg-none">
            <Image
              src="/static/banners/ghd_tablet_final.jpg"
              alt="GHD Group Velvet Vista — hero home banner"
              title="GHD Group Velvet Vista — hero home banner"
              fill
              className="hero-banner-image"
              priority
              fetchPriority="high"
              quality={60}
              sizes="100vw"
            />
          </div>
          <div className="hero-banner-frame hero-banner-frame-desktop d-none d-lg-block">
            <Image
              src="/static/banners/ghd_desktop_final.jpg"
              alt="GHD Group Velvet Vista — hero home banner"
              title="GHD Group Velvet Vista — hero home banner"
              fill
              className="hero-banner-image"
              priority
              fetchPriority="high"
              quality={60}
              sizes="100vw"
            />
          </div>
        </div>
      </div>
    ),
  });

  const FALLBACK_SLIDES = [
    {
      id: "hero-ghd",
      desktop: "/static/banners/ghd_desktop_final.jpg",
      tablet: "/static/banners/ghd_tablet_final.jpg",
      mobile: "/static/banners/ghd_mobile_final.jpg",
      alt: "GHD Group Velvet Vista — hero home banner",
      href: `${process.env.NEXT_PUBLIC_UI_URL || ""}/ghd-velvet-vista`,
    },
    {
      id: "hero-onyx",
      desktop: "/static/banners/MPF-12 Mar-02.jpg",
      tablet: "/static/banners/tablet 1.jpg",
      mobile: "/static/banners/MPF-12 Mar-05.jpg",
      alt: "Exotica 132 — hero home banner",
      href: `${process.env.NEXT_PUBLIC_UI_URL || ""}/splendor-onyx-blue`,
    },
    {
      id: "hero-irish",
      desktop: "/static/banners/Irish_desktop.jpg",
      tablet: "/static/banners/Irish_tablet.jpg",
      mobile: "/static/banners/Irish_mobile.jpg",
      alt: "Irish Platinum — Laying foundation for tomorrow, hero home banner",
      href: `${process.env.NEXT_PUBLIC_UI_URL || ""}/irish-platinum`,
    },
    {
      id: "hero-saya",
      desktop: "/static/banners/new_saya_dekstop.jpg",
      tablet: "/static/banners/saya_tablet.jpg",
      mobile: "/static/banners/new_saya_mobile.jpg",
      alt: "Saya Gold Avenue — Relationships Forever hero home banner",
      href: `${process.env.NEXT_PUBLIC_UI_URL || ""}/saya-gold-avenue`,
    },
    {
      id: "hero-eldeco",
      desktop: "/static/banners/new_eldeco_desktop.jpg",
      tablet: "/static/banners/eldeco_tablet.jpg",
      mobile: "/static/banners/eldeco_phone.jpg",
      alt: "Eldeco 7 Peaks Residences — hero home banner",
      href: `${process.env.NEXT_PUBLIC_UI_URL || ""}/eldeco-7-peaks-residences`,
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
          alt: b.imageAlt || "Hero promotional banner — My Property Fact home",
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
          alt: s.alt || "Hero promotional banner — My Property Fact home",
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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    try {
      const res = await fetch(url, {
        next: { revalidate: 300 },
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });
      if (res.ok) return await res.json();
    } catch (_) {
      // ignore
    } finally {
      clearTimeout(timeout);
    }
    return [];
  }

  export default async function HeroSection({ projectTypeList, cityList }) {
    const banners = await fetchHomeBanners();
    const imageBaseUrl = getImageBaseUrl();
    const apiSlides = transformBannersToSlides(banners, imageBaseUrl);
    const heroSlides = apiSlides.length > 0 ? apiSlides : FALLBACK_SLIDES;

    return (
      <>
        <div className="position-relative hero-section-wrapper">
          <div className="mpf-hero-banner position-relative">
            <div className="position-relative">
              <HeroBannerSlider slides={heroSlides} />
            </div>

            <SearchFilter projectTypeList={projectTypeList} cityList={cityList} />
          </div>
        </div>
      </>
    );
  }
