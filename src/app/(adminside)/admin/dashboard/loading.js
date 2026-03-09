import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";

export default function DashboardLoading() {
    return (
        <div className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "550px" }}>
            <LoadingSpinner show={true} />
        </div>
    )
}