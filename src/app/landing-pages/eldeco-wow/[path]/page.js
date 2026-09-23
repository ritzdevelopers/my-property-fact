"use client";
import { useEffect, useState } from "react";
import { gsap } from "gsap";
import Navbar from "./components/Navbar";
import Slider from "./components/Slider";
import ContactForm from "./components/ContactForm";
import FormPopup from "./components/FormPopup";
import { usePathname, useRouter } from "next/navigation";
import NotFound from "@/app/not-found";
export default function Home() {
  useEffect(() => {
    // Animate hero content on load
    gsap.to("#hero-title", {
      duration: 1,
      y: 0,
      opacity: 1,
      ease: "power3.out",
    });
    gsap.to("#hero-subtitle", {
      duration: 1,
      y: 0,
      opacity: 1,
      delay: 0.3,
      ease: "power3.out",
    });
    gsap.to("#hero-cta", {
      duration: 1,
      y: 0,
      opacity: 1,
      delay: 0.6,
      ease: "power3.out",
    });
  }, []);

  const amenities = [
    { icon: "/images/s5/Conference_Room.png", title: "Conference Room" },
    { icon: "/images/s5/Creche_Day_Care.png", title: "Creche Day Care" },
    { icon: "/images/s5/Cricket_Pitch.png", title: "Cricket Pitch " },
    {
      icon: "/images/s5/Earthquake_Resistant.png",
      title: "Earthquake Resistant",
    },
    { icon: "/images/s5/24x7_Security.png", title: "24x7 Security" },
    { icon: "/images/s5/Aerobics_Centre.png", title: "Aerobic _Centre" },
    { icon: "/images/s5/Banquet_Hall.png", title: "Banquet Hall" },
    { icon: "/images/s5/Basketball_Court.png", title: "Basketball Court" },
    { icon: "/images/s5/Business_Lounge.png", title: "Business Lounge" },
    { icon: "/images/s5/Car_Parking.png", title: "Car Parking" },
    { icon: "/images/s5/Cigar_Lounge.png", title: "Cigar Lounge" },
    { icon: "/images/s5/Community_Hall.png", title: "Community Hall" },
  ];

  const stats = [
    { number: "200+", label: "Projects" },
    { number: "40+", label: "Years" },
    { number: "30000+", label: "Homes" },
    { number: "20+", label: "Cities" },
  ];

  const [frmModal, setFormPopup] = useState(false);

  useEffect(() => {
    setFormPopup(false);
  }, []);

  const pathArr = [
    {
      num: 1,
      frmName: "Google PPC",
    },
    {
      num: 2,
      frmName: "Google Display 2",
    },
    {
      num: 3,
      frmName: "Google Display",
    },
    {
      num: 4,
      frmName: "Google P Max",
    },
    {
      num: 5,
      frmName: "Google Gemand Gen",
    },
    {
      num: 6,
      frmName: "Taboola",
    },
    {
      num: 7,
      frmName: "TOI",
    },
    {
      num: 8,
      frmName: "TOI-CPM",
    },
    {
      num: 9,
      frmName: "HTTDS",
    },
  ];
  const path = usePathname();
  const [frmName, setFrmName] = useState([]);
  const router = useRouter();
  useEffect(() => {
    function getPath() {
      const segment = path.split("/")[3];
      if (segment) {
        const filtered = pathArr.filter((obj) => obj.num == segment);

        if (filtered.length === 0) {
          return router.push(`/landing-pages/eldeco-wow/1`);
        }
        setFrmName(filtered);
      }
    }

    getPath();
  }, [path]); // include path if it can change

  return (
    <div className="overflow-x-hidden">
      <Navbar setFormPopup={setFormPopup} />
      {frmModal && (
        <FormPopup
          setFormPopup={setFormPopup}
          frmName={frmName.length > 0 ? frmName[0].frmName : "Google PPC"}
        />
      )}

      <main
        style={{
          marginTop: "65px",
        }}
      >
        {/* Section 1 - Hero */}
        <section id="home" className="sec1">
          <img
            src="/images/s1/hero-banner.png"
            className="img-fluid w-100"
            alt="Hero Banner"
            title="Hero Banner"
          />
        </section>

        {/* Section 2 - Key Highlights */}
        <section
          id="floor-plans"
          className="sec2 pt-14 w-100 min-vh-10 d-flex flex-column align-items-center gap-14 gap-md-24 px-3 px-md-0"
          style={{
            paddingTop: "50px",
            paddingBottom: "50px",
          }}
        >
          <div
            className="w-100 text-center"
            style={{ maxWidth: "75%", marginBottom: "50px" }}
          >
            <h2
              style={{
                fontFamily: "monster_semibold",
                fontWeight: "600",
                fontSize: "clamp(24px, 4vw, 48px)",
              }}
            >
              Key highlights
            </h2>
            <p
              style={{
                fontFamily: "moster_regular",
                fontWeight: "400",
                color: "#00000099",
                fontSize: "clamp(14px, 2vw, 18px)",
              }}
              className="mt-3"
            >
              3 BHK & Limited Duplex Residences set inside a thoughtfully
              planned community with a 35,000 sq ft clubhouse, sports arenas,
              and lush podium greens.
            </p>
          </div>

          <div className="w-100">
            <img
              src="/images/s2/sec2_img.png"
              className="img-fluid w-100"
              alt="Key highlights"
              title="Key highlights"
            />
          </div>
        </section>

        {/* Section 3 - Features List */}
        <section className="s3 w-100 py-16 px-3 px-md-0 d-flex align-items-end">
          <div
            className="contentDiv d-flex flex-column flex-md-row justify-content-between align-items-center gap-4 gap-md-0 w-100"
            style={{ minHeight: "546px" }}
          >
            {/* Left Content */}
            <div className="w-100 px-md-4 d-flex flex-column align-items-start">
              <div
                className="list d-flex flex-column align-items-start p-3 p-md-4 mb-4"
                style={{
                  backgroundColor: "#F7F7F7",
                  width: "fit-content",
                }}
              >
                <ul
                  className="d-flex flex-column gap-3 list-unstyled mb-0"
                  style={{ width: "fit-content" }}
                >
                  {[
                    "G+32 towers | Podium-level living",
                    "Spacious 3 BHK formats & limited duplexes",
                    "Modern construction tech for superior finish & speed",
                    "Clubhouse with pool, courts, fitness & co-working zones",
                    "Secure, access-controlled community with 24×7 services",
                    "Excellent connectivity via Yamuna Expressway; quick access to key employment & lifestyle hubs",
                  ].map((item, index) => (
                    <li
                      key={index}
                      className="list-item-custom d-flex align-items-start"
                    >
                      <div className="d-flex gap-2 align-items-center w-auto">
                        <p
                          style={{
                            fontFamily: "moster_regular",
                            fontWeight: "400",
                            fontSize: "clamp(16px, 2vw, 20px)",
                            margin: 0,
                          }}
                        >
                          0{index + 1}.
                        </p>
                        <p
                          style={{
                            fontFamily: "moster_regular",
                            fontWeight: "400",
                            fontSize: "clamp(16px, 2vw, 20px)",
                            margin: 0,
                          }}
                        >
                          {item}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setFormPopup(true)}
                className="cta-button border-0"
                style={{ width: "191px", height: "44px" }}
              >
                Download Brochure
              </button>
            </div>

            {/* Right Image */}
            <div
              className="img mt-4 mt-md-0"
              style={{ maxWidth: "562px", flexShrink: 0 }}
            >
              <img
                className="img-fluid"
                src="/images/s2/Girl_with_House.jpg"
                alt="Feature illustration"
                title="Feature illustration"
                style={{ display: "block", width: "100%", height: "auto" }}
              />
            </div>
          </div>
        </section>

        {/* Section 4 - Slider */}
        <section
          style={{
            background: "linear-gradient(to right,  #5A9FC9, #114D72)",
            paddingTop: "50px",
            paddingBottom: "20px",
          }}
          className={`s4  w-100 min-vh-20 bg-gradient-to-r from-[#5A9FC9] to-[#114D72] d-flex flex-column align-items-center justify-content-center`}
        >
          <div className="w-100 text-center">
            <h2
              style={{
                fontFamily: "moster_medium",
                fontWeight: "500",
                fontSize: "clamp(28px, 3vw, 36px)",
              }}
              className="text-white"
            >
              Why it works <br />
              (for families & investors)
            </h2>
          </div>

          <Slider />
        </section>

        {/* Section 5 - Amenities */}
        <section
          id="amenities"
          className="sec5 w-100 d-flex flex-column  align-items-center justify-content-center py-20 px-3 px-md-4"
          style={{
            backgroundImage: "url(/images/s5/s5Banner.png)",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            minHeight: "90vh",
            gap: "50px",
            paddingTop: "20px",
            paddingBottom: "20px",
          }}
        >
          <div className="text-center w-100">
            <h1
              style={{
                fontFamily: "moster_medium",
                fontWeight: "500",
                fontSize: "clamp(28px, 3vw, 36px)",
              }}
            >
              Amenities
            </h1>
          </div>

          <div
            className="amenitiesCardsContainer d-flex flex-column gap-4 align-items-center w-100"
            style={{ maxWidth: "1200px" }}
          >
            {/* Row 1 */}
            <div className="d-flex flex-wrap justify-content-center justify-content-md-between gap-3 w-100">
              {amenities.slice(0, 6).map((amenity, index) => (
                <div
                  style={{
                    width: "167px",
                    height: "167px",
                  }}
                  key={index}
                  className="amenity-card bg-white d-flex flex-column justify-content-center gap-3 align-items-center text-black"
                >
                  <img
                    src={amenity.icon}
                    style={{ width: "70px", height: "70px" }}
                    alt={amenity.title} title={amenity.title}
                  />
                  <p
                    style={{
                      fontFamily: "moster_medium",
                      fontWeight: "500",
                      fontSize: "clamp(14px, 2vw, 18px)",
                    }}
                    className="text-center mb-0"
                  >
                    {amenity.title}
                  </p>
                </div>
              ))}
            </div>

            {/* Row 2 */}
            <div className="d-flex flex-wrap justify-content-center justify-content-md-between gap-3 w-100">
              {amenities.slice(6).map((amenity, index) => (
                <div
                  style={{
                    width: "167px",
                    height: "167px",
                  }}
                  key={index}
                  className="amenity-card bg-white d-flex flex-column justify-content-center gap-3 align-items-center text-black"
                >
                  <img
                    src={amenity.icon}
                    style={{ width: "70px", height: "70px" }}
                    alt={amenity.title} title={amenity.title}
                  />
                  <p
                    style={{
                      fontFamily: "moster_medium",
                      fontWeight: "500",
                      fontSize: "clamp(14px, 2vw, 18px)",
                    }}
                    className="text-center mb-0"
                  >
                    {amenity.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6 - Location */}
        <section
          id="location"
          className="sec6 w-100 d-flex justify-content-center align-items-center py-20 px-3 px-md-0"
          style={{
            paddingTop: "40px",
            paddingBottom: "40px",
          }}
        >
          <div
            className="w-100 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4 gap-md-0"
            style={{ maxWidth: "1266px" }}
          >
            <div
              className="left w-100"
              style={{ maxWidth: "513px", paddingTop: "80px" }}
            >
              <div className="d-flex flex-column gap-2 w-100">
                <h2
                  style={{
                    fontFamily: "monster_semibold",
                    fontWeight: "600",
                    fontSize: "clamp(28px, 3vw, 36px)",
                  }}
                >
                  Location
                </h2>
                <div
                  style={{
                    fontFamily: "moster_medium",
                    fontWeight: "500",
                    fontSize: "clamp(16px, 2vw, 18px)",
                    height: "52px",
                  }}
                  className="w-100 bg-danger text-white d-flex align-items-center px-3"
                >
                  Sector 22D, Yamuna Expressway, YEIDA
                </div>
                <div className="ps-3 ps-md-1">
                  <ul
                    style={{
                      fontFamily: "moster_regular",
                      fontWeight: "400",
                      fontSize: "clamp(16px, 2vw, 20px)",
                    }}
                    className="list-disc list-outside d-flex flex-column gap-3"
                  >
                    <li>Yamuna Expressway</li>
                    <li>Noida International Airport (Jewar):</li>
                    <li>Planned Media/Film City & Institutional Zones</li>
                    <li>Social Infrastructure:</li>
                  </ul>
                </div>
              </div>

              <div className="d-flex flex-column gap-2 w-100 mt-2">
                <h2
                  style={{
                    fontFamily: "monster_semibold",
                    fontWeight: "600",
                    fontSize: "clamp(28px, 3vw, 36px)",
                  }}
                >
                  Why this corridor
                </h2>
                <div className="ps-3 ps-md-1">
                  <ul
                    style={{
                      fontFamily: "moster_regular",
                      fontWeight: "400",
                      fontSize: "clamp(16px, 2vw, 20px)",
                    }}
                    className="list-disc list-outside d-flex flex-column gap-3"
                  >
                    <li>
                      Major public investment (airport, industrial & logistics
                      nodes)
                    </li>
                    <li>
                      High-capacity arterial roads; future metro/rapid transit
                      under planning
                    </li>
                    <li>Early-mover advantage in a growth micro-market</li>
                  </ul>
                </div>
              </div>
            </div>

            <div
              className="map w-100"
              style={{ maxWidth: "726px", height: "clamp(400px, 50vw, 588px)" }}
            >
              <img
                src="/images/s6/map-2.png"
                className="img-fluid w-100 h-100"
                style={{ objectFit: "cover" }}
                alt="Location Map"
                title="Location Map"
              />
            </div>
          </div>
        </section>

        {/* Section 7 - Gallery */}
        <section
          id="gallery"
          className="s7 w-100 min-vh-10 d-flex flex-column align-items-center px-3 py-10 bg-light"
          style={{
            paddingTop: "40px",
            paddingBottom: "40px",
          }}
        >
          <div className="mb-5 text-center">
            <h2
              style={{
                fontFamily: "moster_medium",
                fontWeight: "500",
                fontSize: "clamp(28px, 4vw, 48px)",
              }}
            >
              Gallery
            </h2>
          </div>

          <div className="imgGallery w-100" style={{ maxWidth: "1216px" }}>
            <div className="row g-3">
              <div className="col-12 col-lg-4">
                <div className="position-relative h-64 h-md-96 h-lg-auto">
                  <button
                    className="gallery-button"
                    style={{
                      position: "absolute",
                      right: "20px",
                      top: "20px",
                    }}
                  >
                    Exteriors
                  </button>
                  <img
                    src="/images/s7/s1.png"
                    className="img-fluid w-100 h-100"
                    style={{ objectFit: "cover", minHeight: "300px" }}
                    alt="Gallery Image 1"
                    title="Gallery Image 1"
                  />
                </div>
              </div>

              <div className="col-12 col-lg-8">
                <div className="row g-3">
                  {[
                    { image: "/images/s7/s2.png", label: "Podium Life" },
                    { image: "/images/s7/s3.png", label: "Clubhouse" },
                    { image: "/images/s7/s4.png", label: "Residences" },
                    { image: "/images/s7/s5.png", label: "Progress" },
                  ].map((item, index) => (
                    <div key={index} className="col-12 col-sm-6">
                      <div className="position-relative">
                        <button
                          className="gallery-button "
                          style={{
                            position: "absolute",
                            right: "20px",
                            top: "20px",
                          }}
                        >
                          {item.label}
                        </button>
                        <img
                          src={item.image}
                          className="img-fluid w-100"
                          style={{ height: "342px", objectFit: "cover" }}
                          alt={`Gallery Image ${index + 2}`} title={`Gallery Image ${index + 2}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8 - Stats */}
        <section
          id="about"
          className="sec8 w-100 text-white d-flex flex-column gap-10 gap-sm-43 align-items-center justify-content-center  px-3 py-5 py-md-0"
          style={{
            background: "linear-gradient(to right,  #114D72 ,#0B2954)",
            minHeight: "468px",
          }}
        >
          <h2
            style={{
              fontFamily: "monster_semibold",
              fontWeight: "600",
              fontSize: "clamp(28px, 3vw, 36px)",
            }}
            className="text-center"
          >
            Choose an Eldeco Home, Live Better
          </h2>

          <div className="w-100 d-flex flex-column flex-sm-row flex-wrap justify-content-center align-items-center">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`stats-card d-flex flex-column justify-content-center align-items-center w-100`}
                style={{ maxWidth: "360px" }}
              >
                <h2
                  style={{
                    fontFamily: "moster_regular",
                    fontWeight: "400",
                    fontSize: "clamp(28px, 3vw, 36px)",
                  }}
                >
                  {stat.number}
                </h2>
                <p
                  style={{
                    fontFamily: "monster_semibold",
                    fontWeight: "600",
                    fontSize: "clamp(28px, 3vw, 36px)",
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 9 - Contact */}
        <section
          className="sec9 w-100 min-vh-100 d-flex justify-content-center align-items-center px-3 py-10"
          style={{
            backgroundImage: "url(/images/s9/sec9.png)",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            paddingTop: "30px",
            paddingBottom: "30px",
          }}
        >
          <div
            className="w-100 d-flex flex-column flex-xl-row justify-content-between align-items-start align-items-lg-center gap-4 gap-lg-4"
            style={{ maxWidth: "1307px" }}
          >
            <div
              className="leftSideContainer w-100 d-flex flex-column justify-content-center pe-lg-4 gap-4 gap-lg-26 text-black border-top border-bottom border-5 border-danger py-4 py-md-0 px-2 px-md-0"
              style={{ maxWidth: "574px", height: "409px" }}
            >
              <h2
                style={{
                  fontFamily: "monster_semibold",
                  fontWeight: "600",
                  fontSize: "clamp(28px, 4vw, 48px)",
                }}
              >
                Get in Touch
              </h2>
              <p
                style={{
                  fontFamily: "moster_regular",
                  fontWeight: "400",
                  fontSize: "clamp(16px, 2vw, 20px)",
                }}
              >
                If you would like to know more details or something specific,
                feel free to contact us.
              </p>
              <p
                style={{
                  fontFamily: "moster_regular",
                  fontWeight: "400",
                  fontSize: "clamp(16px, 2vw, 20px)",
                }}
              >
                Our site representative will give you a call back.
              </p>
            </div>

            <div
              className="w-100 bg-white text-black d-flex justify-content-center align-items-center flex-column gap-4 gap-lg-35 p-3 p-lg-0"
              style={{
                maxWidth: "691px",
                minHeight: "614px",

                paddingBottom: "30px",
              }}
            >
              <ContactForm
                frmName={frmName.length > 0 ? frmName[0].frmName : "Google PPC"}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "#011019",
        }}
        className="w-100  d-flex flex-column justify-content-center align-items-center gap-3 gap-sm-10 text-white px-3 py-4 py-sm-5"
      >
        <div
          className="disclaimer-box d-flex flex-column justify-content-center text-center align-items-center w-100 px-2"
          style={{ maxWidth: "579px" }}
        >
          UP RERA REG NO. UPRERAPRJ752382/09/2025 <br /> WEBSITE: WWW.UP-RERA.IN
        </div>

        <h2
          style={{
            fontFamily: "monster_semibold",
            fontWeight: "600",
            fontSize: "clamp(24px, 3vw, 36px)",
          }}
          className="text-center mt-3 mt-sm-0"
        >
          Disclaimer
        </h2>

        <p
          style={{
            fontFamily: "moster_regular",
            fontWeight: "400",
            fontSize: "clamp(14px, 2vw, 16px)",
            maxWidth: "1200px",
          }}
          className="text-center px-2"
        >
          The content and visuals in this advertisement are solely an artistic
          rendering for illustrative purposes and are not to scale, it does not
          constitute a legal offer or forms part of any legally binding
          agreement. The promoter of the project clarifies that the information
          provided herein are indicative in nature. Intending purchasers are
          advised to verify all the details independently with the respective
          sales team of promoter of the project regarding plans, specifications,
          terms of sales and payments and other relevant details independently
          before making any purchase decision regarding any unit in the project.
        </p>
      </footer>

      {/* Bottom Bar */}
      <div
        className="w-100 bg-black d-flex justify-content-center align-items-center"
        style={{ height: "66px" }}
      >
        <p
          style={{
            fontFamily: "moster_italic",
            fontWeight: "400",
            color: "#FFFFFF66",
            fontSize: "clamp(12px, 2vw, 16px)",
          }}
        >
          Disclaimer & Privacy Policy
        </p>
      </div>
    </div>
  );
}
