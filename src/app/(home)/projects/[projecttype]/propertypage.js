import PropertyContainer from "@/app/(home)/components/common/page";
import CommonHeaderBanner from "../../components/common/commonheaderbanner";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";

export default function PropertyPage({ projectTypeDetails }) {
  return (
    <>
      <div className="container my-5">
        <div className="row g-3">
          {projectTypeDetails.projectList.length > 0 ? (
            projectTypeDetails.projectList.map((item, index) => (
              <div key={index} className="col-12 col-sm-6 col-md-4">
                <PropertyContainer data={item} />
              </div>
            ))
          ) : (
            <p className="text-center fs-4 fw-bold">No projects found</p>
          )}
        </div>
      </div>
    </>
  );
}
