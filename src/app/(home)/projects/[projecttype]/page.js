import { Suspense } from "react";
import { notFound } from "next/navigation";
import { fetchAllProjectsByProjectType, resolveValidProjectTypeSlug } from "@/app/_global_components/masterFunction";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import PropertyPage from "./propertypage";
import ProjectsRedesigned from "../ProjectsRedesigned";

const COMMERCIAL_META = {
  title: "Top Commercial Real Estate Projects in India | MyPropertyFact",
  description:
    "Discover top commercial real estate projects in India across major cities. Compare office spaces and retail investments with verified data on MyPropertyFact.",
  keywords: [
    "Top Commercial Real Estate Projects in India",
    "commercial properties in India",
    "office space for sale in India",
    "retail shops for sale India",
    "commercial real estate India",
    "commercial property investment India",
    "office spaces in India",
    "shops and showrooms for sale India",
    "business property for sale India",
  ],
};

const RESIDENTIAL_META = {
  title: "Buy Residential Property in India |  Luxury & Affordable Homes | MPF",
  description:
    "Browse affordable and luxury residential properties across India. MyPropertyFact offers verified listings, smart tools, and insights for better home buying.",
  keywords: [
    "Buy Residential Property in India",
    "residential properties in India",
    "buy flats in India",
    "apartments for sale in India",
    "residential projects in India",
    "luxury apartments in India",
    "affordable housing projects India",
    "villas for sale in India",
    "ready to move flats in India",
  ],
};

const NEW_LAUNCHES_META = {
  title: "Explore New Launch Real Estate Projects in India | Book Now",
  description:
    "Find the latest new launch property projects in India with modern amenities and prime locations. Compare and invest smarter with MyPropertyFact.",
  keywords: [
    "New Launch Real Estate Projects in India",
    "new launch projects in India",
    "upcoming real estate projects India",
    "newly launched flats in India",
    "new property launches India",
    "pre launch property India",
    "new residential projects India",
    "latest real estate projects India",
    "investment property new launch India",
  ],
};

const REDESIGNED_PROJECT_TYPE_PAGES = {
  commercial: {
    initialActiveTab: "commercial",
    hubCategory: "commercial",
    breadcrumbLabel: "Commercial Projects",
    breadcrumbParent: { href: "/projects", label: "Projects" },
    pageIntro:
      "Explore Premium Commercial Properties in India with Prime Locations & High ROI.",
  },
  residential: {
    initialActiveTab: "residential",
    breadcrumbLabel: "Residential Projects",
    breadcrumbParent: { href: "/projects", label: "Projects" },
    pageIntro:
      "Explore Top Residential Properties in India with Luxury Apartments, & Amenities",
  },
  "new-launches": {
    hubCategory: "new-projects",
    breadcrumbLabel: "New Launch Projects",
    breadcrumbParent: { href: "/projects", label: "Projects" },
    pageIntro:
      "Explore New Real Estate Projects in India, Top Locations, & Investment Deals.",
  },
};

function RedesignedProjectTypePage({ config }) {
  return (
    <main id="primary-content" aria-labelledby="mpf-page-heading">
      <ProjectsRedesigned {...config} />
    </main>
  );
}

//Generating metatitle and meta description
export async function generateMetadata({ params }) {
  const { projecttype } = await params;
  if (projecttype?.toLowerCase() === "commercial") {
    return {
      ...COMMERCIAL_META,
      alternates: {
        canonical: `/projects/${projecttype}`,
      },
    };
  }
  if (projecttype?.toLowerCase() === "residential") {
    return {
      ...RESIDENTIAL_META,
      alternates: {
        canonical: `/projects/${projecttype}`,
      },
    };
  }
  if (projecttype?.toLowerCase() === "new-launches") {
    return {
      ...NEW_LAUNCHES_META,
      alternates: {
        canonical: `/projects/${projecttype}`,
      },
    };
  }

  const validSlug = await resolveValidProjectTypeSlug(projecttype);
  if (!validSlug) {
    notFound();
  }

  try {
    const response = await fetchAllProjectsByProjectType(validSlug);
    if (!response) {
      notFound();
    }
    return {
      title: response.metaTitle || `Projects - ${projecttype}`,
      description: response.metaDesc || `Browse ${projecttype} projects`,
      alternates: {
        canonical: `/projects/${projecttype}`,
      },
    };
  } catch {
    notFound();
  }
}

export default async function ProjectType({ params }) {
  const { projecttype } = await params;
  const norm = String(projecttype || "").trim().toLowerCase();
  const redesignedConfig = REDESIGNED_PROJECT_TYPE_PAGES[norm];

  if (redesignedConfig) {
    return <RedesignedProjectTypePage config={redesignedConfig} />;
  }

  const validSlug = await resolveValidProjectTypeSlug(projecttype);
  if (!validSlug) {
    notFound();
  }
  const projectTypeDetail = await fetchAllProjectsByProjectType(validSlug);
  if (!projectTypeDetail) {
    notFound();
  }

  return (
    <main id="primary-content" aria-labelledby="mpf-page-heading">
      <Suspense
        fallback={
          <div
            className="d-flex justify-content-center align-items-center my-5"
            style={{ minHeight: "320px" }}
          >
            <LoadingSpinner show={true} />
          </div>
        }
      >
        <PropertyPage
          projectTypeSlug={validSlug}
          projectTypeDetails={{
            projectTypeName: projectTypeDetail.projectTypeName,
          }}
        />
      </Suspense>
    </main>
  );
}
