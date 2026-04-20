import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import BlogCard from "../../common/blogcard";
import "../../common/common.css";

export default function SocialFeed({ data }) {
  return (
    <div className="blog-section-container mt-2 mt-lg-4 pt-2 pb-4">
      <div className="container px-0">
        {!data?.length ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "250px" }}
          >
            <LoadingSpinner show={true} />
          </div>
        ) : (
          <>
            <h2 className="text-center mb-4">Investor Education Blog</h2>
            <div className="row investor-blog-grid mx-0">
              {data?.map((blog, index) => {
                if (index < 2) {
                  return (
                    <div
                      key={blog?.slugUrl ?? blog?.id ?? index}
                      className="col-12 col-md-6 col-lg-4 d-flex investor-blog-col"
                    >
                      <BlogCard blog={blog} />
                    </div>
                  );
                }

                if (index === 2) {
                  return (
                    <div
                      key={blog?.slugUrl ?? blog?.id ?? index}
                      className="col-12 col-md-6 col-lg-4 d-none d-lg-flex justify-content-between investor-blog-col"
                    >
                      <BlogCard blog={blog} />
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
