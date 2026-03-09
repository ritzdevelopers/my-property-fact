import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";

export default function LoadingAboutusPage(){
    return(
        <div className="d-flex justify-content-center align-items-center">
            <LoadingSpinner show={true}/>
        </div>
    )
}