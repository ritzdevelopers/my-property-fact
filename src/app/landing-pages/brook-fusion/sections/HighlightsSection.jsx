// "use client";

// import Image from "next/image";
// import {
//     MdSecurity,
//     MdOutlineElectricalServices,
//     MdOutlineConstruction,
// } from "react-icons/md";
// import { FaSwimmingPool, FaRunning } from "react-icons/fa";
// import { IoIosPeople } from "react-icons/io";
// import { PiGarageDuotone } from "react-icons/pi";

// import bgImage from "../assets/bgHighlight.webp";
// import highlightImg from "../assets/brook1.png";

// const highlights = [
//     { icon: <IoIosPeople size={36} />, text: "Ultra-Spacious 3 & 4 BHK Residences" },
//     { icon: <FaRunning size={36} />, text: "Fastest Construction in the Area" },
//     { icon: <PiGarageDuotone size={36} />, text: "3-Side Open Plot with Zero Debt" },
//     { icon: <MdOutlineElectricalServices size={36} />, text: "Smart, Future-Ready Living" },
//     { icon: <FaSwimmingPool size={36} />, text: "Resort-Inspired Amenities" },
//     { icon: <MdSecurity size={36} />, text: "Prime Connectivity & Location" },
//     { icon: <MdOutlineConstruction size={36} />, text: "Credible Builder with Proven Legacy" },
// ];

// export default function HighlightsSection() {
//     const openPopup = () => {
//         window.dispatchEvent(new Event("openPopup"));
//     };

//     return (
//         <section
//             id="highlights"
//             className="position-relative py-5 px-3 text-dark"
//             style={{
//                 backgroundImage: `url(${bgImage.src})`,
//                 backgroundSize: "cover",
//                 backgroundPosition: "center",
//                 overflow: "hidden",
//             }}
//         >
//             <div className="position-relative z-1 container text-center">
//                 <h5
//                     className="text-uppercase fw-semibold mb-2"
//                     style={{ letterSpacing: "0.08em" }}
//                 >
//                     Highlights
//                 </h5>
//                 <h2 className="fw-bold mb-4" style={{ fontSize: "3rem" }}>
//                     Thoughtful Spaces for a Balanced Life
//                 </h2>
//                 <p
//                     className="mb-5 fs-5 mx-auto"
//                     style={{ maxWidth: "700px", color: "#555" }}
//                 >
//                     The Brook is more than just a home, it’s a lifestyle ecosystem designed
//                     for wellness, leisure, and smart living.
//                 </p>

//                 <div className="d-flex flex-column flex-md-row align-items-center gap-4">
//                     {/* Image */}
//                     <div className="w-100 w-md-50 mb-4 mb-md-0" style={{ border: '1px solid #D0B674', borderRadius: '10px' }}>
//                         <img
//                             src={highlightImg}
//                             alt="Highlight"
//                             className="img-fluid rounded shadow"
//                             style={{ borderRadius: '10px' }}
//                         />
//                     </div>

//                     {/* Highlights List */}
//                     <div className="w-100 w-md-50 d-flex flex-column gap-5">
//                         {highlights.map((item, index) => (
//                             <div
//                                 key={index}
//                                 className="d-flex align-items-center gap-3"
//                                 style={{
//                                     transition: "transform 0.3s ease",
//                                 }}
//                             >
//                                 <div
//                                     style={{
//                                         color: "#D0B674",
//                                         transition: "transform 0.3s ease, color 0.3s ease",
//                                     }}
//                                     onMouseEnter={(e) => {
//                                         e.currentTarget.style.transform = "scale(1.2)";
//                                         e.currentTarget.style.color = "#b89e5d";
//                                     }}
//                                     onMouseLeave={(e) => {
//                                         e.currentTarget.style.transform = "scale(1)";
//                                         e.currentTarget.style.color = "#D0B674";
//                                     }}
//                                 >
//                                     {item.icon}
//                                 </div>
//                                 <p className="mb-0" style={{ fontSize: "1.2rem", color: "#333" }}>
//                                     {item.text}
//                                 </p>
//                             </div>
//                         ))}
//                     </div>

//                 </div>

//                 {/* Button */}
//                 <div className="mt-5">
//                     <button
//                         onClick={openPopup}
//                         className="btn px-4 py-2 text-white"
//                         style={{
//                             backgroundColor: "#D0B674",
//                             fontSize: "1.25rem",
//                         }}
//                     >
//                         See More
//                     </button>
//                 </div>
//             </div>
//         </section>
//     );
// }

"use client";

import {
  MdSecurity,
  MdOutlineElectricalServices,
  MdOutlineConstruction,
} from "react-icons/md";
import { FaSwimmingPool, FaRunning } from "react-icons/fa";
import { IoIosPeople } from "react-icons/io";
import { PiGarageDuotone } from "react-icons/pi";

import bgImage from "../assets/bgHighlight.webp";
import highlightImg from "../assets/brook1.png";

const highlights = [
  {
    icon: <IoIosPeople size={36} />,
    text: "Ultra-Spacious 3 & 4 BHK Residences",
  },
  { icon: <FaRunning size={36} />, text: "Fastest Construction in the Area" },
  {
    icon: <PiGarageDuotone size={36} />,
    text: "3-Side Open Plot with Zero Debt",
  },
  {
    icon: <MdOutlineElectricalServices size={36} />,
    text: "Smart, Future-Ready Living",
  },
  { icon: <FaSwimmingPool size={36} />, text: "Resort-Inspired Amenities" },
  { icon: <MdSecurity size={36} />, text: "Prime Connectivity & Location" },
  {
    icon: <MdOutlineConstruction size={36} />,
    text: "Credible Builder with Proven Legacy",
  },
];

export default function HighlightsSection() {
  const openPopup = () => {
    window.dispatchEvent(new Event("openPopup"));
  };

  return (
    <section
      id="highlights"
      className="position-relative py-5 px-3 text-dark"
      style={{
        backgroundImage: `url(${bgImage.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden",
      }}
    >
      <div className="position-relative z-1 container text-center">
        <h5
          className="text-uppercase fw-semibold mb-2"
          style={{ letterSpacing: "0.08em" }}
        >
          Highlights
        </h5>
        <h2 className="fw-bold mb-4" style={{ fontSize: "3rem" }}>
          Thoughtful Spaces for a Balanced Life
        </h2>
        <p
          className="mb-5 fs-5 mx-auto"
          style={{ maxWidth: "700px", color: "#555" }}
        >
          The Brook is more than just a home, it’s a lifestyle ecosystem
          designed for wellness, leisure, and smart living.
        </p>

        <div className="row align-items-center gy-5 text-start">
          {/* Image */}
          <div className="col-12 col-md-6">
            <div style={{ border: "1px solid #D0B674", borderRadius: "10px" }}>
              <img
                src={highlightImg}
                alt="Highlight"
                className="img-fluid rounded shadow"
                style={{ borderRadius: "10px" }}
              />
            </div>
          </div>

          {/* Highlights List */}
          <div className="col-12 col-md-6">
            <div className="d-flex flex-column gap-4">
              {highlights.map((item, index) => (
                <div
                  key={index}
                  className="d-flex align-items-center gap-3"
                  style={{ transition: "transform 0.3s ease" }}
                >
                  <div
                    style={{
                      color: "#D0B674",
                      transition: "transform 0.3s ease, color 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.2)";
                      e.currentTarget.style.color = "#b89e5d";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.color = "#D0B674";
                    }}
                  >
                    {item.icon}
                  </div>
                  <p className="mb-0 fs-6 fs-md-5" style={{ color: "#333" }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Button */}
        <div className="mt-5">
          <button
            onClick={openPopup}
            className="btn px-4 py-2 text-white"
            style={{
              backgroundColor: "#D0B674",
              fontSize: "1.25rem",
            }}
          >
            See More
          </button>
        </div>
      </div>
    </section>
  );
}
