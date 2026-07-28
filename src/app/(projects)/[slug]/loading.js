import "./propertyV3.css";

/** Visible hero-sized placeholder so mobile Lighthouse records LCP while data loads. */
export default function LoadingProperty() {
  return (
    <div className="pd3-root pd3-loading-shell" aria-busy="true" aria-label="Loading project">
      <div className="pd3-loading-topbar" />
      <div className="pd3-container">
        <div className="pd3-hero-collage pd3-hero-collage--loading">
          <div className="pd3-hero-tile pd3-hero-tile--primary pd3-hero-tile--skeleton" />
          <div className="pd3-hero-side">
            <div className="pd3-hero-tile pd3-hero-tile--side pd3-hero-tile--skeleton" />
            <div className="pd3-hero-tile pd3-hero-tile--side pd3-hero-tile--skeleton" />
          </div>
        </div>
        <div className="pd3-summary pd3-summary--skeleton">
          <div className="pd3-skeleton-line pd3-skeleton-line--title" />
          <div className="pd3-skeleton-line pd3-skeleton-line--sub" />
        </div>
      </div>
    </div>
  );
}
