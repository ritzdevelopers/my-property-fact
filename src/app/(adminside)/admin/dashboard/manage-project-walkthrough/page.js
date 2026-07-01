import axios from "axios";
import ManageProjectWalkthrough from "./manageProjectWalkthrough";
import { fetchAllProjects } from "@/app/_global_components/masterFunction";

export const dynamic = "force-dynamic";

const stripHtml = (html = "") =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const toPreview = (html = "") => {
  const plainText = stripHtml(html);
  if (!plainText) return "";
  return plainText.length > 120 ? `${plainText.slice(0, 120)}...` : plainText;
};

const fetchProjects = async () => {
  try {
    const projectResponse = await fetchAllProjects();
    const walkthroughResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}project-walkthrough/get`,
    );
    const walkthroughData = Array.isArray(walkthroughResponse.data)
      ? walkthroughResponse.data
      : [];
    const list = walkthroughData.map((item, index) => ({
      id: item.id,
      projectId: item.projectId,
      projectName: item.projectName,
      walkthroughDesc: toPreview(item.walkthroughDesc),
      index: index + 1,
    }));
    return [list, projectResponse];
  } catch (error) {
    console.error("Failed to load project walkthrough page data:", error);
    return [[], []];
  }
};

export default async function ManageProjectWalkthroughPage() {
  const [list, projectsList] = await fetchProjects();
  const projectWithWalkthrough = list.map((item) => item.projectId);
  return (
    <ManageProjectWalkthrough
      list={list}
      projectList={projectsList}
      projectWithWalkthrough={projectWithWalkthrough}
    />
  );
}
