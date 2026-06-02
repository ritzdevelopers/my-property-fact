import axios from "axios";
import { getWebStoryApiUrl } from "@/lib/publicApiBase";
import WebStroyCategory from "./webStroyCategory";
export const dynamic = 'force-dynamic';

//fetching web story category data
const fetchCategoryList = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}web-story-category/get-all`);
    const res = response.data.map((item, index)=> ({
        ...item,
        noOfStories: item.webStories.length,
        index: index + 1,
        storyUrl: getWebStoryApiUrl(item.categoryName),
    }))
    return res;
}

export default async function WebStoryCategoryPage() {
    const list = await fetchCategoryList();
    return (
        <WebStroyCategory list={list}/>
    )
}