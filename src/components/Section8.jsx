import styles from "./page.module.css";

const locationAdvantages = [
  {
    title: "IMT Manesar",
    distance: "Approx. 5 km",
    description:
      "Strategically located near IMT Manesar, offering seamless access to one of Gurugram's largest industrial and corporate hubs.",
  },
  {
    title: "KMP Expressway",
    distance: "Approx. 6 km",
    description:
      "Enjoy smooth connectivity to major NCR regions via the rapidly expanding KMP Expressway network.",
  },
  {
    title: "Dwarka Expressway",
    distance: "Approx. 10 km",
    description:
      "Well-connected to Dwarka Expressway, ensuring faster travel to Delhi, Gurgaon, and IGI Airport.",
  },
  {
    title: "Airport (IGI), Delhi",
    distance: "Approx. 35 km",
    description:
      "Reach Indira Gandhi International Airport conveniently through NH-48 and Dwarka Expressway connectivity.",
  },
  {
    title: "Medanta",
    distance: "The Medicity - Approx. 18 km",
    description:
      "Premium healthcare facilities like Medanta - The Medicity are easily accessible for world-class medical care.",
  },
  {
    title: "Cyber City, Gurgaon",
    distance: "Approx. 30 km",
    description:
      "Stay close to Gurugram's leading business district and corporate ecosystem at Cyber City.",
  },
];

function Section8() {
  return (
    <section id="location" className="overflow-hidden bg-white border-t border-[#e5e5e5] px-6 py-[35px] text-[#181818] sm:px-10 lg:px-[32px] lg:py-[70px]">
      <div className="mx-auto w-full max-w-[1250px]">
        <div className="mb-[27px] text-left md:text-center">
          <h2 className={`${styles.heading} md:text-[32px] text-[25px] font-[600] text-[#000000] sm:text-[36px] lg:text-[40px]`}>
            Location Advantages
          </h2>
          <p className={`${styles.paragraph} mt-[5px] md:text-[24px] text-[18px] font-[400] text-[#000000] sm:text-[22px] lg:text-[24px]`}>
            Sector 80, Gurugram
          </p>
        </div>

        <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-[36px]">
          <div className="min-w-0 space-y-5 pt-[2px] sm:space-y-[18px] lg:flex-[0_0_calc(60%_-_18px)] xl:w-[623px] xl:flex-none">
            {locationAdvantages.map((item) => (
              <div key={item.title} className="flex gap-[9px]">
                <span className="mt-[12px] h-[6px] w-[6px] shrink-0 rounded-full bg-black" />
                <div className="min-w-0 text-[13px] leading-[1.72] text-[#1d1d1d]">
                  <p className={styles.paragraph}>
                    <strong className="font-[700] text-[16px]">{item.title}</strong>
                    <span> - </span>
                    <span className="text-[16px] font-[400] text-[#000000]">{item.distance}</span>
                  </p>
                  <p className={`${styles.paragraph} text-[16px] font-[400] text-[#000000]`}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative w-full min-w-0 overflow-hidden lg:flex-[0_0_calc(40%_-_18px)] xl:flex-1">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14042.969478378072!2d76.95764064999999!3d28.3666376!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d3c5484bf5267%3A0x3ea2dde8a474eb30!2sSector%2080%2C%20Gurugram%2C%20Haryana!5e0!3m2!1sen!2sin!4v1778576650291!5m2!1sen!2sin"
              title="Sector 80 Gurugram Google Map"
              width="600"
              height="450"
              className="h-[320px] w-full border-0 sm:h-[420px] lg:h-[604px] lg:max-w-[623px]"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Section8;
