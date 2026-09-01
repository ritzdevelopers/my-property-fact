import "./builderpage.css";
import PropertyContainer from "@/app/(home)/components/common/PropertyContainer";
import CommonHeaderBanner from "../../components/common/commonheaderbanner";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
export default function BuilderPage({ builderDetail, projectsList }) {
  const builderName = builderDetail?.builderName?.trim() || "Builder";
  const aboutBuilderLeftAlt = `${builderName} — about the builder section, left illustration on My Property Fact`;
  const aboutBuilderRightAlt = `${builderName} — about the builder section, right illustration on My Property Fact`;
 
  return (
    <>
      <CommonHeaderBanner
        headerText={builderDetail.builderName}
        image={"realestate-bg.jpg"}
        firstPage={"projects"}
        pageName={builderDetail.builderName}
      />
      {/* <CommonBreadCrum
        firstPage={"projects"}
        pageName={builderDetail.builderName}
      /> */}
      {/* <div className="container">
        <div className="d-flex justify-content-center">
          <div className="w-80">
            <p className="text-center">{builderDetail.builderDescription}</p>
          </div>
        </div>
        <div className="text-center">
          <Link href="#" className="btn btn-background text-white">
            Read More
          </Link>
        </div>
      </div> */}
      <div className="about-builder-container">
        <div>
          <img
            src={"/static/about-us-bg-left.png"}
            alt={aboutBuilderLeftAlt}
            title={aboutBuilderLeftAlt}
            width={161}
            height={353}
          />
        </div>
        <div>
          <div
            dangerouslySetInnerHTML={{
              __html: builderDetail?.builderDescription || "",
            }}
          />
        </div>
        <div>
          <img
            src={"/static/about-us-bg-right.png"}
            alt={aboutBuilderRightAlt}
            title={aboutBuilderRightAlt}
            width={161}
            height={353}
          />
        </div>
      </div>
      {false ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "250px" }}
        >
          <LoadingSpinner show={loading} />
        </div>
      ) : (
        <div className="container my-3 pb-5 builder-projects-section">
          <h2 className="builder-projects-heading mb-4">
            Projects by {builderDetail?.builderName || "this builder"}
          </h2>
          <div className="row g-3 builder-projects-grid">
            {builderDetail.projectList.length > 0 ? (
              builderDetail.projectList.map((item, index) => (
                <div key={index} className="col-12 col-sm-6 col-md-4 builder-projects-grid__item">
                  <PropertyContainer data={item} badgeVariant="home-featured" />
                </div>
              ))
            ) : (
              <p className="text-center fs-4 fw-bold">No projects found</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
