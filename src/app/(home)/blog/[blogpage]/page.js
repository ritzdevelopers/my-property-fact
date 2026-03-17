import axios from "axios";
import BlogDetail from "./blogpage";

export const dynamic = 'force-dynamic';

//fetch blog detail using slug
const fetchBlogDetail = async (url) => {
    //fetching blog detail from api using slug
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}blog/get/${url}`);    
    return response.data;
}

export async function generateMetadata({params}) {
    const { blogpage} = await params;
    const res = await fetchBlogDetail(blogpage);    
    return {
        title: res.blogTitle,
        description: res.blogMetaDescription,
        keywords: res.blogKeywords,
        alternates: {
            canonical: `/blog/${blogpage}`,
        },
    };
}

export default async function BlogPage({ params }) {
    const { blogpage } = await params;
    const blogDetail = await fetchBlogDetail(blogpage);
    return <BlogDetail blogDetail={blogDetail} />
}