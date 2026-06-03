import Projects from "./projects";
import { Suspense } from "react";

export const metadata = {
  title:
    "Explore Real Estate Projects | New & Upcoming Properties - MyPropertyFact",
  description:
    "Browse top residential and commercial real estate projects across India. Discover new launches, ongoing developments, and upcoming properties with MyPropertyFact.",
  alternates: {
    canonical: "/projects",
  },
};

function ProjectsFallback() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "550px" }}>
      <div className="text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading projects...</span>
        </div>
        <p className="mt-3 text-muted">Loading projects...</p>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <main id="primary-content" aria-labelledby="mpf-page-heading">
      <Suspense fallback={<ProjectsFallback />}>
        <Projects />
      </Suspense>
    </main>
  );
}
