import axios from "axios";
import ManageTestimonials from "./manageTestimonials";

export const dynamic = "force-dynamic";

const fetchTestimonials = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}testimonial/get-all`,
    );
    return response.data.map((item, index) => ({
      ...item,
      index: index + 1,
    }));
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return [];
  }
};

const fetchProjects = async () => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}projects`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

export default async function ManageTestimonialsPage() {
  const [list, projectsList] = await Promise.all([
    fetchTestimonials(),
    fetchProjects(),
  ]);
  return <ManageTestimonials list={list} projectsList={projectsList} />;
}
