import axios from "axios";
import LocationBenefit from "./locationBenefit";
import { fetchAllProjects } from "@/app/_global_components/masterFunction";
export const dynamic = "force-dynamic";

//Fetching all benefits list
const fetchAllBenefits = async () => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}location-benefit/get-all`,
  );
  const res = response.data;
  const list = res.map((item, index) => ({
    ...item,
    index: index + 1,
    id: item.projectId,
  }));
  return list;
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
