"use client";

import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

import "./style/PropertyFeatures.css";

const PropertyFeatures = ({
    property,
    getPropertyFeatures,
    getFeatureImageUrl,
}) => {
    const features = useMemo(() => {
        const apiFeatures = getPropertyFeatures();

        if (apiFeatures.length > 0) {
            return apiFeatures.map((item, index) => ({
                id: item.id || index,
                title: item.title,
                image: item.iconImageUrl
                    ? getFeatureImageUrl(item.iconImageUrl)
                    : null,
                available: true,
            }));
        }

        return (property?.featureNames || []).map((name, index) => ({
            id: index,
            title: name,
            image: null,
            available: true,
        }));
    }, [property, getPropertyFeatures, getFeatureImageUrl]);

    if (!features.length) return null;

    return (
        <section className="property-features-section">

            <div className="property-features-header">

                <h2 className="property-features-title">
                    {property?.furnishingStatus || "Residential Features"}
                </h2>

                <p className="property-features-subtitle">
                    Furnishing Details
                </p>

            </div>

            <div className="property-features-grid">

                {features.map((feature) => (

                    <div
                        key={feature.id}
                        className={`property-feature-card ${feature.available ? "" : "disabled"
                            }`}
                    >
                        <div className="property-feature-icon">

                            {feature.image ? (
                                <img
                                    src={feature.image}
                                    alt={feature.title}
                                    className="property-feature-image"
                                />
                            ) : (
                                <FontAwesomeIcon icon={faCheck} />
                            )}

                        </div>

                        <div className="property-feature-content">

                            <div className="property-feature-value">
                                {feature.value || ""}
                            </div>

                            <div className="property-feature-title">
                                {feature.title}
                            </div>

                        </div>
                    </div>

                ))}

            </div>

        </section>
    );
};

export default PropertyFeatures;