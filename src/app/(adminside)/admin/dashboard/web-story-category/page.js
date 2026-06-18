import axios from "axios";
import WebStroyCategory from "./webStroyCategory";
export const dynamic = 'force-dynamic';

function getPublicUiOrigin() {
    const raw = process.env.NEXT_PUBLIC_UI_URL;
    const base = raw && String(raw).trim() ? String(raw).trim() : "https://mypropertyfact.in";
    return base.replace(/\/+$/, "");
}

//fetching web story category data
const fetchCategoryList = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}web-story-category/get-all`);
    const uiOrigin = getPublicUiOrigin();
    const res = response.data.map((item, index)=> ({
        ...item,
        noOfStories: item.webStories.length,
        index: index + 1,
        storyUrl: item?.categoryName ? `${uiOrigin}/stories/${String(item.categoryName).trim()}` : ""
    }))
    return res;
}

export default async function WebStoryCategoryPage() {
    const list = await fetchCategoryList();
    return (
        <WebStroyCategory list={list}/>
    )
}