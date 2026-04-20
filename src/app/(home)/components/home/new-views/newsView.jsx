"use client";
import Image from "next/image";
import Link from "next/link";
import "../new-views/newviews.css";

export default function NewsAndViews({ webStoryList }) {
  return (
    <div className="container">
      <div className="row web-stories-container">
        {webStoryList
          .filter((item) => item.webStories.length > 0)
          .map((item, index) => {
            const storyCoverAlt = `${item.categoryName} — Realty Updates Web Stories cover image`;
            return (
            <div key={index} className="col-12 col-md-6 col-lg-3">
              <Link
                className="h-100 text-decoration-none text-dark shadow-sm"
                href={`${process.env.NEXT_PUBLIC_API_URL}web-story/${item.categoryName}`}
                title={`${item.categoryName} web story`}
              >
                <div className="flip-card">
                  <div className="flip-card-inner">
                    <div className="flip-card-front">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}web-story/${item.storyCategoryImage}`}
                        alt={storyCoverAlt}
                        title={storyCoverAlt}
                        width={384}
                        height={683}
                        className="card-img-top img-fluid"
                      />
                      <div className="title-3d">
                        <h3 className="text-center m-0 px-1 py-1 title-3d-heading">
                          {item.categoryName}
                        </h3>
                      </div>
                    </div>
                    <div className="flip-card-back">
                      <p className="flip-card-back-title m-0">
                        {item.categoryName}
                      </p>
                      <p>{item.categoryDescription}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
            );
          })
          .slice(0, 4)}
      </div>
    </div>
  );
}
