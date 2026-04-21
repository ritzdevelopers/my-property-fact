"use client";

import styles from "./page.module.css";
import CommonHeaderBanner from "../components/common/commonheaderbanner";
import { useLayoutEffect, useEffect, useState } from "react";
import { Pagination, Stack } from "@mui/material";
import BlogListItem from "../components/common/BlogListItem";
import BlogSidebar from "../components/common/BlogSidebar";
import BlogFaqSection from "../components/common/BlogFaqSection";
import SocialFeedsOfMPF from "../components/_homecomponents/SocialFeedsOfMPF";
import PopularCitiesSection from "../components/home/popular-cities/PopularCitiesSection";
import LeadFormPopupTrigger from "../components/_homecomponents/LeadFormPopupTrigger";
import { useRouter } from "next/navigation";

export default function Blog({
  initialBlogs = [],
  initialPageIndex = 0,
  totalPages = 1,
  sidebarRecentPosts = [],
  sidebarLatestProject = null,
}) {
  const router = useRouter();
  const [blogsList, setBlogsList] = useState(initialBlogs);
  /** Match MUI Pagination (1-based) */
  const [page, setPage] = useState(initialPageIndex + 1);
  const [pageCount, setPageCount] = useState(totalPages);

  const [isLgUp, setIsLgUp] = useState(false);

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

  useEffect(() => {
    setBlogsList(initialBlogs);
    setPage(initialPageIndex + 1);
    setPageCount(totalPages);
  }, [initialBlogs, initialPageIndex, totalPages]);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(min-width: 992px)");
    const sync = () => setIsLgUp(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const handlePageChange = (event, value) => {
    event.preventDefault();
    setPage(value);
    const next = Math.max(1, value);
    router.push(next <= 1 ? "/blog" : `/blog?page=${next}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <CommonHeaderBanner
        image={"blog-banner.jpg"}
        headerText={"Blog"}
        pageName={"Blog"}
      />
      {!isLgUp && (
        <div className="container my-3">
          <BlogSidebar
            showSearch={true}
            showRecentPosts={false}
            showLatestProperty={false}
            initialRecentPosts={sidebarRecentPosts}
            initialLatestProject={sidebarLatestProject}
          />
        </div>
      )}
      <section
        className={`container my-3 my-lg-5 ${styles.blogSectionWrap}`}
        aria-labelledby="investor-education-blog-heading"
      >
        <h2
          id="investor-education-blog-heading"
          className={`${styles.blogPageSectionHeading} mb-3 mb-md-4 mt-3`}
        >
          Investor Education Blog
        </h2>
        <div className={`row gy-4 ${styles.blogContentRow}`}>
          <div className="col-lg-8 align-items-center">
            {(blogsList || []).map((blog, index) => (
              <BlogListItem
                key={blog?.slugUrl ?? blog?.id ?? index}
                blog={blog}
              />
            ))}
            <div className="d-flex justify-content-center align-items-center my-5">
              <Stack spacing={2}>
                <Pagination
                  count={pageCount}
                  page={page}
                  variant="outlined"
                  shape="rounded"
                  boundaryCount={1}
                  siblingCount={1}
                  className="blog-pagination"
                  onChange={handlePageChange}
                />
              </Stack>
            </div>
          </div>
          {isLgUp && (
            <div className={`col-lg-4 ${styles.blogSidebarCol}`}>
              <div className={styles.blogRightSticky}>
                <BlogSidebar
                  initialRecentPosts={sidebarRecentPosts}
                  initialLatestProject={sidebarLatestProject}
                />
              </div>
            </div>
          )}
        </div>
      </section>
      {!isLgUp && (
        <div className="container my-4 blog-mobile-sidebar-wrap">
          <BlogSidebar
            showSearch={false}
            showRecentPosts={true}
            showLatestProperty={true}
            initialRecentPosts={sidebarRecentPosts}
            initialLatestProject={sidebarLatestProject}
          />
        </div>
      )}
      <BlogFaqSection faqItems={faqItems} />
      <SocialFeedsOfMPF />
      <PopularCitiesSection />
      <LeadFormPopupTrigger />
    </>
  );
}
