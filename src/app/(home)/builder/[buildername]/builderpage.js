import "./builderpage.css";
import Link from "next/link";
import PropertyContainer from "@/app/(home)/components/common/page";
import CommonHeaderBanner from "../../components/common/commonheaderbanner";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import Image from "next/image";
export default function BuilderPage({ builderDetail, projectsList }) {
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
          <Image
            src={"/static/about-us-bg-left.png"}
            alt={"About the Builder left image"}
            width={161}
            height={353}
          />
        </div>
        <div>
          <p>{builderDetail.builderDescription}</p>
          <div className="text-center">
            <Link
              href="#"
              className="btn text-white btn-background about-builder-read-more"
            >
              Read More
            </Link>
          </div>
        </div>
        <div>
          <Image
            src={"/static/about-us-bg-right.png"}
            alt={"About the Builder right image"}
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
        <div className="container my-3">
          <div className="row g-3">
            {builderDetail.projectList.length > 0 ? (
              builderDetail.projectList.map((item, index) => (
                <div key={index} className="col-12 col-sm-6 col-md-4">
                  <PropertyContainer data={item} />
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
