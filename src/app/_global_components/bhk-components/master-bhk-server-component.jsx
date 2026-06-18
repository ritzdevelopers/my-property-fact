import HeaderComponent from "@/app/(home)/components/header/headerComponent";
import NewFooterDesign from "@/app/(home)/components/footer/NewFooterDesign";
import ProjectsRedesigned from "@/app/(home)/projects/ProjectsRedesigned";

export default function MasterBHKProjectsPage({ slug, cityList = [] }) {
  const safeSlug = String(slug || "");
  const title = safeSlug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const lower = safeSlug.toLowerCase();
  const cityFromSlug = (() => {
    const idx = lower.lastIndexOf("-in-");
    if (idx === -1) return "";
    return lower.slice(idx + 4).replace(/-/g, " ").trim();
  })();

  const floorSlug = (() => {
    const idx = lower.lastIndexOf("-in-");
    if (idx === -1) return "";
    return lower.slice(0, idx).trim(); // e.g. "food-court" OR "3-bhk-new-projects"
  })();

  const hubCategory = (() => {
    if (lower.includes("-commercial-property-in-") || lower.startsWith("commercial-property-in-")) return "commercial";
    if (lower.includes("-offices-and-shop-in-") || lower.startsWith("offices-and-shop-in-")) return "offices-and-shop";
    if (lower.includes("-new-projects-in-") || lower.startsWith("new-projects-in-")) return "new-projects";
    if (lower.includes("-apartments-in-") || lower.startsWith("apartments-in-")) return "apartments";
    if (lower.includes("-flats-in-") || lower.startsWith("flats-in-")) return "flats";
    return "";
  })();

  const initialBhkType = (() => {
    const m = floorSlug.match(/^(\d+)-bhk\b/i);
    if (!m?.[1]) return "";
    return `${m[1]} BHK`;
  })();

  const initialConfigType = (() => {
    // /food-court-in-delhi etc
    if (
      /^\d+-bhk\b/i.test(floorSlug) ||
      /^\d+-rk-studio\b/i.test(floorSlug) ||
      /^\d+-sq\.ft\b/i.test(floorSlug)
    ) {
      return "";
    }
    if (!floorSlug) return "";
    // If it contains a hub segment (e.g. "3-bhk-new-projects"), it's not a config type.
    if (floorSlug.includes("new-projects") || floorSlug.includes("apartments") || floorSlug.includes("commercial") || floorSlug.includes("offices-and-shop") || floorSlug.includes("flats")) {
      return "";
    }
    return floorSlug;
  })();

  const initialRkType = (() => {
    const m = floorSlug.match(/^(\d+)-rk-studio\b/i);
    if (!m?.[1]) return "";
    return `${m[1]} RK`;
  })();

  const derivedHubCategory = (() => {
    if (hubCategory) return hubCategory;
    // Clean config-type URLs like /food-court-in-delhi should behave as Commercial.
    // Note: The listing API sometimes labels these projects as "Residential" even when
    // configuration is Offices/Shops etc — the hub-category matcher handles this.
    const commercialConfigKeys = new Set([
      "food-court",
      "kiosk",
      "shops",
      "shop",
      "office",
      "showroom",
      "restaurant",
      "sco-plots",
    ]);
    if (commercialConfigKeys.has(initialConfigType)) return "commercial";
    // Pure floor listing like /3-bhk-in-delhi should behave like "Flats" hub.
    if (/^\d+-bhk\b/i.test(floorSlug) || /^\d+-rk-studio\b/i.test(floorSlug) || /^\d+-sq\.ft\b/i.test(floorSlug)) {
      return "flats";
    }
    return "";
  })();

  const initialActiveTab =
    derivedHubCategory === "commercial" || derivedHubCategory === "offices-and-shop"
      ? "commercial"
      : derivedHubCategory === "apartments" || derivedHubCategory === "flats"
        ? "residential"
        : "all";

  const initialQuickFilter = safeSlug.startsWith("new-projects-in-")
    ? "new"
    : "";

  return (
    <>
      <HeaderComponent />
      <main id="primary-content" aria-labelledby="mpf-page-heading">
        <ProjectsRedesigned
          initialCity={cityFromSlug}
          initialActiveTab={initialActiveTab}
          initialQuickFilter={initialQuickFilter}
          initialBhkType={initialBhkType || (initialRkType === "1 RK" ? "1 RK" : "")}
          initialConfigType={initialConfigType}
          breadcrumbLabel={title || "Projects"}
          hubCategory={derivedHubCategory}
        />
      </main>
      <NewFooterDesign cityList={cityList} compactTop={true} />
    </>
  );
}
