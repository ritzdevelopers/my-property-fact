import CommonHeaderBanner from "@/app/(home)/components/common/commonheaderbanner";
import CommonBreadCrum from "@/app/(home)/components/common/breadcrum";
import MasterBHKProjectList from "./master-bhk-project-list";
import HeaderComponent from "@/app/(home)/components/header/headerComponent";
import NewFooterDesign from "@/app/(home)/components/footer/NewFooterDesign";

export default function MasterBHKProjectsPage({ slug, cityList = [] }) {
  const title = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <>
      <HeaderComponent />
      <CommonHeaderBanner
        image={"project-banner.jpg"}
        headerText={title ? `${title}` : "All Projects"}
      />
      <CommonBreadCrum
        firstPage={"projects"}
        pageName={title ? `${title}` : "All Projects"}
      />
      <MasterBHKProjectList/>
      <NewFooterDesign cityList={cityList} compactTop={true} />
    </>
  );
}
