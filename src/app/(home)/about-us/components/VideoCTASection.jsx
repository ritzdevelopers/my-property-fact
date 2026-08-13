"use client";

import "./style/VideoCTASection.css";

const youtubeUrl =
  "https://www.youtube.com/embed/jKLAEVW-PGo?start=14&rel=0&modestbranding=1";

export default function VideoCTASection() {
  return (
    <section className="videoCTASection">
      <div className="videoCTAContainer">

        <div className="videoWrapper">
          <iframe
            src={youtubeUrl}
            title="My Property Fact Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        <div className="videoContent">
          <h2 className="videoTitle heading">
            <span>Turn Your Property Into An</span>
            <span>Opportunity</span>
          </h2>
        </div>

      </div>
    </section>
  );
}