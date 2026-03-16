import { fetchAllProjectsByProjectType } from "@/app/_global_components/masterFunction";
import PropertyPage from "./propertypage";
import CommonHeaderBanner from "../../components/common/commonheaderbanner";

//Generating metatitle and meta description
export async function generateMetadata({ params }) {
  try {
    const { projecttype } = await params;
    const response = await fetchAllProjectsByProjectType(projecttype);
    return {
      title: response.metaTitle || `Projects - ${projecttype}`,
      description: response.metaDesc || `Browse ${projecttype} projects`,
      alternates: {
        canonical: `/projects/${projecttype}`,
      },
    };
  } catch (error) {
    return {
      title: `Projects - ${params.projecttype}`,
      description: `Browse ${params.projecttype} projects`,
    };
  }
}

export default async function ProjectType({ params }) {
  const { projecttype } = await params;
  const projectTypeDetail = await fetchAllProjectsByProjectType(projecttype);
  return (
    <>
      <CommonHeaderBanner
        headerText={projectTypeDetail.projectTypeName}
        image={"realestate-bg.jpg"}
        firstPage={"projects"}
        pageName={projectTypeDetail.projectTypeName}
      />
      <PropertyPage projectTypeDetails={projectTypeDetail} />
    </>
  );
}
