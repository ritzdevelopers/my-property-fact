"use client";
import "./citypage.css";
import "../../components/home/home.css";
import PropertyContainer from "@/app/(home)/components/common/page";
import CommonHeaderBanner from "../../components/common/commonheaderbanner";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import Image from "next/image";
import { useState ,useEffect, useRef} from "react";

export default function CityPage({ cityData }) {
  // Safely handle cases where API doesn't return a project list
  const projects = Array.isArray(cityData?.projectList)
    ? cityData.projectList
    : [];

  const cityName = cityData?.cityName?.trim() || "City";
  const aboutSectionLeftAlt = `${cityName} — city guide section, left illustration on My Property Fact`;
  const aboutSectionRightAlt = `${cityName} — city guide section, right illustration on My Property Fact`;
  const [showMore, setShowMore] = useState(false);

  const description = cityData?.cityDescription || "";
  const [showButton, setShowButton] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const el = contentRef.current;
    if (el) {
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
      const lines = el.scrollHeight / lineHeight;
      if (lines > 5) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    }
  }, [description]);
  return (
    <>
      <div className="p-0">
        <div className="container-fluid p-0">
          <CommonHeaderBanner
            image={"realestate-bg.jpg"}
            headerText={cityData?.cityName || ""}
            firstPage={"projects"}
            pageName={cityData?.cityName || ""}
          />
        </div>
        {/* <div className="container-fluid mt-4">
          <div className="container d-flex justify-content-center">
            <p className="text-center">{cityData.cityDescription}</p>
          </div>
          <div className="text-center">
            <Link href="#" className="btn text-white btn-background">
              Read More
            </Link>
          </div>
        </div> */}
        <div className="about-us-container">
          <div>
            <Image
              src={"/static/about-us-bg-left.png"}
              alt={aboutSectionLeftAlt}
              title={aboutSectionLeftAlt}
              width={161}
              height={353}
            />
          </div>
          {/* <div>
            <p>
              {showMore
                ?  description
                : description.slice(0, 500) +
                (description.length > 500 ? "..." : "")}</p>
                 <div style={{display: "flex", justifyContent: "center", marginBottom: "1rem"}}>
            {description.length > 500 && (
              <div  className="pc__cta" onClick={() => setShowMore(!showMore)}>
                {showMore ? "Read Less" : "Read More"}
              </div>
            )}
            </div>
          </div> */}

          <div className="citypage_content" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
      <div
        ref={contentRef}
        className={`desc ${showMore ? "expanded" : "collapsed"}`}
        dangerouslySetInnerHTML={{ __html: description }}
      />
<div className="text-center">
      {showButton && (
        <div className="pc__cta" onClick={() => setShowMore(!showMore)}>
          {showMore ? "Show Less" : "Show More"}
        </div>
      )}
      </div>
    </div>
          </div>
          <div>
            <Image
              src={"/static/about-us-bg-right.png"}
              alt={aboutSectionRightAlt}
              title={aboutSectionRightAlt}
              width={161}
              height={353}
            />
          </div>
        </div>
        {false ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "250px" }}>
            <LoadingSpinner show={loading} />
          </div>
        ) : (
          <div className="container my-3 pb-5">
            <h2 className="city-projects-heading mb-4">
              Projects in {cityData?.cityName || "this city"}
            </h2>
            <div className="row g-3">
              {projects.length > 0 ? (
                projects.map((item, index) => (
                  <div key={`${index}`} className="col-12 col-sm-6 col-md-4">
                    <PropertyContainer data={item} />
                  </div>
                ))
              ) : (
                <p className="text-center fs-4 fw-bold">No projects found</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
