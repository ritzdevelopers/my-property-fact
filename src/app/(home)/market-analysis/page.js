import axios from "axios";
import MarketAnalysis from "./marketAnalysis";
import { fetchBlogs } from "@/app/_global_components/masterFunction";

// fetch all localities
const fetchAllLocalities = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    // Return empty array during build if API URL is not defined
    return [];
  }
  try {
    const localities = await axios.get(`${apiUrl}city/all`);
    const res = localities.data.map((item, index) => ({
      ...item,
      index: index + 1,
    }));
    return res;
  } catch (error) {
    // Return empty array on error during build
    return [];
  }
};

export default async function MarketAnalysisPage({ searchParams }) {
  const sp = await searchParams;
  const pageNum = Math.max(
    1,
    parseInt(String(sp?.page ?? "1"), 10) || 1,
  );
  const pageIndex = pageNum - 1;
  const size = 9;

  let blogsList = [];
  let totalPages = 0;
  try {
    const data = await fetchBlogs(pageIndex, size, "", "market");
    blogsList = data?.content ?? [];
    totalPages = data?.totalPages ?? 0;
  } catch {
    blogsList = [];
    totalPages = 0;
  }

  const localities = await fetchAllLocalities();
  return (
    <div>
      <MarketAnalysis
        localities={localities}
        initialBlogs={blogsList}
        initialTotalPages={totalPages}
        initialPage={pageIndex}
      />
    </div>
  );
}
