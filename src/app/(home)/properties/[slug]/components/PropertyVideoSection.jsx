"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import { FaChevronUp, FaChevronDown } from "react-icons/fa";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./style/PropertyVideoSection.css";

const PropertyVideoSection = ({ videos = [] }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!videos || videos.length === 0) return null;

  return (
    <section
      id="video-section"
      className="property-video-section"
    >
      <div
        className="property-video-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3>Video</h3>

        <button
          type="button"
          className="video-toggle-btn"
        >
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {isOpen && (
        <div className="property-video-body">

          <Swiper
            modules={[Navigation, Pagination]}
            navigation={videos.length > 1}
            pagination={{
              clickable: true,
              type: "fraction",
            }}
            className="property-video-swiper"
          >
            {videos.map((video, index) => (
              <SwiperSlide key={index}>
                <div className="property-video-wrapper">

                  <video
                    controls
                    preload="metadata"
                    className="property-video-player"
                    poster={video.thumbnail || ""}
                  >
                    <source
                      src={video.videoUrl || video.url || video}
                      type="video/mp4"
                    />

                    Your browser does not support HTML5 video.
                  </video>

                </div>
              </SwiperSlide>
            ))}
          </Swiper>

        </div>
      )}
    </section>
  );
};

export default PropertyVideoSection;