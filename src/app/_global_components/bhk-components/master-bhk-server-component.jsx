import CommonHeaderBanner from "@/app/(home)/components/common/commonheaderbanner";
import CommonBreadCrum from "@/app/(home)/components/common/breadcrum";
import BlogFaqSection from "@/app/(home)/components/common/BlogFaqSection";
import MasterBHKProjectList from "./master-bhk-project-list";
import HeaderComponent from "@/app/(home)/components/header/headerComponent";
import NewFooterDesign from "@/app/(home)/components/footer/NewFooterDesign";

export default function MasterBHKProjectsPage({ slug, cityList = [], faqItems = [] }) {
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
      <BlogFaqSection
        faqItems={faqItems}
        subtitle={`Find answers to common questions about ${title ? title.toLowerCase() : "properties"} on My Property Fact.`}
      />
      <NewFooterDesign cityList={cityList} compactTop={true} />
    </>
  );
}
