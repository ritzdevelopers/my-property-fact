import Link from "next/link";
import {
  BANNER_IMAGE_QUALITY,
  BANNER_IMAGE_SIZES,
  DEFAULT_PAGE_BANNER,
  getOptimizedImageProps,
  resolvePageBannerSrc,
} from "@/lib/optimizedImage";
import PageBannerLcpPreload from "./PageBannerLcpPreload";
import "./common.css";

function resolveBannerHeadingText(headerText, pageName) {
  const h = headerText != null ? String(headerText).trim() : "";
  if (h) return h;
  const p = pageName != null ? String(pageName).trim() : "";
  if (p) return p;
  return "My Property Fact";
}

export default function CommonHeaderBanner({
  image,
  headerText,
  firstPage,
  pageName,
  useH1 = true,
}) {
  const breadcrumbItems = [{ label: "Home", href: "/" }];

  if (firstPage) {
    const cleanFirstPage = firstPage.replace(/\//g, "");
    breadcrumbItems.push({
      label: cleanFirstPage.charAt(0).toUpperCase() + cleanFirstPage.slice(1),
      href: `/${cleanFirstPage.toLowerCase()}`,
    });
  }

  if (pageName) {
    const cleanPageName = pageName.replace(/\//g, "");
    breadcrumbItems.push({
      label: cleanPageName,
      href: null,
    });
  }

  const bannerImageAlt =
    headerText && String(headerText).trim()
      ? `${String(headerText).trim()} — My Property Fact page banner`
      : "My Property Fact — real estate page banner";

  const bannerSrc = resolvePageBannerSrc(image);
  const {
    src: optimizedSrc,
    srcSet,
    sizes,
    ...imgRest
  } = getOptimizedImageProps({
    src: bannerSrc,
    width: DEFAULT_PAGE_BANNER.width,
    height: DEFAULT_PAGE_BANNER.height,
    alt: bannerImageAlt,
    sizes: BANNER_IMAGE_SIZES,
    quality: BANNER_IMAGE_QUALITY,
  });

  return (
    <>
      <PageBannerLcpPreload image={image} />
      <div className="container-fluid p-0 position-relative">
        <div className="top-banner-each-pages">
          <img
            {...imgRest}
            src={optimizedSrc}
            srcSet={srcSet}
            sizes={sizes}
            alt={bannerImageAlt}
            title={bannerImageAlt}
            className="banner-background-image"
            width={DEFAULT_PAGE_BANNER.width}
            height={DEFAULT_PAGE_BANNER.height}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <div className="banner-overlay"></div>

          <div className="banner-content">
            {headerText === "Blog-Detail" || !useH1 ? (
              <p className="projects-heading fw-bold">
                {resolveBannerHeadingText(headerText, pageName)}
              </p>
            ) : (
              <h1 id="mpf-page-heading" className="projects-heading fw-bold">
                {resolveBannerHeadingText(headerText, pageName)}
              </h1>
            )}

            {(firstPage || pageName) && (
              <nav className="banner-breadcrumb" aria-label="Breadcrumb">
                <ol className="breadcrumb-list">
                  {breadcrumbItems.map((item, index) => (
                    <li key={index} className="breadcrumb-item">
                      {item.href ? (
                        <Link href={item.href} className="breadcrumb-link" title={item.label}>
                          {item.label}
                        </Link>
                      ) : (
                        <span className="breadcrumb-current">{item.label}</span>
                      )}
                      {index < breadcrumbItems.length - 1 && (
                        <span className="breadcrumb-separator"> &gt; </span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
