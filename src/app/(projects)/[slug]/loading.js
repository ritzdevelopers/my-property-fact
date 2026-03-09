import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import "bootstrap/dist/css/bootstrap.min.css";
export default function LoadingProperty() {
  return (
    <div className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "550px" }}>
      <LoadingSpinner show={true} />
    </div>
  )
}
