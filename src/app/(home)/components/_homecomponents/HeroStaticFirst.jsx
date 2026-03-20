import Image from "next/image";
import Link from "next/link";

export default function HeroStaticFirst({ slide }) {
  if (!slide) return null;

  const desktopSrc = slide.desktop || slide.tablet || slide.mobile || "/mpf-banner.jpg";
  const tabletSrc = slide.tablet || slide.desktop || slide.mobile || desktopSrc;
  const mobileSrc = slide.mobile || slide.tablet || slide.desktop || desktopSrc;
  const alt = slide.alt || "Hero banner";
  const navigationLink = slide.link || slide.href;

  const inner = (
    <div className="home-banner hero-banner-responsive-images">
      <div className="hero-banner-frame hero-banner-frame-mobile d-md-none">
        <Image
          src={mobileSrc}
          alt={alt}
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
          src={tabletSrc}
          alt={alt}
          fill
          className="hero-banner-image"
          loading="lazy"
          quality={60}
          sizes="100vw"
        />
      </div>
      <div className="hero-banner-frame hero-banner-frame-desktop d-none d-lg-block">
        <Image
          src={desktopSrc}
          alt={alt}
          fill
          className="hero-banner-image"
          loading="lazy"
          quality={60}
          sizes="100vw"
        />
      </div>
    </div>
  );

  return (
    <div className="hero-static-lcp">
      {navigationLink ? (
        <Link href={navigationLink} className="d-block text-decoration-none">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </div>
  );
}
