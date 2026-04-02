"use client";
import "./page.module.css";
import CommonHeaderBanner from "../components/common/commonheaderbanner";
import CommonBreadCrum from "../components/common/breadcrum";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import { Pagination, Stack } from "@mui/material";
import BlogCard from "../components/common/blogcard";

export default function MarketAnalysis({
  localities,
  initialBlogs = [],
  initialTotalPages = 0,
  initialPage = 0,
}) {
  const router = useRouter();
  const [blogsList, setBlogsList] = useState(initialBlogs);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  useEffect(() => {
    setBlogsList(initialBlogs);
    setPage(initialPage);
    setTotalPages(initialTotalPages);
    setLoading(false);
  }, [initialBlogs, initialTotalPages, initialPage]);

  const handlePageChange = (event, value) => {
    event.preventDefault();
    setLoading(true);
    router.push(
      value <= 1 ? "/market-analysis" : `/market-analysis?page=${value}`,
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <CommonHeaderBanner image={"blog-banner.jpg"} headerText={"Market Analysis"} />
      <CommonBreadCrum pageName={"Market Analysis"} />
      <div className="container-fluid mb-3">
        {/* <p className="text-center h2 mt-3">Blog</p> */}
        <div className="container-fluid d-flex justify-content-center gap-4 flex-wrap">
          {loading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "250px" }}
            >
              <LoadingSpinner show={loading} />
            </div>
          ) : (
            blogsList.map((blog, index) => (
              <BlogCard key={index} blog={blog} index={index} />
            ))
          )}
        </div>
      </div>
      <div className="d-flex justify-content-center align-items-center my-5">
        <Stack spacing={2}>
          <Pagination
            count={totalPages}
            page={page + 1}
            color="secondary"
            onChange={handlePageChange}
          />
        </Stack>
      </div>
    </>
  );
}
