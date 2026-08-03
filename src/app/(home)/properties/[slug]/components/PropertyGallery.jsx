"use client";

import "./style/PropertyGallery.css";

const PropertyGallery = ({
  images = [],
  propertyTitle = "Property",
  onImageClick,
}) => {
  const openImage = (index) => {
    if (onImageClick) {
      onImageClick(index);
    }
  };

  if (!images.length) {
    return (
      <div className="property-gallery">
        <div className="gallery-empty">
          No Property Images Available
        </div>
      </div>
    );
  }

  return (
    <div className="property-gallery">

      {/* Tabs */}
      <div className="gallery-header">
        <button className="gallery-tab active">
          Property ({images.length})
        </button>
      </div>

      {/* Images */}
      <div
        className={`gallery-grid ${
          images.length === 1
            ? "one-image"
            : images.length === 2
            ? "two-images"
            : "three-images"
        }`}
      >
        {/* Main Image */}
        <div
          className="gallery-item gallery-main"
          onClick={() => openImage(0)}
        >
          <img
            src={images[0]}
            alt={`${propertyTitle} 1`}
          />
        </div>

        {/* Second Image */}
        {images[1] && (
          <div
            className="gallery-item"
            onClick={() => openImage(1)}
          >
            <img
              src={images[1]}
              alt={`${propertyTitle} 2`}
            />
          </div>
        )}

        {/* Third Image */}
        {images[2] && (
          <div
            className="gallery-item gallery-last"
            onClick={() => openImage(2)}
          >
            <img
              src={images[2]}
              alt={`${propertyTitle} 3`}
            />

            <div className="gallery-count">
              📷 {images.length}/{images.length}
            </div>
          </div>
        )}

        {/* When only 1 image */}
        {images.length === 1 && (
          <>
            <div className="gallery-placeholder"></div>
            <div className="gallery-placeholder"></div>
          </>
        )}

        {/* When only 2 images */}
        {images.length === 2 && (
          <div className="gallery-placeholder"></div>
        )}
      </div>
    </div>
  );
};

export default PropertyGallery;