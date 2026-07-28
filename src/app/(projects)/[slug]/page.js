import { redirect, notFound } from "next/navigation";
import Property from "./propertypage-server";
import { resolveCitySlugInCompoundSlug } from "@/app/_global_components/cityAliasUtils";
import {
  isStaticRootSlugTypo,
  mayBeValidRootCatchAllSlug,
} from "@/lib/publicRouteValidation";
import {
  fetchAllProjects,
  fetchCityData,
  fetchNearbyBenefitsAll,
  fetchProjectDetailsBySlug,
  isCityTypeUrl,
  isMalformedListingSlug,
  isKnownCitySlug,
  isValidCompoundFloorListing,
  parseCompoundFloorListingSlug,
} from "@/app/_global_components/masterFunction";
import {
  buildCanonicalFloorInCitySlug,
  collectKnownFloorSlugs,
  getCompoundListingProjectsInCity,
  getFloorListingProjectsInCity,
  parseFloorInCitySlug,
} from "@/lib/listingFloorValidation";
import MasterBHKProjectsPage from "@/app/_global_components/bhk-components/master-bhk-server-component";
import ProjectListByFloorType from "@/app/_global_components/floor-type/projectListByFloorType";
import NewFooterDesign from "@/app/(home)/components/footer/NewFooterDesign";
import JsonLdScript from "@/app/_global_components/jsonLd/JsonLdScript";
import {
  buildFaqJsonLd,
  buildProductJsonLd,
  resolveProjectFaqRawList,
} from "@/app/_global_components/jsonLd/buildJsonLd";
import { fetchListingPageFaqsBySlug } from "@/lib/fetchListingPageFaqs";
import { slimProjectForListing } from "@/lib/slimProjectListing";

/** ISR-friendly cache for valid project/listing pages. */
export const revalidate = 120;

const SIMILAR_PROJECTS_MAX = 12;

/** Only fields used by listing cards / similar-project carousel — avoids serializing full `/projects` rows. */
function slimProjectCardForPayload(p) {
  return slimProjectForListing(p);
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
  try {
    const { slug } = await params;

    if (isStaticRootSlugTypo(slug) || !mayBeValidRootCatchAllSlug(slug)) {
      notFound();
    }

    const aliasResolvedSlug = resolveCitySlugInCompoundSlug(slug);
    if (aliasResolvedSlug && aliasResolvedSlug !== slug) {
      redirect(`/${aliasResolvedSlug}`);
    }
    const maybeCompoundListing = parseCompoundFloorListingSlug(slug);
    const allProjectsForSlug = await fetchAllProjects();
    const knownFloorSlugs = collectKnownFloorSlugs(allProjectsForSlug);
    const parsedFloorCity = parseFloorInCitySlug(slug, knownFloorSlugs);
    const canonicalFloorCity = buildCanonicalFloorInCitySlug(slug);
    if (
      !maybeCompoundListing &&
      canonicalFloorCity &&
      canonicalFloorCity !== slug
    ) {
      const canonicalParsed = parseFloorInCitySlug(
        canonicalFloorCity,
        knownFloorSlugs,
      );
      if (canonicalParsed) {
        const hasCanonicalData =
          getFloorListingProjectsInCity(
            allProjectsForSlug,
            canonicalParsed.citySlug,
            canonicalParsed.floorSlug,
          ).length > 0;
        if (hasCanonicalData) {
          redirect(`/${canonicalFloorCity}`);
        }
      }
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
    const isProjectSlug = projectResolved && projectDetail.slugURL === slug;

    if (!isProjectSlug && isMalformedListingSlug(slug)) {
      notFound();
    }

    if (maybeCompoundListing) {
      const compoundValid = await isValidCompoundFloorListing(
        maybeCompoundListing,
      );
      if (!compoundValid) {
        notFound();
      }
    }

    const isCompoundFloorListing = Boolean(maybeCompoundListing);

    /** Compound `{floor}-{category}-in-{city}` must not be treated as city hub (`*-in-{city}`). */
    const isCitySlug =
      !maybeCompoundListing && (await isCityTypeUrl(slug));

    let floorListingProjects = [];
    let isKnownFloorCity = false;
    if (!isCompoundFloorListing && !isCitySlug && parsedFloorCity) {
      isKnownFloorCity = await isKnownCitySlug(parsedFloorCity.citySlug);
      if (isKnownFloorCity) {
        floorListingProjects = getFloorListingProjectsInCity(
          allProjectsForSlug,
          parsedFloorCity.citySlug,
          parsedFloorCity.floorSlug,
        );
      }
    }

    const isFloorTypeSlug =
      !isCompoundFloorListing && !isCitySlug && Boolean(parsedFloorCity) && isKnownFloorCity;

    if (isCitySlug) {
      const listingFaqs = await fetchListingPageFaqsBySlug(slug);
      return (
        <>
          <JsonLdScript data={buildFaqJsonLd(listingFaqs)} />
          <MasterBHKProjectsPage
            slug={slug}
            cityList={cityList}
            faqItems={listingFaqs}
          />
        </>
      );
    } else if (isCompoundFloorListing) {
      const compoundKey = `${maybeCompoundListing.floorSlug}-${maybeCompoundListing.categorySlug}`;
      const compoundProjects = getCompoundListingProjectsInCity(
        allProjectsForSlug,
        maybeCompoundListing.citySlug,
        compoundKey,
      );
      if (compoundProjects.length === 0) {
        notFound();
      }
      const listingFaqs = await fetchListingPageFaqsBySlug(slug);
      return (
        <>
          <JsonLdScript data={buildFaqJsonLd(listingFaqs)} />
          <ProjectListByFloorType
            slug={slug}
            cityList={cityList}
            compoundListing={maybeCompoundListing}
            initialProjects={compoundProjects.map(slimProjectCardForPayload)}
            faqItems={listingFaqs}
          />
        </>
      );
    } else if (isFloorTypeSlug) {
      const listingFaqs = await fetchListingPageFaqsBySlug(slug);
      return (
        <>
          <JsonLdScript data={buildFaqJsonLd(listingFaqs)} />
          <ProjectListByFloorType
            slug={slug}
            cityList={cityList}
            initialProjects={floorListingProjects.map(slimProjectCardForPayload)}
            faqItems={listingFaqs}
          />
        </>
      );
    } else if (
      !isProjectSlug &&
      slug.includes("-in-") &&
      !isCitySlug &&
      !maybeCompoundListing
    ) {
      notFound();
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
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    if (error?.digest === "NEXT_NOT_FOUND") throw error;
    notFound();
  }
}
