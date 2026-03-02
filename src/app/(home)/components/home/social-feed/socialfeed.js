import { LoadingSpinner } from "@/app/(home)/contact-us/page";
import BlogCard from "../../common/blogcard";
import "../../common/common.css";

export default function SocialFeed({ data }) {
  // Returning the social feed section
  return (
    <div className="blog-section-container mt-4 my-lg-5 py-4">
      <div className="container">
        <h2 className="text-center mb-3 plus-jakarta-sans-semi-bold">Investor Education Blog</h2>
        {data?.length < 0 ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "250px" }}
          >
            <LoadingSpinner show={true} />
          </div>
        ) : (
          <div className="container">
            <div className="row investor-blog-grid">
              {data?.map((blog, index) => {
                // Always show first two cards
                if (index < 2) {
                  return (
                    <div
                      key={index}
                      className="col-12 col-md-6 col-lg-4 d-flex investor-blog-col"
                    >
                      <BlogCard blog={blog} />
                    </div>
                  );
                }

                // Show the 3rd card only on large screens and up
                if (index === 2) {
                  return (
                    <div
                      key={index}
                      className="col-12 col-md-6 col-lg-4 d-none d-lg-flex justify-content-between investor-blog-col"
                    >
                      <BlogCard blog={blog} />
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
