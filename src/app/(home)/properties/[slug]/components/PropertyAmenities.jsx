"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheck,
    faChevronDown,
    faChevronUp,
} from "@fortawesome/free-solid-svg-icons";

import "./style/PropertyAmenities.css";

const PropertyAmenities = ({
    property,
    getPropertyAmenities,
    getAmenityImageUrl,
}) => {
    const [showAll, setShowAll] = useState(false);

    const amenities = useMemo(() => {
        const apiAmenities = getPropertyAmenities();

        if (apiAmenities.length > 0) {
            return apiAmenities.map((item, index) => ({
                id: item.id || index,
                title: item.title,
                image: item.amenityImageUrl
                    ? getAmenityImageUrl(item.amenityImageUrl)
                    : null,
            }));
        }

        return (property?.amenityNames || []).map((name, index) => ({
            id: index,
            title: name,
            image: null,
        }));
    }, [property, getPropertyAmenities, getAmenityImageUrl]);

    if (!amenities.length) return null;

    const displayedAmenities = showAll
        ? amenities
        : amenities.slice(0, 4);

    return (
        <section
            id="amenities-section"
            className="property-amenities-section"
        >
            <div className="property-amenities-header">

                <div>
                    <h2 className="property-amenities-title">
                        Amenities
                    </h2>

                    <p className="property-amenities-subtitle">
                        {amenities.length} Amenities
                    </p>
                </div>

            </div>

            <div className="property-amenities-grid">

                {displayedAmenities.map((amenity) => (
                    <div
                        className="property-amenity-card"
                        key={amenity.id}
                    >
                        <div className="property-amenity-icon-box">
                            {amenity.image ? (
                                <img
                                    src={amenity.image}
                                    alt={amenity.title}
                                    className="property-amenity-image"
                                />
                            ) : (
                                <FontAwesomeIcon icon={faCheck} />
                            )}
                        </div>

                        <div className="property-amenity-content">
                            <h5 className="property-amenity-title">
                                {amenity.title}
                            </h5>
                        </div>
                    </div>
                ))}

            </div>

            {amenities.length > 4 && (
                <div className="property-amenities-footer">

                    <button
                        className="property-view-more-btn"
                        type="button"
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? (
                            <>
                                Show Less
                                <FontAwesomeIcon icon={faChevronUp} />
                            </>
                        ) : (
                            <>
                                View All Amenities ({amenities.length})
                                <FontAwesomeIcon icon={faChevronDown} />
                            </>
                        )}
                    </button>

                </div>
            )}

        </section>
    );
};

export default PropertyAmenities;