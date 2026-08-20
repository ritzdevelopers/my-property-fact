import axios from "axios";
import Dashboard from "./dashboard";
import { fetchAllProjects } from "@/app/_global_components/masterFunction";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

async function cookieHeaderString() {
  try {
    const jar = await cookies();
    const all = jar.getAll();
    if (!all.length) return undefined;
    return all.map((c) => `${c.name}=${c.value}`).join("; ");
  } catch {
    return undefined;
  }
}

/** User + enquiry + all counts from backend unified dashboard-stats. */
const fetchDashboardStats = async () => {
  try {
    const cookie = await cookieHeaderString();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}admin/dashboard-stats`,
      {
        headers: cookie ? { Cookie: cookie } : {},
        cache: "no-store",
      },
    );
    if (!res.ok) {
      return {};
    }
    const data = await res.json();
    return {
      userCount: typeof data.userCount === "number" ? data.userCount : 0,
      enquiryCount: typeof data.enquiryCount === "number" ? data.enquiryCount : 0,
      projectCount: typeof data.projectCount === "number" ? data.projectCount : 0,
      blogCount: typeof data.blogCount === "number" ? data.blogCount : 0,
      blogCategoryCount: typeof data.blogCategoryCount === "number" ? data.blogCategoryCount : 0,
      cityCount: typeof data.cityCount === "number" ? data.cityCount : 0,
      builderCount: typeof data.builderCount === "number" ? data.builderCount : 0,
      amenityCount: typeof data.amenityCount === "number" ? data.amenityCount : 0,
      projectTypeCount: typeof data.projectTypeCount === "number" ? data.projectTypeCount : 0,
    };
  } catch {
    return {};
  }
};

export default async function DashboardPage() {
  const dashboardStats = await fetchDashboardStats();
  
  const noOfUsers = dashboardStats.userCount || 0;
  const noOfEnquiries = dashboardStats.enquiryCount || 0;
  const noOfProjects = dashboardStats.projectCount || 0;
  const noOfBlogs = dashboardStats.blogCount || 0;
  const noOfBlogCategories = dashboardStats.blogCategoryCount || 0;
  const noOfCities = dashboardStats.cityCount || 0;
  const noOfBuilders = dashboardStats.builderCount || 0;
  const noOfAmenities = dashboardStats.amenityCount || 0;
  const noOfProjectTypes = dashboardStats.projectTypeCount || 0;
  
  return <Dashboard 
    noOfProjects={noOfProjects}
    noOfUsers={noOfUsers}
    noOfBlogs={noOfBlogs}
    noOfBlogCategories={noOfBlogCategories}
    noOfEnquiries={noOfEnquiries}
    noOfCities={noOfCities}
    noOfBuilders={noOfBuilders}
    noOfAmenities={noOfAmenities}
    noOfProjectTypes={noOfProjectTypes}
  />
}
