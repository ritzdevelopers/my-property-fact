import { fetchBuilderDetails } from "@/app/_global_components/masterFunction";
import { notFound } from "next/navigation";
import BuilderPage from "./builderpage";

export const revalidate = 120;

//Generating metatitle and meta description
export async function generateMetadata({ params }) {
  const { buildername } = await params;
  let response = null;
  try {
    response = await fetchBuilderDetails(buildername);
  } catch {
    response = null;
  }

  if (!response) {
    return {
      title: "Builder Not Found | My Property Fact",
      description: "The requested builder page could not be found.",
      alternates: {
        canonical: `/builder/${buildername}`,
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
      canonical: `/builder/${buildername}`,
    },
  };
}

export default async function Builder({ params }) {
  const { buildername } = await params;
  let builderDetail = null;
  try {
    builderDetail = await fetchBuilderDetails(buildername);
  } catch {
    builderDetail = null;
  }

  if (!builderDetail) {
    notFound();
  }

  return <BuilderPage builderDetail={builderDetail} />;
}
