"use client";

import "./style/SimilarPropertiesCard.css";

const SimilarPropertiesCard = ({
  total = 0,
  locality = "",
  onClick,
}) => {
  return (
    <div className="similar-properties-card">

      <h3 className="similar-properties-title">
        Looking for Similar Properties?
      </h3>

      <p className="similar-properties-text">
        We have {total}+ similar properties
        {locality ? ` in ${locality}` : ""} and nearby areas.
      </p>

      <button
        type="button"
        className="similar-properties-btn"
        onClick={onClick}
      >
        View Similar Properties
      </button>

    </div>
  );
};

export default SimilarPropertiesCard;