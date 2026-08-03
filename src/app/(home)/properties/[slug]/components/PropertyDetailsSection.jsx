"use client";

import "./style/PropertyDetailsSection.css";

const PropertyDetailsSection = ({
    property,
    formatPrice,
    formatPricePerSqft,
}) => {
    const leftDetails = [
        {
            label: "Property Type",
            value: property.listingType
                ? `${property.listingType}${property.subType ? ` - ${property.subType}` : ""}`
                : null,
        },
        {
            label: "Transaction Type",
            value: property.transaction,
        },
        {
            label: "Status",
            value: property.status,
        },
        {
            label: "Occupancy",
            value: property.occupancy,
        },
        {
            label: "Ownership Type",
            value: property.ownershipType,
        },
        {
            label: "Furnishing",
            value: property.furnished,
        },
        {
            label: "Parking",
            value: property.parking,
        },
        {
            label: "Notice Period",
            value:
                property.noticePeriod !== null &&
                    property.noticePeriod !== undefined
                    ? `${property.noticePeriod} ${property.noticePeriod === 1 ? "Month" : "Months"
                    }`
                    : null,
        },
    ];

    const rightDetails = [
        {
            label: "Floor Number",
            value: property.floorNumber
                ? `${property.floorNumber}${property.totalFloors ? ` of ${property.totalFloors}` : ""
                }`
                : null,
        },
        {
            label: "Facing",
            value: property.facing,
        },
        {
            label: "Property Age",
            value:
                property.ageOfConstruction !== null &&
                    property.ageOfConstruction !== undefined
                    ? `${property.ageOfConstruction} to ${property.ageOfConstruction + 1
                    } Year Old`
                    : null,
        },
        {
            label: "Maintenance Charges",
            value: property.maintenanceCharges
                ? formatPrice(property.maintenanceCharges)
                : null,
        },
        {
            label: "Booking Amount",
            value: property.bookingAmount
                ? formatPrice(property.bookingAmount)
                : null,
        },
        {
            label: "Price per Sq.ft",
            value: property.pricePerSqft
                ? formatPricePerSqft(property.pricePerSqft)
                : null,
        },
        {
            label: "Virtual Tour",
            value: property.virtualTour ? (
                <a
                    href={property.virtualTour}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="property-detail-link"
                >
                    View Virtual Tour
                </a>
            ) : null,
        },
    ];

    return (
        <section className="property-details-section">

            <h2 className="property-details-title">
                Property Details
            </h2>

            <div className="property-details-grid">

                <div className="property-details-column">
                    {leftDetails
                        .filter((item) => item.value)
                        .map((item, index) => (
                            <div
                                className="property-detail-card"
                                key={index}
                            >
                                <span className="property-detail-label">
                                    {item.label}:
                                </span>

                                <span className="property-detail-value">
                                    {item.value}
                                </span>
                            </div>
                        ))}
                </div>

                <div className="property-details-grid">
                    {[...leftDetails, ...rightDetails]
                        .filter(item => item.value)
                        .map((item, index) => (
                            <div className="property-detail-card" key={index}>
                                <span className="property-detail-label">
                                    {item.label}:
                                </span>

                                <span className="property-detail-value">
                                    {item.value}
                                </span>
                            </div>
                        ))}
                </div>

            </div>

        </section>
    );
};

export default PropertyDetailsSection;