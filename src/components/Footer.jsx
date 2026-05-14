import styles from "./page.module.css";

function Footer() {
  return (
    <footer className="bg-black px-6 pb-[52px] pt-[48px] text-center text-white sm:px-10">
      <div className="mx-auto max-w-[1250px]">
        <div className="mb-[30px] flex justify-center">
          <img
            src="/eld-imgs/logo/eldecologo.png"
            alt="Eldeco" 
            className="h-auto w-[196px]"
          />
        </div>

        <h2 className={`${styles.heading} text-[18px] font-[600] leading-none text-white`}>
          Disclaimer
        </h2>

        <p className={`${styles.paragraph} mx-auto mt-[15px] max-w-[1100px] text-[16px] font-[400] leading-[1.65] text-white/88`}>
          This website is for informational purposes only and does not constitute an
          offer to sell or a solicitation to buy any property. All images, plans,
          specifications, amenities, and pricing are indicative and subject to change
          without notice. The content may include artistic impressions and conceptual
          representations. Interested buyers are advised to verify all details,
          including area, pricing, and availability, with the sales team before making
          any decision. The developer reserves the right to make changes in accordance
          with applicable laws and approvals.
        </p>

        <p className={`${styles.paragraph} mt-[33px] text-[16px] font-[400] text-white/90`}>
          *T&amp;C Apply
        </p>

        <p className={`${styles.paragraph} mt-[31px] text-[16px] font-[400] text-white/90`}>
          © 2026 Eldeco Group. All Rights Reserved. | RERA Registered
        </p>
      </div>
    </footer>
  );
}

export default Footer;
