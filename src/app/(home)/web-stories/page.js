import axios from "axios";
import WebStories from "./webStories";
export const dynamic = 'force-dynamic';

export const metadata = {
    title:
      "Web Stories | MyPropertyFact",
    description:
      "Explore flats, residential & commercial properties across India on MyPropertyFact: NCR, Delhi, Faridabad, Noida, & top Indian cities with verified listings and top developers",
     keywords:["real estate India","property insights","real estate trends","investment property","LOCATE score","smart real estate decisions","property investment tips","real estate guide India"],
      alternates: {
      canonical: "/web-stories",
    },
  };
//fetch all web stories topics
const fetchAllStoryTopics = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}web-story-category/get-all`);
    return response.data;
}

export default async function WebStoriesPage(){
    const webStoryList = await fetchAllStoryTopics();
    return(
        <>
            <WebStories webStoryList={webStoryList}/>
        </>
    )
}