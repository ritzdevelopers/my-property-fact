"use client";

import "./style/PropertyTabs.css";

const tabs = [
    {
        key: "Overview",
        label: "Overview",
        section: "overview-section",
    },
    {
        key: "Property Details",
        label: "Property Details",
        section: "property-details-section",
    },
    {
        key: "Amenities",
        label: "Amenities",
        section: "amenities-section",
    },
    {
        key: "Location",
        label: "Location",
        section: "location-section",
    },
];

const PropertyTabs = ({
    activeTab,
    setActiveTab,
    scrollToSection,
}) => {
    return (
        <div className="container">
            <div className="property-tabs-wrapper">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`property-tab ${activeTab === tab.key ? "active" : ""
                            }`}
                        onClick={() => {
                            setActiveTab(tab.key);
                            scrollToSection(tab.section);
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PropertyTabs;