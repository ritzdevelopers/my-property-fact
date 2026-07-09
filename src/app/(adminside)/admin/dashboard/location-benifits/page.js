import LocationBenefit from "./locationBenefit";
import { fetchAllProjects } from "@/app/_global_components/masterFunction";

export const dynamic = "force-dynamic";

const fetchAllBenefits = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error("NEXT_PUBLIC_API_URL is not defined");
    return [];
  }
  try {
    const response = await fetch(`${apiUrl}location-benefit/get-all`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch location benefits (${response.status})`);
    }
    const res = await response.json();
    if (!Array.isArray(res)) return [];
    return res.map((item, index) => ({
      ...item,
      index: index + 1,
      id: item.projectId,
    }));
  } catch (error) {
    console.error("Error fetching location benefits:", error);
    return [];
  }
};

//Fetching all projects list
const fetchProjects = async () => {
  const projectResponse = await fetchAllProjects();
  return projectResponse;
};
export default async function LocationBenefitPage() {
  const [list, projectsList] = await Promise.all([
    fetchAllBenefits(),
    fetchProjects(),
  ]);
  return <LocationBenefit list={list} projectList={projectsList} />;
}
