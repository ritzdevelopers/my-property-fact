"use client";

import React from "react";
// Image imports
import gymImg from "../assets/AMTY/GYM.png";
import Banquet_Hall from "../assets/AMTY/Banquet_Hall.png";
import Board_Games_Area from "../assets/AMTY/Board_Games_Area.jpg";
import Cabanas from "../assets/AMTY/Cabanas.png";
import Central_Lawn from "../assets/AMTY/Central_Lawn.png";
import Infinity_Pool_icon from "../assets/AMTY/Infinity_Pool_icon.png";
import Jogging_Track from "../assets/AMTY/Jogging_Track.png";
import Kids_Play_Zone from "../assets/AMTY/Kids_Play_Zone.png";
import Low_Density_Living from "../assets/AMTY/Low_Density_Living.png";
import Meditation_Garden from "../assets/AMTY/Meditation_Garden.png";
import Mini_Theatre from "../assets/AMTY/Mini_Theatre.png";

const amenities = [
  {
    title: "Infinity Swimming Pool",
    description:
      "Unwind with breathtaking views in our luxurious rooftop infinity pool.",
    image: Infinity_Pool_icon,
  },
  {
    title: "Clubhouse",
    description:
      "A vibrant social hub with lounge, café, library, and indoor games for community bonding.",
    image: Low_Density_Living,
  },
  {
    title: "Gym",
    description:
      "Fully-equipped modern fitness center designed to support your active lifestyle.",
    image: gymImg,
  },
  {
    title: "Mini Theatre",
    description:
      "Enjoy movie nights and private screenings with family in a cozy mini theatre.",
    image: Mini_Theatre,
  },
  {
    title: "Meditation Garden",
    description:
      "Find inner peace in our serene meditation garden surrounded by nature.",
    image: Meditation_Garden,
  },
  {
    title: "Jogging Track",
    description:
      "Stay fit with our dedicated jogging path set amidst lush green landscapes.",
    image: Jogging_Track,
  },
  {
    title: "Kids Play Zone",
    description:
      "Safe and colorful play area where children can explore, play, and grow.",
    image: Kids_Play_Zone,
  },
  {
    title: "Central Lawn",
    description:
      "Expansive central green for outdoor gatherings, leisure, and community events.",
    image: Central_Lawn,
  },
  {
    title: "Banquet Hall",
    description:
      "Elegant venue for family functions, celebrations, and special occasions.",
    image: Banquet_Hall,
  },
  {
    title: "Cabanas",
    description:
      "Private cabanas by the poolside offer a perfect space to relax and socialize.",
    image: Cabanas,
  },
  {
    title: "Board Games Area",
    description:
      "Fun and engaging space for indoor board games, perfect for all age groups.",
    image: Board_Games_Area,
  },
];

export default function AmenitiesSection() {
  const openPopup = () => {
    window.dispatchEvent(new Event("openPopup"));
  };

  return (
    <section className="py-5 bg-white" id="amenities">
      <div className="container text-center">
        {/* Section Header */}
        <p className="fs-4 text-secondary mb-2">
          Amenities
          <span
            className="d-block mx-auto mt-2"
            style={{
              width: "80px",
              height: "4px",
              backgroundColor: "#A8BE04",
            }}
          ></span>
        </p>
        <h2 className="fw-bold display-5 text-dark mb-5">
          Everything You Need. Thoughtfully Designed.
        </h2>

        {/* Amenity Grid - First 8 */}
        <div className="row g-4 mb-5">
          {amenities.slice(0, 8).map((item, index) => (
            <div key={index} className="col-12 col-sm-6 col-lg-3">
              <div
                className="card h-100 text-center align-items-center shadow-sm border-0 p-3"
                style={{
                  transition: "transform 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 0.5rem 1rem rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 .125rem .25rem rgba(0,0,0,.075)";
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  width={100}
                  height={100}
                  className="mb-3 object-fit-contain"
                  style={{ transition: "transform 0.3s" }}
                />
                <h5 className="fw-semibold  mb-2" style={{ color: "#587B89" }}>
                  {item.title}
                </h5>
                <p className="text-muted small">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Remaining 3 Amenities Centered */}
        <div className="row justify-content-center g-4 mb-5">
          {amenities.slice(-3).map((item, index) => (
            <div key={index} className="col-12 col-md-6 col-lg-4">
              <div
                className="card h-100 text-center align-items-center shadow-sm border-0 p-3"
                style={{
                  transition: "transform 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 0.5rem 1rem rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 .125rem .25rem rgba(0,0,0,.075)";
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  width={100}
                  height={100}
                  className="mb-3 object-fit-contain"
                  style={{ transition: "transform 0.3s" }}
                />
                <h5 className="fw-semibold  mb-2" style={{ color: "#587B89" }}>
                  {item.title}
                </h5>
                <p className="text-muted small">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          className="btn text-white fs-5 fw-semibold px-5 py-3 shadow"
          style={{
            backgroundColor: "#A8BE04",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#94a503")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#A8BE04")
          }
          onClick={openPopup}
        >
          Explore All Features
        </button>
      </div>
    </section>
  );
}
