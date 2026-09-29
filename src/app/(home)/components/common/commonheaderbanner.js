import Image from "next/image";
import Link from "next/link";
import {
  BANNER_IMAGE_QUALITY,
  BANNER_IMAGE_SIZES,
  resolvePageBannerSrc,
} from "@/lib/optimizedImage";
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

  // if (firstPage) {
  //   const cleanFirstPage = firstPage.replace(/\//g, "");
  //   breadcrumbItems.push({
  //     label: cleanFirstPage.charAt(0).toUpperCase() + cleanFirstPage.slice(1),
  //     href: `/${cleanFirstPage.toLowerCase()}`,
  //   });
  // }

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

  return (
    <div className="container-fluid p-0 position-relative">
      <div className="top-banner-each-pages">
          <Image
            src={bannerSrc}
            alt={bannerImageAlt}
            title={bannerImageAlt}
            fill
            sizes={BANNER_IMAGE_SIZES}
            quality={BANNER_IMAGE_QUALITY}
            priority
            fetchPriority="high"
            className="banner-background-image"
            style={{ objectFit: "cover", objectPosition: "center" }}
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
  );
}
