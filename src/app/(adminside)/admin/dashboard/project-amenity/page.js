import axios from "axios";
import ProjectsAmenity from "./projectAmenity";
import { fetchAllProjects } from "@/app/_global_components/masterFunction";
export const dynamic = "force-dynamic";
//Fetch all project amenity from api
const fetchPrjectsAmenity = async () => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}project-amenity/all`,
  );
  const list = response.data.map((item, index) => ({
    ...item,
    id: item.projectId,
    index: index + 1,
  }));
  return list;
};

//Fetch all project list from api
const fetchProjects = async () => {
  const projectResponse = await fetchAllProjects();
  return projectResponse.map((item, index) => ({
    ...item,
    index: index + 1,
  }));
};

//Fetch all project list from api
const fetchAmenityList = async () => {
  const projectResponse = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}amenity/get-all`,
  );
  return projectResponse.data;
};

export default async function ProjectsAmenityPage() {
  const [projectsList, amenityList, projectsWithAmenity] = await Promise.all([
    fetchProjects(),
    fetchAmenityList(),
    fetchPrjectsAmenity(),
  ]);
  const projectIdsWithAmenity = projectsWithAmenity.map((item) => item.projectId);
  return (
    <ProjectsAmenity
      projectList={projectsList}
      amenityList={amenityList}
      projectIdsWithAmenity={projectIdsWithAmenity}
    />
  );
}
