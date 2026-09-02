"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ELDECO_THANK_YOU_PATH } from "./eldecoPaths";
import { handleLeadFormSubmit } from "./leadFormSubmit";
import styles from "./page.module.css";

function Section10() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (event) => {
    try {
      setIsSubmitting(true);
      setFormError("");
      await handleLeadFormSubmit(event);
      router.push(ELDECO_THANK_YOU_PATH);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="bg-white px-6 py-[35px] text-[#171717] sm:px-10 lg:px-[42px] lg:py-[70px]">
      <div className="mx-auto flex w-full max-w-[1250px] flex-col items-center justify-center gap-8 lg:flex-row lg:gap-[32px]">
        <div className="flex h-full w-full max-w-[713px] flex-col items-stretch overflow-hidden border border-[#e5e5e5] bg-white sm:flex-row lg:max-w-none lg:flex-[0_1_713px] xl:w-auto xl:flex-none">
          <div className="w-full px-[18px] pb-[24px] pt-[23px] sm:flex-1 sm:px-[23px] xl:w-[454px] xl:flex-none xl:shrink-0">
            <h2 className={`${styles.heading} mb-[16px] md:text-[30px] text-[25px] font-[600] text-[#000000]`}>
              Request a Call Back
            </h2>

            <form id="section10-lead-form" onSubmit={handleSubmit} className="w-full space-y-[8px]" noValidate>
              <input
                type="text"
                name="name"
                required
                placeholder="Your Name *"
                className="h-[55px] w-full rounded-[5px] bg-[#f5f5f5] px-[14px] text-[16px] font-[400] placeholder:text-[#222222] text-[#222] outline-none"
              />
              <input
                type="email"
                name="email"
                required
                placeholder="Email *"
                className="h-[55px] w-full rounded-[5px] bg-[#f5f5f5] px-[14px] text-[16px] font-[400] placeholder:text-[#222222] text-[#222] outline-none"
              />
              <input
                type="tel"
                name="phone"
                required
                inputMode="numeric"
                placeholder="Phone Number *"
                className="h-[55px] w-full rounded-[5px] bg-[#f5f5f5] px-[14px] text-[16px] font-[400] placeholder:text-[#222222] text-[#222] outline-none"
              />
              <textarea
                name="message"
                placeholder="Message"
                className="h-[140px] w-full resize-none rounded-[3px] bg-[#f5f5f5] px-[14px] py-[13px] text-[16px] font-[400] placeholder:text-[#222222] text-[#222] outline-none"
              />

              {formError ? (
                <p className={`${styles.paragraph} text-[13px] font-[400] text-red-600`}>
                  {formError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-[2px] h-[50px] w-full cursor-pointer rounded-[5px] bg-gradient-to-r from-[#C39B47] to-[#D3C676] text-[16px] font-[600] text-white transition hover:from-[#b88c2c] hover:to-[#dcc86c] disabled:cursor-not-allowed disabled:opacity-70 sm:w-[128px]"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>

          <div className="relative min-h-[260px] w-full sm:min-h-[527px] sm:w-[220px] sm:shrink-0 xl:w-[259px]">
            <img
              src="/eld-imgs/s10/s10-nimg.jpg"
              alt="Luxury apartment balcony"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="flex h-full w-full max-w-[713px] flex-col justify-center text-left lg:max-w-[323px] xl:max-w-[480px]">
          <h2 className={`${styles.heading} text-[30px] font-[600]  text-center lg:text-left text-black`}>
            About Developer
          </h2>

          <div className="mt-[16px] space-y-[18px] leading-[1.55] text-[#202020]">
            <p className={`${styles.paragraph} font-[400] lg:text-[13px] text-[16px] xl:text-[16px] text-center lg:text-left  `}>
              Eldeco Group is one of India&apos;s most trusted and established real estate
              developers, with a legacy spanning over four decades. Known for
              delivering premium residential, commercial, and integrated township
              developments, the group has consistently created landmark projects that
              blend quality construction, modern architecture, and customer-centric
              design.
            </p>

            <p className={`${styles.paragraph} font-[400] lg:text-[13px] text-[16px] xl:text-[16px] text-center lg:text-left  `}>
              With a strong presence across multiple cities in North India, Eldeco
              Group has successfully delivered numerous projects and earned the trust
              of thousands of families through timely delivery, transparency, and
              innovation. The brand is recognized for developing thoughtfully planned
              communities that offer luxury, comfort, sustainability, and enhanced
              lifestyle experiences.
            </p>

            <p className={`${styles.paragraph} font-[400] lg:text-[13px] text-[16px] xl:text-[16px] text-center lg:text-left  `}>
              Driven by excellence and a vision to redefine urban living, Eldeco Group
              continues to craft future-ready developments that combine strategic
              locations, world-class amenities, and superior living standards for
              modern homebuyers and investors.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Section10;
