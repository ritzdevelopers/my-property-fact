import axios from "axios";
import ManageProjects from "./manageProjects";
import { filterHiddenProjects } from "@/app/_global_components/hiddenBuilderUtils";

export const dynamic = "force-dynamic";

// Admin list must not use the public 60s project cache, or a slug change
// still shows the previous slug and edit requests a project that no longer exists.
const fetchProjectsWithDetail = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return [];
  const response = await fetch(`${apiUrl}projects`, { cache: "no-store" });
  if (!response.ok) return [];
  const data = await response.json();
  const list = filterHiddenProjects(Array.isArray(data) ? data : []);
  return list.map((item, index) => ({
    ...item,
    index: index + 1,
  }));
};

//Fetching all builder list from api
const fetchBuilders = async () => {
  const builders = await axios.get(
    process.env.NEXT_PUBLIC_API_URL + "builder/get-all",
  );
  return builders.data.builders;
};

//Fetching all types of projects
const fetchProjectTypes = async () => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}project-types/get-all`,
  );
  return response.data.filter(
    (item) => item.projectTypeName !== "New Launches",
  );
};

//Fetching all types of projects
const fetchProjectStatusList = async () => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}project-status`,
  );
  return response.data;
};

//Fetch all country with state and cities
const fetchCountryData = async () => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}country/get-all-countries`,
  );
  return response.data;
};
export default async function ManageProjectsPage() {
  const [
    builderList,
    typeList,
    countryData,
    projectDetailList,
    projectStatusList,
  ] = await Promise.all([
    fetchBuilders(),
    fetchProjectTypes(),
    fetchCountryData(),
    fetchProjectsWithDetail(),
    fetchProjectStatusList(),
  ]);
  return (
    <ManageProjects
      builderList={builderList}
      typeList={typeList}
      countryData={countryData}
      projectDetailList={projectDetailList}
      projectStatusList={projectStatusList}
    />
  );
}
