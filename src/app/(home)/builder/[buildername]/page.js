import { fetchBuilderDetails } from "@/app/_global_components/masterFunction";
import BuilderPage from "./builderpage";

//Generating metatitle and meta description
export async function generateMetadata({ params }) {
  const { buildername } = await params;
  const response = await fetchBuilderDetails(buildername);
  return {
    title: response.metaTitle,
    description: response.metaDescription,
    keywords: response.metaKeywords,
    alternates: {
      canonical: `/builder/${buildername}`,
    },
  };
}

export default async function Builder({ params }) {
  const { buildername } = await params;
  const builderDetail = await fetchBuilderDetails(buildername);
  return <BuilderPage builderDetail={builderDetail} />
}
