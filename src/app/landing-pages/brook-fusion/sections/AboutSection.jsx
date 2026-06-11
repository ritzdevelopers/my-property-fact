// "use client";

// import Image from 'next/image';
// import bgImage from '../assets/bg.webp'; // Adjust path as needed

// export default function AboutSection() {
//     const openPopup = () => {
//         window.dispatchEvent(new Event("openPopup"));
//     };
//     return (
//         <section
//             id="about"
//             className="position-relative d-flex justify-content-center align-items-center text-white"
//             style={{
//                 backgroundImage: `url(${bgImage.src})`,
//                 backgroundSize: 'cover',
//                 backgroundPosition: 'center',
//                 width: '100%',
//                 height: '80vh' // Adjusted for full screen
//             }}
//         >
//             {/* Overlay */}
//             <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"></div>

//             {/* Content */}
//             <div className="position-relative z-1 container text-center">
//                 <h4 className="text-uppercase fw-semibold mb-3" style={{ letterSpacing: '0.1em' }}>
//                     ABOUT US
//                 </h4>
//                 <h2 className="display-5 fw-bold mb-4">
//                     A Home That Breathes, A Lifestyle That Moves Forward
//                 </h2>
//                 <p className="lead mx-auto mb-5" style={{ maxWidth: '768px' }}>
//                     Located at the most promising corner of Sector 12, The Brook by Fusion Limited merges best-in-class connectivity with thoughtfully designed living. Built on a 3-side open plot with fully paid-up land, it stands tall on legal clarity and architectural intelligence.
//                     With advanced Mivan construction, rapid delivery timelines, and premium-grade finishes, every apartment is a testament to strength and style — built to outlast trends and elevate lifestyles.
//                     Whether you're seeking comfort, status, or an appreciating investment, The Brook delivers on all fronts. Beautifully and efficiently.
//                 </p>
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

import bgImage from "../assets/bg.webp"; // Adjust path as needed

export default function AboutSection() {
  const openPopup = () => {
    window.dispatchEvent(new Event("openPopup"));
  };

  return (
    <section
      id="about"
      className="position-relative d-flex justify-content-center align-items-center text-white"
      style={{
        backgroundImage: `url(${bgImage.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "100%",
        minHeight: "80vh", // Ensures responsiveness on smaller screens
        padding: "2rem 1rem", // Adds padding for smaller devices
      }}
    >
      {/* Overlay */}
      <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"></div>

      {/* Content */}
      <div className="position-relative z-1 container text-center">
        <h4
          className="text-uppercase fw-semibold mb-3"
          style={{ letterSpacing: "0.1em" }}
        >
          ABOUT US
        </h4>
        <h2 className="display-5 fw-bold mb-4">
          A Home That Breathes, A Lifestyle That Moves Forward
        </h2>
        <p
          className="lead mx-auto mb-5"
          style={{
            maxWidth: "768px",
            fontSize: "1rem",
            lineHeight: "1.6",
          }}
        >
          Located at the most promising corner of Sector 12, The Brook by Fusion
          Limited merges best-in-class connectivity with thoughtfully designed
          living. Built on a 3-side open plot with fully paid-up land, it stands
          tall on legal clarity and architectural intelligence.
          <br />
          <br />
          With advanced Mivan construction, rapid delivery timelines, and
          premium-grade finishes, every apartment is a testament to strength and
          style — built to outlast trends and elevate lifestyles.
          <br />
          <br />
          Whether you are seeking comfort, status, or an appreciating investment,
          The Brook delivers on all fronts. Beautifully and efficiently.
        </p>
        <div className="mt-4">
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
