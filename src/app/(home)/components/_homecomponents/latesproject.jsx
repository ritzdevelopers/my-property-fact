"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const properties = [
  {
    id: 1,
    title: "Eldeco Camelot",
    location: "Sector 17 Dwarka, Delhi",
    price: "₹ 7.42 Cr* Onwards",
    type: "3 BHK Premium",
    area: "2350 sq.ft",
    image:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200",
  },

  {
    id: 2,
    title: "Luxury Heights",
    location: "Gurgaon, Haryana",
    price: "₹ 5.90 Cr* Onwards",
    type: "4 BHK Luxury",
    area: "3100 sq.ft",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200",
  },

  {
    id: 3,
    title: "Skyline Residency",
    location: "Noida Extension",
    price: "₹ 3.20 Cr* Onwards",
    type: "2 BHK Premium",
    area: "1800 sq.ft",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200",
  },

  {
    id: 4,
    title: "Urban Nest",
    location: "South Delhi",
    price: "₹ 4.80 Cr* Onwards",
    type: "3 BHK Luxury",
    area: "2500 sq.ft",
    image:
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=1200",
  },
  {
    id: 5,
    title: "Skyline Residency",
    location: "South Delhi",
    price: "₹ 4.80 Cr* Onwards",
    type: "2 BHK Premium",
    area: "1800 sq.ft",
    image:
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=1200",
  },
];

export default function LatestProject() {
  return (
    <div className="container py-5">
      <Swiper
        modules={[Pagination, Autoplay]}
       
        // loop={true}
        // autoplay={{
        //   delay: 2500,
        //   disableOnInteraction: false,
        // }}
      
        breakpoints={{
          0: {
            slidesPerView: 1,
          },

          768: {
            slidesPerView: 1.5,
          },

          1200: {
            slidesPerView: 2.5,
          },
        }}
      >
        {properties.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="propertyCard">
                <img
                  src={item.image}
                  alt={item.title}
                  className="propertyImage"
                />
                
              <div className="propertyContent">
                <h3 className="headingtitle">{item.title}</h3>
                <p className="location">
                  <img src="/static/icon/map.png" alt="location"
                   className="location-icon" height={16} width={16} title="Map" /> 
                   {item.location}
                </p>
                <div className="price">
                  {item.price}
                </div>
                <h5 className="text-success">{item.type}</h5>
                <p className="area">{item.area}</p>
                <a href="#" className="viewBtn" title="View Projects">
                  View Projects →
                </a>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}