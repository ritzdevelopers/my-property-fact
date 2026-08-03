"use client";

import { FaMapMarkerAlt } from "react-icons/fa";
import "./style/PropertyOverview.css";

const PropertyOverview = ({ property }) => {

    return (
        <div className="container">
            <section
                id="overview-section"
                className="property-overview-card"
            >
                <h2 className="overview-title">
                    About This Property
                </h2>

                <div className="overview-description">
                    <p>{property.description}</p>

                    {property.additionalNotes && (
                        <p>{property.additionalNotes}</p>
                    )}
                </div>

                <div className="overview-address">
                    <FaMapMarkerAlt />
                    <span>
                        <strong>Address:</strong>{" "}
                        {property.title}
                    </span>
                </div>
            </section>
        </div>
    );
};

export default PropertyOverview;