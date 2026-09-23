import img1 from "../assets/Layout_1.jpg";
import img2 from "../assets/Layout_2.jpg";
import img3 from "../assets/Layout_3.jpg";

export default function FloorPlans() {
  const floors = [
    {
      title: "Office Spaces",
      image: img1.src,
    },
    {
      title: "Food Court",
      image: img2.src,
    },
    {
      title: "Retail Spaces",
      image: img3.src,
    },
  ];

  return (
    <section id="floors" className="py-5 bg-light px-3">
      <div className="container text-center mb-5">
        <h2 className="fw-bold" style={{ fontSize: "2rem", color: "#1f2937" }}>
          Floor Plan
        </h2>
        <p className="mt-3 text-muted mx-auto" style={{ maxWidth: "720px" }}>
          Explore our floor-wise breakdown of retail zones, office levels, and
          the food court at Gourmet @ ONYX—designed for flow, visibility, and
          functionality.
        </p>
      </div>

      <div className="container">
        <div className="row g-4">
          {floors.map((floor, idx) => (
            <div className="col-12 col-sm-6 col-lg-4" key={idx}>
              <div className="position-relative rounded overflow-hidden shadow bg-white">
                <img
                  src={floor.image}
                  alt={`${floor.title} Floor Plan`} title={`${floor.title} Floor Plan`}
                  className="w-100"
                  style={{ height: "260px", objectFit: "cover" }}
                />
                <div
                  className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.3)",
                    backdropFilter: "blur(1px)",
                    zIndex: 2,
                  }}
                >
                  <h2 className="text-white fw-bold fs-4 mb-3">
                    {floor.title}
                  </h2>
                  <a
                    href="#contact"
                    className="btn btn-success fw-semibold px-4 py-2"
                  >
                    Know more
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
