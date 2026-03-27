import Image from "next/image";
import Link from "next/link";
import './common.css';

export default function CommonHeaderBanner({ image, headerText, firstPage, pageName }) {
  // Build breadcrumb path
  const breadcrumbItems = [
    { label: "Home", href: "/" }
  ];
  
  if (firstPage) {
    // Remove any forward slashes from the label
    const cleanFirstPage = firstPage.replace(/\//g, '');
    breadcrumbItems.push({
      label: cleanFirstPage.charAt(0).toUpperCase() + cleanFirstPage.slice(1),
      href: `/${cleanFirstPage.toLowerCase()}`
    });
  }
  
  if (pageName) {
    // Remove any forward slashes from the label
    const cleanPageName = pageName.replace(/\//g, '');
    breadcrumbItems.push({
      label: cleanPageName,
      href: null // Current page, no link
    });
  }

  const bannerImageAlt =
    headerText && String(headerText).trim()
      ? `${String(headerText).trim()} — My Property Fact page banner`
      : "My Property Fact — real estate page banner";

  return (
    <div className="container-fluid p-0 position-relative">
      <div className="top-banner-each-pages">
        <Image
          src={`/static/realestate-bg.jpg`}
          // src={`/static/${image}`}
          fill
          alt={bannerImageAlt}
          title={bannerImageAlt}
          className="banner-background-image"
          sizes="100vw"
          priority
        />
        {/* Dark Overlay */}
        <div className="banner-overlay"></div>
        
        {/* Snow Effect */}
        {/* <SnowEffect /> */}
        {/* <NewYearEffect /> */}
        
        {/* Content Container */}
        <div className="banner-content">
          {headerText === 'Blog-Detail' ? (
            <p className="projects-heading fw-bold">{headerText}</p>
          ) : (
            <h1 className="projects-heading fw-bold">{headerText}</h1>
          )}
          
          {/* Breadcrumb Navigation */}
          {(firstPage || pageName) && (
            <nav className="banner-breadcrumb" aria-label="Breadcrumb">
              <ol className="breadcrumb-list">
                {breadcrumbItems.map((item, index) => (
                  <li key={index} className="breadcrumb-item">
                    {item.href ? (
                      <Link href={item.href} className="breadcrumb-link">
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
