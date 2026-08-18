import BlogFaqSection from "@/app/(home)/components/common/BlogFaqSection";
import HeaderComponent from "@/app/(home)/components/header/headerComponent";
import NewFooterDesign from "@/app/(home)/components/footer/NewFooterDesign";
import ProjectsRedesigned from "@/app/(home)/projects/ProjectsRedesigned";
import { buildListingProjectsViewConfig } from "@/lib/listingProjectsViewConfig";

export default function MasterBHKProjectsPage({ slug, cityList = [], faqItems = [] }) {
  const listingView = buildListingProjectsViewConfig({ slug, cityList });
  const title = listingView.pageTitle || "All Projects";

  return (
    <>
      <HeaderComponent />
      <main id="primary-content" aria-labelledby="mpf-page-heading">
        <ProjectsRedesigned
          key={slug}
          initialCity={listingView.initialCity}
          initialActiveTab={listingView.initialActiveTab}
          initialBhkType={listingView.initialBhkType}
          initialConfigType={listingView.initialConfigType}
          hubCategory={listingView.hubCategory}
          lockCity={listingView.lockCity}
          breadcrumbParent={listingView.breadcrumbParent}
          breadcrumbLabel={listingView.breadcrumbLabel}
          pageHeading={listingView.pageHeading}
        />
      </main>
      <BlogFaqSection
        faqItems={faqItems}
        subtitle={`Find answers to common questions about ${title.toLowerCase()} on My Property Fact.`}
      />
      <NewFooterDesign cityList={cityList} compactTop={true} />
    </>
  );
}
