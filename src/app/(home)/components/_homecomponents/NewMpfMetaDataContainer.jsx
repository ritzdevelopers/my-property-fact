"use client";
import "./newmpfmetadata.css";
import Image from "next/image";
import Link from "next/link";
import HomeRecommendationCards from "./HomeRecommendationCards";

export default function NewMpfMetaDataContainer({
  propertyTypes,
  projects: _projects,
  builders: _builders,
  cities: _cities,
  recommendedProperties = [],
}) {
  const normalizePropertyTypeName = (value = "") => value.trim().toLowerCase();
  const semanticPropertyHeadings = ["Commercial", "New Launches", "Residential"].filter(
    (heading) =>
      propertyTypes?.some((item) => {
        const typeName = normalizePropertyTypeName(item?.projectTypeName);
        if (normalizePropertyTypeName(heading) === "new launches") {
          return typeName === "new launches" || typeName === "new launch";
        }
        return typeName === normalizePropertyTypeName(heading);
      })
  );

  return (
    <div className="mpf-metadata-container container my-5">
      <div className="property-search-card">
        <div className="illustration-left">
          <div className="left-iilution-container">
            <Image
              src="/static/footer/leftillution.png"
              alt="Illustration for Find The Best Property — homes and city search on My Property Fact"
              title="Illustration for Find The Best Property — homes and city search on My Property Fact"
              width={336}
              height={90}
            />
          </div>
        </div>
        <div className="property-search-card-content">
          <h1 className="property-search-title plus-jakarta-sans-semi-bold mt-3 mt-md-0">
            Find The Best Property
          </h1>
          <div className="visually-hidden">
            {semanticPropertyHeadings.map((heading) => (
              <h2 key={heading}>{heading}</h2>
            ))}
          </div>
          <div className="property-buttons-overlay d-flex flex-wrap justify-content-center gap-4 gap-lg-3">
            {propertyTypes &&
              propertyTypes.map((item, index) => (
                <div key={`row-${index}`}>
                  <Link
                    href={`projects/${item.slugUrl}`}
                    className="btn-normal-color rounded-5 py-2 px-3 text-white text-decoration-none z-3 position-relative"
                  >
                    {item.projectTypeName}
                  </Link>
                </div>
              ))}
          </div>
        </div>
        <div className="illustration-right">
          <div className="right-illustration-container">
            <Image
              src="/static/footer/rightillution.png"
              alt="Illustration for Find The Best Property — family and suburban homes on My Property Fact"
              title="Illustration for Find The Best Property — family and suburban homes on My Property Fact"
              width={450}
              height={130}
            />
          </div>
        </div>
      </div>

      <HomeRecommendationCards
        title="Recommended Properties"
        subtitle="Curated property picks for buyers exploring top locations"
        items={recommendedProperties}
        kind="project"
      />
    </div>
  );
}
