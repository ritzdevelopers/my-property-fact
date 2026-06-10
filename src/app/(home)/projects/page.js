import Projects from "./projects";

export const metadata = {
  title:
    "Explore Real Estate Projects | New & Upcoming Properties - MyPropertyFact",
  description:
    "Browse top residential and commercial real estate projects across India. Discover new launches, ongoing developments, and upcoming properties with MyPropertyFact.",
  alternates: {
    canonical: "/projects",
  },
};

export default function ProjectsPage() {
  return (
    <main id="primary-content" aria-labelledby="mpf-page-heading">
      <Projects />
    </main>
  );
}
