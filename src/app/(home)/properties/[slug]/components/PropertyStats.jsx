"use client";

import "./style/PropertyStats.css";

const PropertyStats = ({ property, formatArea }) => {
    const areaValue =
        property?.plotArea ||
        property?.superBuiltUpArea ||
        property?.builtUpArea ||
        property?.carpetArea;

    const areaUnit =
        property?.plotAreaUnit ||
        property?.superBuiltUpAreaUnit ||
        property?.builtUpAreaUnit ||
        property?.carpetAreaUnit ||
        "Sq Ft";

    const stats = [
        {
            value: property?.bedrooms || 0,
            label: "Bedrooms",
        },
        {
            value: property?.bathrooms || 0,
            label: "Bathrooms",
        },
        {
            value: areaValue,
            label: "Sq Ft",
            isArea: true,
        },
        {
            value: property?.balconies || 0,
            label: "Balconies",
        },
    ];

    return (
        <div className="container">
            <div className="property-stats">
                {stats.map((item, index) => (
                    <div className="property-stat-card" key={index}>
                        {item.isArea ? (
                            <h2 className="area-value">
                                {item.value}
                                <span className="area-unit">
                                    {" "}
                                    {item.unit}
                                </span>
                            </h2>
                        ) : (
                            <h2>{item.value}</h2>
                        )}

                        <p>{item.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PropertyStats;