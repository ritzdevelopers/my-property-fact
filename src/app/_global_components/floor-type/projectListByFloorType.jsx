import BlogFaqSection from "@/app/(home)/components/common/BlogFaqSection";
import ListingPageSeoContent from "@/app/(home)/components/common/ListingPageSeoContent";
import NewFooterDesign from "@/app/(home)/components/footer/NewFooterDesign";
import HeaderComponent from "@/app/(home)/components/header/headerComponent";
import ProjectsRedesigned from "@/app/(home)/projects/ProjectsRedesigned";
import { buildListingProjectsViewConfig } from "@/lib/listingProjectsViewConfig";

export default function ProjectListByFloorType({
  slug,
  cityList = [],
  compoundListing = null,
  initialProjects = [],
  faqItems = [],
  listingContent = null,
}) {
  const listingView = buildListingProjectsViewConfig({
    slug,
    cityList,
    compoundListing,
  });
  const title = listingView.pageTitle || "All Projects";
  const pageHeading = listingContent?.heading?.trim() || listingView.pageHeading;
  const pageIntro = listingContent?.intro?.trim() || "";

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
          pageHeading={pageHeading}
          pageIntro={pageIntro}
          initialProjects={initialProjects}
        />
        <ListingPageSeoContent content={listingContent} />
      </main>
      <BlogFaqSection
        faqItems={faqItems}
        subtitle={`Find answers to common questions about ${title.toLowerCase()} on My Property Fact.`}
      />
      <NewFooterDesign cityList={cityList} compactTop={true} />
    </>
  );
}
