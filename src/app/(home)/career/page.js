import Career from "./career";
import data from "../../_global_components/job-description.json";
export const metadata = {
  title: "Careers at MyPropertyFact | Join Our Real Estate Innovation Team",
  description:
    "Explore exciting career opportunities at MyPropertyFact. Join a passionate team shaping the future of real estate data, insights, and technology in India.",
  alternates: {
    canonical: "/career",
  },
};

export default function CareerPage() {
  return (
    <main id="primary-content" aria-labelledby="mpf-page-heading">
      <Career jobsArr={data} />
    </main>
  );
}
