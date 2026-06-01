import { redirect, notFound } from "next/navigation";
import Property from "./propertypage-server";
import { resolveCitySlugInCompoundSlug } from "@/app/_global_components/cityAliasUtils";
import {
  canonicalizeFloorInCitySlug,
  fetchAllProjects,
  fetchCityData,
  fetchNearbyBenefitsAll,
  fetchProjectDetailsBySlug,
  isCityTypeUrl,
  isFloorTypeUrl,
  parseCompoundFloorListingSlug,
} from "@/app/_global_components/masterFunction";
import MasterBHKProjectsPage from "@/app/_global_components/bhk-components/master-bhk-server-component";
import ProjectListByFloorType from "@/app/_global_components/floor-type/projectListByFloorType";
import NewFooterDesign from "@/app/(home)/components/footer/NewFooterDesign";
import JsonLdScript from "@/app/_global_components/jsonLd/JsonLdScript";
import {
  buildFaqJsonLd,
  buildProductJsonLd,
  resolveProjectFaqRawList,
} from "@/app/_global_components/jsonLd/buildJsonLd";

/** ISR-friendly cache; avoids force-dynamic so responses can be cached at the edge. */
export const revalidate = 120;

const SIMILAR_PROJECTS_MAX = 12;

/** Only fields used by `PropertyContainer` / Similar Projects carousel — avoids serializing full `/projects` rows. */
function slimProjectCardForPayload(p) {
  if (!p || typeof p !== "object") return p;
  return {
    id: p.id,
    slugURL: p.slugURL,
    projectName: p.projectName,
    propertyTypeName: p.propertyTypeName,
    projectPrice: p.projectPrice,
    projectAddress: p.projectAddress,
    projectBannerImage: p.projectBannerImage,
    projectThumbnailImage: p.projectThumbnailImage,
    projectStatusName: p.projectStatusName,
  };
}

/**
 * Master nearby-benefit rows that can match location benefit names (same fuzzy rules as `propertypage.js` addNearbyImageIcon).
 */
function selectNearbyCatalogForProject(project, allNearby) {
  if (!Array.isArray(allNearby) || !allNearby.length) return [];
  const raw = project?.locationBenefits;
  if (!Array.isArray(raw) || !raw.length) return [];
  const names = raw
    .map((item) =>
      typeof item?.benefitName === "string" ? item.benefitName.trim() : "",
    )
    .filter(Boolean);
  if (!names.length) return [];
  return allNearby.filter((b) => {
    const bn = String(b.benefitName || "")
      .toLowerCase()
      .trim();
    if (!bn) return false;
    return names.some((n) => {
      const lower = n.toLowerCase();
      return bn === lower || bn.includes(lower) || lower.includes(bn);
    });
  });
}

export default async function PropertyPage({ params }) {
  const { slug } = await params;
  const aliasResolvedSlug = resolveCitySlugInCompoundSlug(slug);
  if (aliasResolvedSlug && aliasResolvedSlug !== slug) {
    redirect(`/${aliasResolvedSlug}`);
  }
  const maybeCompoundListing = parseCompoundFloorListingSlug(slug);
  const canonicalFloorCity = canonicalizeFloorInCitySlug(slug);
  if (
    !maybeCompoundListing &&
    canonicalFloorCity &&
    canonicalFloorCity !== slug &&
    (await isFloorTypeUrl(canonicalFloorCity))
  ) {
    redirect(`/${canonicalFloorCity}`);
  }
  const [cityList, projectDetail] = await Promise.all([
    fetchCityData(),
    fetchProjectDetailsBySlug(slug),
  ]);

  const projectResolved =
    projectDetail &&
    typeof projectDetail === "object" &&
    !Array.isArray(projectDetail) &&
    typeof projectDetail.slugURL === "string";

  let isCompoundFloorListing = false;
  if (maybeCompoundListing) {
    const cityOk = cityList.some(
      (c) =>
        c.cityName.toLowerCase().replace(/\s+/g, "-") ===
        maybeCompoundListing.citySlug,
    );
    const baseFloorCitySlug = `${maybeCompoundListing.floorSlug}-in-${maybeCompoundListing.citySlug}`;
    isCompoundFloorListing =
      cityOk && (await isFloorTypeUrl(baseFloorCitySlug));
  }

  const isFloorTypeSlug =
    !isCompoundFloorListing && (await isFloorTypeUrl(slug));
  const isProjectSlug = projectResolved && projectDetail.slugURL === slug;
  /** Compound `{floor}-{category}-in-{city}` must not be treated as city hub (`*-in-{city}`). */
  const isCitySlug =
    !maybeCompoundListing && (await isCityTypeUrl(slug));

  if (isCitySlug) {
    return <MasterBHKProjectsPage slug={slug} cityList={cityList} />;
  } else if (isCompoundFloorListing) {
    return (
      <ProjectListByFloorType
        slug={slug}
        cityList={cityList}
        compoundListing={maybeCompoundListing}
      />
    );
  } else if (isFloorTypeSlug) {
    return <ProjectListByFloorType slug={slug} cityList={cityList} />;
  } else if (isProjectSlug) {
    /** Full project list only needed for “similar projects” cards — skip for city/floor routes. */
    const featuredProjects = await fetchAllProjects();
    const similarProjectsSlim = featuredProjects
      .filter(
        (item) =>
          item.cityName === projectDetail.city &&
          item.propertyTypeName === projectDetail.propertyTypeName &&
          item.id !== projectDetail.id,
      )
      .slice(0, SIMILAR_PROJECTS_MAX)
      .map(slimProjectCardForPayload);

    const hasLocationBenefits =
      Array.isArray(projectDetail.locationBenefits) &&
      projectDetail.locationBenefits.length > 0;
    const nearbyBenefitsList = hasLocationBenefits
      ? selectNearbyCatalogForProject(
          projectDetail,
          await fetchNearbyBenefitsAll(),
        )
      : [];
    const projectAddress =
      projectDetail.projectAddress ||
      [projectDetail.projectLocality, projectDetail.city]
        .filter(Boolean)
        .join(", ");

    const projectForJsonLd = {
      ...projectDetail,
      projectAddress,
    };

    return (
      <>
        <JsonLdScript data={buildProductJsonLd(projectForJsonLd)} />
        <JsonLdScript
          data={buildFaqJsonLd(resolveProjectFaqRawList(projectDetail))}
        />
        <Property
          projectDetail={projectDetail}
          similarProjects={similarProjectsSlim}
          nearbyBenefitsList={nearbyBenefitsList}
        />
        <NewFooterDesign compactTop={true} />
      </>
    );
  } else {
    notFound();
  }
}
