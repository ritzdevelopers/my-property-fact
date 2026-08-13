import { fetchCityData, fetchProjectTypes } from "@/app/_global_components/masterFunction";
import Footer from "./footer";

export default async function FooterPage() {
    const [cities, projectTypes] = await Promise.all([
      fetchCityData(),
      fetchProjectTypes(),
    ]);
  return <Footer cityList={cities} projectTypes={projectTypes} />;
}
