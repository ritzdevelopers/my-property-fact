import Featured from "./featured";

export default async function FeaturedPage({
  url,
  autoPlay,
  allFeaturedProperties = [],
  type,
  title,
  residentialProjects,
  commercialProjects,
}) {
  if (type === "Similar") {
    return (
      <Featured
        url={url}
        allProjects={allFeaturedProperties}
        autoPlay={autoPlay}
        type={type}
        badgeVariant={type === "Similar" ? "default" : "home-featured"}
        title={title}
      />
    );
  }
  return (
    <Featured
      url={url}
      allProjects={allFeaturedProperties}
      autoPlay={autoPlay}
      type={type}
      badgeVariant="home-featured"
      title={title}
      residentialProjects={residentialProjects}
      commercialProjects={commercialProjects}
    />
  );
}
