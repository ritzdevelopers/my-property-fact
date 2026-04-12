import axios from "axios";
import ManageBlogs from "./manageBlogs";
export const dynamic = 'force-dynamic';

/** Same date semantics as manageBlogs.js parseBlogDate — for sort key only */
function blogCreatedAtMs(value) {
    if (value == null) return 0;
    if (typeof value === "string") {
        const t = new Date(value).getTime();
        return Number.isNaN(t) ? 0 : t;
    }
    if (Array.isArray(value) && value.length >= 3) {
        const [y, m, d, h = 0, min = 0, s = 0] = value;
        return new Date(y, m - 1, d, h, min, s).getTime();
    }
    return 0;
}

//Fetching all blogs list from api (newest first on the client)
const fetchBlogList = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}blog/get-all`);
    const data = Array.isArray(response.data) ? [...response.data] : [];
    data.sort((a, b) => blogCreatedAtMs(b.createdAt) - blogCreatedAtMs(a.createdAt));
    const res = data.map((item, index) => ({
        ...item,
        index: index + 1
    }));
    return res;
}
//Fetching all blogs categories
const fetchBlogCategory = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}blog-category/get-all`);
    return response.data;
}
//Fetching all cities categories
const fetchCities = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}city/all`);
    return response.data;
}
export default async function ManageBlogPage() {
    const [list, categoryList, cityList] = await Promise.all([
        fetchBlogList(),
        fetchBlogCategory(),
        fetchCities()
    ]);
    return <ManageBlogs list={list} categoryList={categoryList} cityList={cityList}/>
}