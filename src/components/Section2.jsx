"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ELDECO_THANK_YOU_PATH } from "./eldecoPaths";
import { handleLeadFormSubmit } from "./leadFormSubmit";
import { OPEN_LEAD_POPUP_EVENT } from "./LeadPopup";
import styles from "./page.module.css";

const stats = [
  { value: "G+30", label: "Floors" },
  { value: "Only 2", label: "Towers" },
  { value: "224", label: "Total units" },
  { value: "2.7 Acres", label: "Land Parcel" },
];

function Section2() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (event) => {
    try {
      setIsSubmitting(true);
      setFormError("");
      const data = await handleLeadFormSubmit(event);
      console.log(data);
      router.push(ELDECO_THANK_YOU_PATH);
    } catch (err) {
      console.log(err);
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
      setIsSubmitting(false);
    }
  };

  const openLeadPopup = () => {
    window.dispatchEvent(new Event(OPEN_LEAD_POPUP_EVENT));
  };

  return (
    <section
      id="overview"
      className="bg-white px-6 py-[35px] text-[#2a2a2a] sm:px-10 lg:px-12 lg:py-[70px]"
    >
      <div className="mx-auto grid max-w-[1250px] items-stretch gap-y-8 lg:grid-cols-[1.1fr_0.92fr] lg:gap-y-0">
        {/* Left Side Container  */}
        <div className="flex h-full min-w-0 flex-col xl:pr-0 lg:pr-4 pr-0  lg:justify-between">
          <div className="space-y-5 text-[15px] leading-7 text-[#333]  ">
            <p className={`${styles.paragraph} mb-3 text-[16px] text-center lg:text-left font-semibold uppercase   text-[#A27140]`}>
              Overview
            </p>
            <p className={`${styles.paragraph} w-full lg:max-w-[620px] font-[400] text-[18px] text-center lg:text-left`}>
              Premium residential property in Gurugram from Eldeco Group. It is
              an exceptional fusion of luxurious comfort and unparalleled
              connectivity and modern metropolitan living. An over{" "}
              <strong>2.7 acre property</strong> with{" "}
              <strong>200 well-appointed homes</strong> and 40+ international
              standard lifestyle features.
            </p>

            <p className={`${styles.paragraph} w-full lg:max-w-[640px] font-[400] text-[18px] text-center lg:text-left`}>
              Only <strong>4 apartments per core</strong>, this residential
              project, consisting of{" "}
              <strong>3 BHK and 3.5 BHK luxury apartments</strong> at Sector 80,
              has been conceptualized for the select few, offering absolute
              privacy and exclusivity. All the apartments have been designed to
              provide maximum refreshing airflow and abundant natural light and
              cross-ventilation, built more than 30 feet above the ground level.
            </p>

            <p className={`${styles.paragraph} w-full lg:max-w-[600px] font-[400] text-[18px] text-center lg:text-left`}>
              An array of thoughtfully planned and meticulously curated
              amenities add the touch of rejuvenation and recreation to your
              lifestyle at <strong>Eldeco Terra & Sol.</strong>
            </p>
          </div>

          <div className={`  mt-5      w-full w-full lg:max-w-[679px] overflow-hidden xl:w-[679px]  `}>
            <img
              src="/eld-imgs/imgs/s2-nimg.jpg"
              alt="Luxury apartment living room"
              className={` w-full object-cover ${styles.height_responsive}`}
            />
          </div>
        </div>

        {/* Right Side Container  */}
        <div className="flex h-full min-w-0 flex-col">
        
          <div className="border border-neutral-200 px-5 py-8 sm:px-8 sm:py-12">
            <h2 className={`${styles.heading} mb-5 md:text-[30px] text-[25px] font-[600] text-[#2a2a2a] text-center lg:text-left`}>
              Request a Call Back
            </h2>

            <form onSubmit={handleSubmit} className=" flex flex-col gap-2 justify-center items-center lg:justify-start lg:items-start" noValidate>
              <input
                type="text"
                name="name"
                required
                placeholder="Your Name *"
                className="h-12 w-full bg-neutral-100 px-4 text-[14px] font-[400] outline-none text-[#222222] placeholder:text-[#222222]"
              />
              <input
                type="email"
                name="email"
                required
                placeholder="Email *"
                className="h-12 w-full bg-neutral-100 px-4 text-[14px] font-[400] outline-none text-[#222222] placeholder:text-[#222222]"
              />
              <input
                type="tel"
                name="phone"
                required
                inputMode="numeric"
                placeholder="Phone Number *"
                className="h-12 w-full bg-neutral-100 px-4 text-[14px] font-[400] outline-none text-[#222222] placeholder:text-[#222222]"
              />
              <textarea
                name="message"
                placeholder="Message"
                className="h-20 w-full resize-none bg-neutral-100 px-4 py-4 text-[14px] font-[400] outline-none text-[#222222] placeholder:text-[#222222]"
              />

              {formError ? (
                <p className={`${styles.paragraph} text-[13px] font-[400] text-red-600`}>
                  {formError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 cursor-pointer rounded-[5px] bg-[#cdae55] px-8 py-3 text-[16px] font-[600] text-white transition hover:bg-[#b8963f] disabled:cursor-not-allowed disabled:opacity-70 "
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>

          <div className="grid flex-1 grid-cols-2 content-center gap-x-4 gap-y-6 px-0 py-7 text-center sm:gap-x-8 sm:px-4">
            {stats.map((item) => (
              <div key={item.label} className="border-b border-[#e6cfa1] pb-5">
                <p className={`${styles.heading} xl:text-[40px] text-[23px] font-[700] text-black`}>
                  {item.value}
                </p>
                <p className={`${styles.paragraph} mt-2 text-[16px] font-[400] text-black`}>{item.label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 px-0 sm:grid-cols-2 sm:px-4">
            <button
              type="button"
              onClick={openLeadPopup}
              className="flex items-center justify-center gap-3 rounded-[5px] bg-[#cdae55] px-5 xl:px-6 py-4 cursor-pointer text-[14px] xl:text-[16px] font-[600] text-white transition-all duration-300 hover:-translate-y-[2px] hover:bg-[#b8963f] hover:shadow-[0_10px_22px_rgba(201,168,70,0.35)] active:translate-y-0"
            >
              Download Brochure
              <img src="/eld-imgs/s2/down-brochure.svg" alt="Download Brochure"  className="w-[15px] h-[15px]" />
            </button>

            <button
              type="button"
              onClick={openLeadPopup}
              className="border rounded-[5px] border-[#cdae55] px-5 xl:px-6 py-4 cursor-pointer text-[14px] xl:text-[16px] font-[600] text-black transition-all duration-300 hover:-translate-y-[2px] hover:bg-[#cdae55] hover:text-white hover:shadow-[0_10px_22px_rgba(201,168,70,0.25)] active:translate-y-0"
            >
              Book a Site Visit
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Section2;
