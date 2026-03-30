import Blog from "./blog";

export const metadata = {
  title: "Real Estate Blogs | Market Trends & Property Insights – MyPropertyFact",
  description: "Explore expert articles on real estate trends, property investment tips, and market insights across India. Stay informed with MyPropertyFact's latest blogs.",
  alternates: {
    canonical: "/blog",
  },
};
export default function BlogPage() {
  return (
    <>
      <Blog />
    </>
  );
}
