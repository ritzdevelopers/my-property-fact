"use client";
import Link from "next/link";
import { getLegacyWebStoryPath } from "@/lib/publicApiBase";
import "../new-views/newviews.css";

const STORY_COVER_IMAGES = [
  "/news-views/MPF_web stories-03.jpg",
  "/news-views/MPF_web stories-01.jpg",
  "/news-views/MPF_web stories-02.jpg",
  "/news-views/MPF_web stories-04.jpg",
];

export default function NewsAndViews({ webStoryList }) {
  const visibleStories = (Array.isArray(webStoryList) ? webStoryList : [])
    .filter((item) => item.webStories.length > 0)
    .sort((a, b) => {
      const aName = String(a?.categoryName || "").toLowerCase();
      const bName = String(b?.categoryName || "").toLowerCase();
      const aPriority = aName.includes("gst") && aName.includes("bullish") ? 0 : 1;
      const bPriority = bName.includes("gst") && bName.includes("bullish") ? 0 : 1;
      return aPriority - bPriority;
    })
    .slice(0, 4);

  return (
    <div className="container">
      <div className="row web-stories-container">
        {visibleStories.map((item, index) => {
            const storyCoverAlt = `${item.categoryName} — Realty Updates Web Stories cover image`;
            const localStoryCover = STORY_COVER_IMAGES[index % STORY_COVER_IMAGES.length];
            return (
            <div key={index} className="col-12 col-md-6 col-lg-3">
              <Link
                className="h-100 text-decoration-none text-dark shadow-sm"
                href={getLegacyWebStoryPath(item.categoryName)}
                title={`${item.categoryName} web story`}
              >
                <div className="flip-card">
                  <div className="flip-card-inner">
                    <div className="flip-card-front">
                      <img
                        src={localStoryCover}
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
          })}
      </div>
    </div>
  );
}
