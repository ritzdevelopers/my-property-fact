"use client";

import "./style/PropertyHighlightsCard.css";

const PropertyHighlightsCard = ({ highlights = [] }) => {
  if (!highlights.length) return null;

  return (
    <div className="property-highlights-card">
      <h3 className="property-highlights-title">
        Property Highlights
      </h3>

      <ul className="property-highlights-list">
        {highlights.map((item, index) => (
          <li key={index}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PropertyHighlightsCard;