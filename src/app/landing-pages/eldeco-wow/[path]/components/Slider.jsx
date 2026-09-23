"use client";
import { useState, useEffect, useRef } from "react";

const sliderCards = [
  {
    id: 1,
    image: "/images/slider/slideri1.png",
    text: "Mature brand with a strong delivery record",
  },
  {
    id: 2,
    image: "/images/slider/slideri2.png",
    text: "Large, usable podium greens (kids play, pet-friendly pockets, sit-outs)",
  },
  {
    id: 3,
    image: "/images/slider/slideri3.png",
    text: "Amenity planning that balances leisure, wellness, and productivity",
  },
  {
    id: 4,
    image: "/images/slider/slideri2.png",
    text: "Large, usable podium greens (kids play, pet-friendly pockets, sit-outs)",
  },
  {
    id: 5,
    image: "/images/slider/slideri1.png",
    text: "Strategic location with long-term infrastructure tailwinds",
  },
];

export default function Slider() {
  const sliderRef = useRef(null);
  // 👇 default activeIndex = 1 (means second card center me show hoga)
  const [activeIndex, setActiveIndex] = useState(1);

  // Scroll to active card and keep it centered
useEffect(() => {
  if (sliderRef.current) {
    const card = sliderRef.current.children[activeIndex];
    if (card) {
      sliderRef.current.scrollTo({
        left: card.offsetLeft - sliderRef.current.offsetWidth / 2 + card.offsetWidth / 2,
        behavior: "smooth",
      });
    }
  }
}, [activeIndex]);


  // Auto slide every 3 sec
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) =>
        prev === sliderCards.length - 1 ? 0 : prev + 1
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setActiveIndex((prev) =>
      prev === sliderCards.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    setActiveIndex((prev) =>
      prev === 0 ? sliderCards.length - 1 : prev - 1
    );
  };

  return (
    <div className="position-relative w-100 py-5">
      {/* Slider Track */}
      <div
        ref={sliderRef}
        className="d-flex overflow-x-auto scroll-smooth gap-3 elementclass"
        style={{ scrollBehavior: "smooth" }}
      >
        {sliderCards.map((card) => (
          <div
            key={card.id}
            className="slider-card d-flex flex-column align-items-center bg-white text-black h-auto h-lg-478 flex-shrink-0"
            style={{
              width: "598px",
              maxWidth: "100%",
              scrollSnapAlign: "center",
            }}
          >
            <img
              src={card.image}
              className="w-100 h-auto h-lg-408"
              alt={card.text} title={card.text}
              style={{ objectFit: "cover" }}
            />
            <div className="w-100 text-center p-2" style={{ maxWidth: "428px" }}>
              <p
                style={{
                  fontFamily: "moster_regular",
                  fontWeight: "400",
                  fontSize: "clamp(16px, 2vw, 20px)",
                }}
              >
                {card.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <div>
        <div className="d-none d-lg-flex mt-4 justify-content-center align-items-center gap-3">
          <button onClick={handlePrev} className="slider-nav-button border-0" style={{ backgroundColor: "white", borderRadius: "50%" }}>
            
<svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.939522 10.9393C0.353735 11.5251 0.353735 12.4749 0.939522 13.0607L10.4855 22.6066C11.0712 23.1924 12.021 23.1924 12.6068 22.6066C13.1926 22.0208 13.1926 21.0711 12.6068 20.4853L4.1215 12L12.6068 3.51472C13.1926 2.92893 13.1926 1.97919 12.6068 1.3934C12.021 0.807611 11.0712 0.807611 10.4855 1.3934L0.939522 10.9393ZM32.0002 12V10.5L2.00018 10.5V12V13.5L32.0002 13.5V12Z" fill="black"/>
</svg>

          </button>
          <button onClick={handleNext} className="slider-nav-button border-0" style={{ backgroundColor: "white", borderRadius: "50%" }}>
            
<svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M31.0605 10.9393C31.6463 11.5251 31.6463 12.4749 31.0605 13.0607L21.5145 22.6066C20.9288 23.1924 19.979 23.1924 19.3932 22.6066C18.8074 22.0208 18.8074 21.0711 19.3932 20.4853L27.8785 12L19.3932 3.51472C18.8074 2.92893 18.8074 1.97919 19.3932 1.3934C19.979 0.807611 20.9288 0.807611 21.5145 1.3934L31.0605 10.9393ZM-0.000183105 12L-0.000183105 10.5L29.9998 10.5V12V13.5L-0.000183105 13.5L-0.000183105 12Z" fill="black"/>
</svg>

          </button>
        </div>

        <div className="d-flex d-lg-none">
          <button
            onClick={handlePrev}
            className="border-0"
            style={{
              position: "absolute",
              top: "43%",
              left: "10px",
              transform: "translateY(-50%)",
              backgroundColor: "white",
              borderRadius: "50%",
              padding: "8px",
            }}
          >
            
<svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.939522 10.9393C0.353735 11.5251 0.353735 12.4749 0.939522 13.0607L10.4855 22.6066C11.0712 23.1924 12.021 23.1924 12.6068 22.6066C13.1926 22.0208 13.1926 21.0711 12.6068 20.4853L4.1215 12L12.6068 3.51472C13.1926 2.92893 13.1926 1.97919 12.6068 1.3934C12.021 0.807611 11.0712 0.807611 10.4855 1.3934L0.939522 10.9393ZM32.0002 12V10.5L2.00018 10.5V12V13.5L32.0002 13.5V12Z" fill="black"/>
</svg>

          </button>
          <button
            onClick={handleNext}
            className="border-0"
            style={{
              position: "absolute",
              top: "43%",
              right: "10px",
              transform: "translateY(-50%)",
              backgroundColor: "white",
              borderRadius: "50%",
              padding: "8px",
            }}
          >
            
<svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M31.0605 10.9393C31.6463 11.5251 31.6463 12.4749 31.0605 13.0607L21.5145 22.6066C20.9288 23.1924 19.979 23.1924 19.3932 22.6066C18.8074 22.0208 18.8074 21.0711 19.3932 20.4853L27.8785 12L19.3932 3.51472C18.8074 2.92893 18.8074 1.97919 19.3932 1.3934C19.979 0.807611 20.9288 0.807611 21.5145 1.3934L31.0605 10.9393ZM-0.000183105 12L-0.000183105 10.5L29.9998 10.5V12V13.5L-0.000183105 13.5L-0.000183105 12Z" fill="black"/>
</svg>

          </button>
        </div>
      </div>

      {/* Pagination dots (mobile) */}
      <div className="d-flex d-lg-none justify-content-center mt-3 gap-2">
        {sliderCards.map((_, index) => (
          <div
            key={index}
            style={{
              width: activeIndex === index ? "12px" : "8px",
              height: activeIndex === index ? "12px" : "8px",
              borderRadius: "50%",
              backgroundColor: activeIndex === index ? "black" : "#ccc",
              transition: "all 0.3s ease",
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
