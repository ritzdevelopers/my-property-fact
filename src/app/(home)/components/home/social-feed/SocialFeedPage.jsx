import { fetchLatestBlogs } from "@/app/_global_components/masterFunction";
import SocialFeed from "./socialfeed";

export default async function SocialFeedPage() {
  const forHome = await fetchLatestBlogs(3);

  if (forHome.length === 0) {
    return null;
  }

  return <SocialFeed data={forHome} />;
}
