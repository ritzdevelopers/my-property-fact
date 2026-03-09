"use client";
import styles from "./page.module.css";
import CommonHeaderBanner from "../components/common/commonheaderbanner";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import { Pagination, Stack } from "@mui/material";
import BlogListItem from "../components/common/BlogListItem";
import BlogSidebar from "../components/common/BlogSidebar";
import BlogFaqSection from "../components/common/BlogFaqSection";
import SocialFeed from "../components/home/social-feed/socialfeed";
import SocialFeedsOfMPF from "../components/_homecomponents/SocialFeedsOfMPF";
import PopularCitiesSection from "../components/home/popular-cities/PopularCitiesSection";
import { fetchBlogs } from "@/app/_global_components/masterFunction";
export default function Blog() {
  // defining state for list of blogs
  const [blogsList, setBlogsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(3);
  const [investorBlogs, setInvestorBlogs] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const faqItems = [
    {
      q: "What kind of property types are available on My Property Fact?",
      a: "My Property Fact has a vast range of property types, ranging from 2 BHK, 3 BHK residential properties to commercial properties like office spaces and shops in prime areas of Delhi NCR, Noida, Greater Noida, and pan India level. Whether you are looking to buy, rent, or invest, we have something for everyone.",
    },
    {
      q: "How can I get the best 2 BHK or 3 BHK apartments on My Property Fact?",
      a: "Getting your dream 2 BHK or 3 BHK apartments is easy with My Property Fact. We have the best filters available for budget, location. Whether you are searching for a residential property in Noida, Greater Noida, or other areas of Delhi NCR, our website will provide you with the best options available.",
    },
    {
      q: "Can My Property Fact help with commercial real estate?",
      a: "Yes, we have listings for commercial properties, such as offices and retail shops, in Delhi NCR, including Noida and Greater Noida, and other cities across India.",
    },
    {
      q: "Does My Property Fact include Tier 1, Tier 2, and Tier 3 cities?",
      a: "Yes, My Property Fact includes properties in Tier 1, Tier 2, and Tier 3 cities in India. Whether you are looking for the best properties in Delhi, budget-friendly options in Noida and Pune, or investment opportunities in Indore and Bhopal, we have a vast array of properties for you.",
    },
  ];
  //fetching all blogs list
  const getBlogsList = async () => {
    const blogsList = await fetchBlogs(page, size, "");
    setBlogsList(blogsList.content);
    setTotalPages(blogsList.totalPages);
    setLoading(false);
  };

  useEffect(() => {
    getBlogsList();
  }, [page]);
  useEffect(() => {
    const loadInvestorBlogs = async () => {
      try {
        const latest = await fetchBlogs(0, 4);
        setInvestorBlogs(latest.content || []);
      } catch {}
    };
    loadInvestorBlogs();
  }, []);

  // Handle page change from pagination
  const handlePageChange = (event, value) => {
    event.preventDefault();
    setPage(value - 1); // update page state, which triggers useEffect
    setLoading(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handling search for the blogs
  const handleSearch = async (e) => {
    setIsSearch(true);
    const searchQuery = e.target.value;
    const blogs = await fetchBlogs(page, size, "search");
    const filteredBlogs = blogs.content.filter((blog) =>
      blog.blogTitle.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setLoading(false);
  };

  return (
    <>
      <CommonHeaderBanner
        image={"blog-banner.jpg"}
        headerText={"Blog"}
        pageName={"Blog"}
      />
      <div className="container d-block d-lg-none my-3">
        <BlogSidebar showSearch={true} showRecentPosts={false} showLatestProperty={false} />
      </div>
      {/* <CommonBreadCrum pageName={"Blog"} /> */}
      <div className={`container my-3 my-lg-5 ${styles.blogSectionWrap}`}>
        <div className={`row gy-4 ${styles.blogContentRow}`}>
          <div className="col-lg-8 align-items-center">
            {loading ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "250px" }}
              >
                <LoadingSpinner show={loading} />
              </div>
            ) : (
              (blogsList || []).map((blog, index) => (
                <BlogListItem key={index} blog={blog} />
              ))
            )}
          </div>
          <div className={`col-lg-4 d-none d-lg-block ${styles.blogSidebarCol}`}>
            <div className={styles.blogRightSticky}>
              <BlogSidebar />
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-center align-items-center my-5 container">
        <Stack spacing={2}>
          <Pagination
            count={totalPages}
            page={page + 1}
            variant="outlined"
            shape="rounded"
            boundaryCount={1}
            siblingCount={1}
            className="blog-pagination"
            onChange={handlePageChange}
          />
        </Stack>
      </div>
      <div className="container d-block d-lg-none my-4 blog-mobile-sidebar-wrap">
        <BlogSidebar showSearch={false} showRecentPosts={true} showLatestProperty={true} />
      </div>
      <BlogFaqSection faqItems={faqItems} />
      {investorBlogs.length > 0 && <SocialFeed data={investorBlogs} />}
      <SocialFeedsOfMPF />
      <PopularCitiesSection />
    </>
  );
}
