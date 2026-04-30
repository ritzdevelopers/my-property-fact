import { redirect } from "next/navigation";

export default async function LegacyWebStoryPage({ params }) {
  const { slug } = await params;
  redirect(`/stories/${slug}`);
}
