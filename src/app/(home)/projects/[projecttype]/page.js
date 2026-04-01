import { fetchAllProjectsByProjectType } from "@/app/_global_components/masterFunction";
import PropertyPage from "./propertypage";
import CommonHeaderBanner from "../../components/common/commonheaderbanner";

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

  try {
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
      title: `Projects - ${projecttype}`,
      description: `Browse ${projecttype} projects`,
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
