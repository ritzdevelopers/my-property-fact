import ManageFaqs from "./manageFaq";
import { fetchAllProjects } from "@/app/_global_components/masterFunction";

export const dynamic = "force-dynamic";

const fetchProjects = async () => {
  const projectResponse = await fetchAllProjects();
  return projectResponse;
};

export default async function ManageFaqsPage() {
  const projectsList = await fetchProjects();
  return <ManageFaqs projectsList={projectsList} />;
}
