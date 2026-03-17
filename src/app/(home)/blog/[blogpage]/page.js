import axios from "axios";
import { notFound } from "next/navigation";
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
    let res = null;
    try {
      res = await fetchBlogDetail(blogpage);
    } catch {
      res = null;
    }

    if (!res) {
      return {
        title: "Blog Not Found | My Property Fact",
        description: "The requested blog article could not be found.",
        alternates: {
          canonical: `/blog/${blogpage}`,
        },
      };
    }

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
    let blogDetail = null;
    try {
      blogDetail = await fetchBlogDetail(blogpage);
    } catch {
      blogDetail = null;
    }

    if (!blogDetail) {
      notFound();
    }

    return <BlogDetail blogDetail={blogDetail} />
}