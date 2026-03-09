import "./newinsight.css";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function NewInsight() {
  // Defining insights data
  const insights = [
    {
      id: 1,
      heading: "EMI Calculator",
      sub_heading:
        "Compute Monthly EMI, Total Interest, Lifetime Cost Instantly; Adjust Loan Amount, Tenure, Rate...",
      href: "/emi-calculator",
      iconSrc: "/static/icon/Calci.svg",
    },
    {
      id: 2,
      heading: "Locate Score",
      sub_heading:
        "Assess Location Quality, Growth Potential, and Investment Risk. Check Price Trends, Connectivity, Amenities, and Infrastructure...",
      href: "/locate-score",
      iconSrc: "/static/icon/Graph.svg",
    },
  ];

  // Returning the new insight section
  return (
    <div className="container-fluid bg-light new-insight-container py-3 py-lg-5">
      <div className="container insight-content-wrapper">
        <div className="insight-layout">
          <div className="insight-cards">
            <h2 className="plus-jakarta-sans-semi-bold mb-3 mb-lg-4">
              Expert Insights & Resources
            </h2>
            <div className="d-flex flex-column flex-md-row gap-3">
              {insights.map((insight) => (
                <div className="insight-card" key={insight.id}>
                  <div className="insight-icon-wrapper">
                    <Image
                      src={insight.iconSrc}
                      alt={`${insight.heading} icon`}
                      width={32}
                      height={32}
                      className="insight-icon"
                    />
                  </div>
                  <div className="insight-content">
                    <h3 className="insight-title plus-jakarta-sans-semi-bold">
                      {insight.heading}
                    </h3>
                    <p className="insight-description plus-jakarta-sans-semi-bold">
                      {insight.sub_heading}
                    </p>
                    <Link
                      className="insight-link plus-jakarta-sans-semi-bold"
                      href={insight.href}
                    >
                      Explore Now
                      <span className="insight-link-arrow">
                        <FontAwesomeIcon icon={faArrowRight} />
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="insight-image-wrapper">
            <Link href={`${process.env.NEXT_PUBLIC_UI_URL}/saya-gold-avenue`} target="_blank" rel="noopener noreferrer">
            <Image
              src="/static/saya.png"
              alt="Family"
              width={604}
              height={308}
              className="insight-main-image"
              priority
              />
              </Link>
            {/* <div className="insight-logo-wrapper">
              <Image
                src="/static/icon/jacob.svg"
                alt="Jacob & Co"
                width={170}
                height={82}
                className="insight-logo"
              />
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
