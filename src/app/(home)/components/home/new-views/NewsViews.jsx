import { fetchAllStories } from "@/app/_global_components/masterFunction";
import NewsAndViews from "./newsView";
export default async function NewsViews() {
  // Getting all stories 
  const stories = await fetchAllStories();
  // Getting home page stories
  const homePageStories = stories.slice(0, 4);
  return (
    <>
      <h2 className="text-center my-4 my-lg-5 plus-jakarta-sans-semi-bold">Realty Updates Web Stories</h2>
      <NewsAndViews webStoryList={homePageStories} />
    </>
  );
}
