"use client";
import "./page.module.css";
import CommonHeaderBanner from "../components/common/commonheaderbanner";
import CommonBreadCrum from "../components/common/breadcrum";
import { useEffect, useState } from "react";
import axios from "axios";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import { Pagination, Stack } from "@mui/material";
import BlogCard from "../components/common/blogcard";
export default function MarketAnalysis() {
  // defining state for list of blogs
  const [blogsList, setBlogsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(9);
  const [totalPages, setTotalPages] = useState(0);
  //fetching all blogs list
  const getBlogsList = async () => {
    // fetching blogs list from api
    try {
      const response = await axios.get(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }blog/get?page=${page}&size=${size}&from=${'market'}`
      );
      setBlogsList(response.data.content);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      // Error handled silently - user will see empty results
    }
  };
  useEffect(() => {
    getBlogsList();
  }, [page]);

  // Handle page change from pagination
  const handlePageChange = (event, value) => {
    event.preventDefault();
    setPage(value - 1); // update page state, which triggers useEffect
    setLoading(true);
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
