import { fetchBuilderDetails } from "@/app/_global_components/masterFunction";
import { notFound } from "next/navigation";
import BuilderPage from "./builderpage";

export const revalidate = 120;

function normalizeBuilderSlug(slug) {
  if (typeof slug !== "string") return "";
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

//Generating metatitle and meta description
export async function generateMetadata({ params }) {
  const { buildername } = await params;
  const normalizedBuilderSlug = normalizeBuilderSlug(buildername);
  let response = null;
  try {
    response = await fetchBuilderDetails(normalizedBuilderSlug);
  } catch {
    response = null;
  }

  if (!response) {
    return {
      title: "Builder Not Found | My Property Fact",
      description: "The requested builder page could not be found.",
      alternates: {
        canonical: `/builder/${normalizedBuilderSlug}`,
      },
    };
  }

  return {
    title: response.metaTitle || `${response.builderName || "Builder"} | My Property Fact`,
    description:
      response.metaDescription ||
      "Explore verified builder details, projects and company information.",
    keywords: response.metaKeywords || [],
    alternates: {
      canonical: `/builder/${normalizedBuilderSlug}`,
    },
  };
}

export default async function Builder({ params }) {
  const { buildername } = await params;
  const normalizedBuilderSlug = normalizeBuilderSlug(buildername);
  let builderDetail = null;
  try {
    builderDetail = await fetchBuilderDetails(normalizedBuilderSlug);
  } catch {
    builderDetail = null;
  }

  if (!builderDetail) {
    notFound();
  }

  return <BuilderPage builderDetail={builderDetail} />;
}
