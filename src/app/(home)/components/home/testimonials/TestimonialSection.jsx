export default function TestimonialSection({ testimonials = [] }) {
  const fallbackTestimonials = [
    {
      id: "demo-1",
      projectName: "Eldeco Camelot",
      clientName: "Rahul Sharma",
      clientRole: "Home Buyer, Noida",
      testimonialText:
        "The MPF team helped me shortlist verified options quickly. The process felt transparent and very smooth.",
    },
    {
      id: "demo-2",
      projectName: "Saya Gold Avenue",
      clientName: "Neha Gupta",
      clientRole: "Investor, Delhi NCR",
      testimonialText:
        "I received clear insights on pricing and location benefits before investing. Highly recommended platform.",
    },
    {
      id: "demo-3",
      projectName: "Eldeco 7 Peaks Residences",
      clientName: "Amit Verma",
      clientRole: "First-Time Buyer",
      testimonialText:
        "From search to final decision, the support was excellent. I found a project matching my exact budget.",
    },
  ];
  const safeTestimonials = Array.isArray(testimonials) && testimonials.length
    ? testimonials.slice(0, 6)
    : fallbackTestimonials;

  return (
    <section className="container home-testimonials-section">
      <div className="home-testimonials-header">
        <h2>What Our Clients Say</h2>
        <p>Trusted by home buyers and investors across NCR.</p>
      </div>
      <div className="home-testimonials-grid">
        {safeTestimonials.map((item, index) => (
          <article className="home-testimonial-card" key={item.id ?? index}>
            <p className="home-testimonial-text">"{item.testimonialText}"</p>
            <div className="home-testimonial-meta">
              <h3>{item.clientName}</h3>
              <small>{item.projectName || "Project on request"}</small>
              <br />
              <span>{item.clientRole || "Verified Client"}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
