import { getImageProps } from "next/image";
import Link from "next/link";
import SearchFilter from "./searchFIlter";
import "../home/home.css";

export default function HeroSection({ projectTypeList, cityList }) {
  const common = {
    alt: "GHD Group Velvet Vista — hero home banner",
    title: "GHD Group Velvet Vista — hero home banner",
    fill: true,
    priority: true,
    fetchPriority: "high",
    className: "hero-banner-image",
    sizes: "100vw",
  };

  const {
    props: { srcSet: desktop },
  } = getImageProps({ ...common, src: "/static/banners/ghd_desktop_final.jpg" });

  const {
    props: { srcSet: tablet },
  } = getImageProps({ ...common, src: "/static/banners/ghd_tablet_final.jpg" });

  const {
    props: { srcSet: mobile, ...rest },
  } = getImageProps({ ...common, src: "/static/banners/ghd_mobile_final.jpg" });

  return (
    <>
      <div className="position-relative hero-section-wrapper">
        <div className="mpf-hero-banner position-relative">
          <div className="position-relative">
            <div className="hero-banner-slider hero-lcp-fallback">
              <Link href="/ghd-velvet-vista" className="position-relative home-banner hero-banner-responsive-images d-block hero-art-direction">
                <picture>
                  <source media="(min-width: 992px)" srcSet={desktop} />
                  <source media="(min-width: 768px)" srcSet={tablet} />
                  <img
                    {...rest}
                    loading="eager"
                    fetchPriority="high"
                    decoding="sync"
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  />
                </picture>
              </Link>
            </div>
          </div>

          <SearchFilter projectTypeList={projectTypeList} cityList={cityList} />
        </div>
      </div>
    </>
  );
}
