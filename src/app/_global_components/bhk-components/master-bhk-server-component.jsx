import HeaderComponent from "@/app/(home)/components/header/headerComponent";
import NewFooterDesign from "@/app/(home)/components/footer/NewFooterDesign";
import ProjectsRedesigned from "@/app/(home)/projects/ProjectsRedesigned";

const HUB_PREFIXES = [
  { prefix: "offices-and-shop-in-", hubCategory: "offices-and-shop", label: "Offices and Shop" },
  { prefix: "commercial-property-in-", hubCategory: "commercial", label: "Commercial Property" },
  { prefix: "new-projects-in-", hubCategory: "new-projects", label: "New Projects" },
  { prefix: "apartments-in-", hubCategory: "apartments", label: "Apartments" },
  { prefix: "flats-in-", hubCategory: "flats", label: "Flats" },
];

function titleCaseWords(value = "") {
  return String(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function parseHubSlug(slug = "") {
  const lower = String(slug || "").toLowerCase().trim();
  for (const item of HUB_PREFIXES) {
    if (!lower.startsWith(item.prefix)) continue;
    const citySlug = lower.slice(item.prefix.length);
    if (!citySlug) continue;
    const cityName = titleCaseWords(citySlug.replace(/-/g, " "));
    return {
      hubCategory: item.hubCategory,
      categoryLabel: item.label,
      cityName,
      breadcrumbLabel: `${item.label} in ${cityName}`,
      pageHeading: `${item.label} in ${cityName}`,
      initialActiveTab:
        item.hubCategory === "commercial" || item.hubCategory === "offices-and-shop"
          ? "commercial"
          : item.hubCategory === "apartments" || item.hubCategory === "flats"
            ? "residential"
            : "all",
    };
  }

  const title = titleCaseWords(lower.replace(/-/g, " "));
  return {
    hubCategory: "",
    categoryLabel: "Projects",
    cityName: "",
    breadcrumbLabel: title || "Projects",
    pageHeading: title || "Projects",
    initialActiveTab: "all",
  };
}

export default function MasterBHKProjectsPage({ slug, cityList = [] }) {
  const config = parseHubSlug(slug);

  return (
    <>
      <HeaderComponent />
      <main id="primary-content" aria-labelledby="mpf-page-heading">
        <ProjectsRedesigned
          initialCity={config.cityName}
          initialActiveTab={config.initialActiveTab}
          hubCategory={config.hubCategory}
          breadcrumbParent={{ href: "/projects", label: "Projects" }}
          breadcrumbLabel={config.breadcrumbLabel}
          pageHeading={config.pageHeading}
          showBreadcrumb={true}
        />
      </main>
      <NewFooterDesign cityList={cityList} compactTop={true} />
    </>
  );
}
