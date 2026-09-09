import Image from "next/image";
import GallerySlider from "./GallerySlider";
import SiteHeader from "./SiteHeader";
import { CtaButton } from "./Popup";
import EnquiryForm from "./EnquiryForm";
import SmoothScroll from "./SmoothScroll";

const assets = {
  hero: "/eldeco-7-peak/hero-bg.jpg",
  logo: "/eldeco-7-peak/e-logo.png",
  highlightImage: "/eldeco-7-peak/heighlight-bg.jpg",
  highlightMask:
    "https://www.figma.com/api/mcp/asset/f3750c6d-42eb-430f-b021-1fbb74a9bc7a.svg",
  sitePlan: "/eldeco-7-peak/site-plan.jpg",
  locationMap:
    "https://www.figma.com/api/mcp/asset/9903602a-a97b-4a3c-97e4-379122c7b166.png",
  amenity1:
    "https://www.figma.com/api/mcp/asset/6b8e3feb-e9d7-4efc-8ca3-329517eaa3de.png",
  amenity2:
    "https://www.figma.com/api/mcp/asset/b9c67152-fbb3-452b-81ba-cd7591e8e2b1.png",
  amenity3:
    "https://www.figma.com/api/mcp/asset/e81871c3-01cd-47cc-bab4-42ac4b78eec4.png",
  amenity4:
    "https://www.figma.com/api/mcp/asset/2723799b-b760-4e3e-b6fe-efcd229071cc.png",
  pool: "/eldeco-7-peak/Swimming-Pool.jpg",
  gym: "/eldeco-7-peak/Gymnasium.jpg",
  gallery1:
    "https://www.figma.com/api/mcp/asset/27639757-28da-40c8-a888-385ea4fbcb38.png",
  gallery2:
    "https://www.figma.com/api/mcp/asset/b499d872-922f-498d-8653-b013b1f72ea7.png",
  formBg: "/eldeco-7-peak/footer2.jpg",
};

const icons = [
  "/eldeco-7-peak/building.png",
  "/eldeco-7-peak/balcony.png",
  "/eldeco-7-peak/swiming.png",
  "/eldeco-7-peak/park.png",
  "/eldeco-7-peak/lift.png",
  "/eldeco-7-peak/lift.png",
  "/eldeco-7-peak/lift.png",
  "/eldeco-7-peak/lift.png",
];
const locationIcons = [
  "/eldeco-7-peak/metro.png",
  "/eldeco-7-peak/school.png",
  "/eldeco-7-peak/hospital.png",
  "/eldeco-7-peak/airport.png",
  "/eldeco-7-peak/shopping.png",
  "/eldeco-7-peak/business.png",
];
const gallery_slider = [
    "/eldeco-7-peak/gallery/images-1.webp",
    "/eldeco-7-peak/gallery/images-2.webp",
    "/eldeco-7-peak/gallery/images-3.webp",
    "/eldeco-7-peak/gallery/images-4.webp",
    "/eldeco-7-peak/gallery/images-5.webp",
    "/eldeco-7-peak/gallery/images-6.webp",
    "/eldeco-7-peak/gallery/images-7.webp",
    "/eldeco-7-peak/gallery/images-8.webp",
    "/eldeco-7-peak/gallery/images-01.webp",
    "/eldeco-7-peak/gallery/images-02.webp",
    "/eldeco-7-peak/gallery/images-03.webp",
    "/eldeco-7-peak/gallery/images-04.webp",
    "/eldeco-7-peak/gallery/images-05.webp",
    "/eldeco-7-peak/gallery/images-06.webp",
    "/eldeco-7-peak/gallery/images-07.webp",
    "/eldeco-7-peak/gallery/images-08.webp",
];

const highlights = [
  "Each Floor Having 4 Apartment With 3 Side Open With Infinite Views",
  "Wraparound Balconies And Sunlit Interiors In Every Apartment",
  "4 Swimming Pools – Lap Pool, Tropical Pool, All-weather Heated Pool And Kids’ Pool With Sand Beach",
  "Basement With 28 Cutouts Ensures Abundant Natural Light",
  "3 Large Passenger Lifts And 1 Service Lift In Each Tower",
  "Optimum Utilization Of Stilt Area For Recreational Activities",
];

const prices = [
  ["3 BHK + 2T", "1650 Sq Ft", "₹ 2.73 CR *"],
  ["4 BHK + 3T", "1850 Sq Ft", "On Request"],
];

const landmarks = [
  ["Metro Station", "5 Min Walk"],
  ["Top Schools", "2 km"],
  ["Multi-Specialty Hospital", "3 km"],
  ["International Airport", "25 km"],
  ["Shopping Mall", "1.5 km"],
  ["Business District", "8 km"],
];

const amenities = [
  {
    title: "Grand Entrance",
    img: "/eldeco-7-peak/amenities/Grand-Entrance.png",
  },
  {
    title: "Courtyard Garden",
    img: "/eldeco-7-peak/amenities/Courtyard-Garden.png",
  },
  {
    title: "Reflexology Path",
    img: "/eldeco-7-peak/amenities/Reflexology-Path.png",
  },
  {
    title: "Orchard Garden",
    img: "/eldeco-7-peak/amenities/Orchard-Garden.png",
  },
  {
    title: "Kid’s Play Area",
    img: "/eldeco-7-peak/amenities/Kid-Play-Area.png",
  },
  {
    title: "Skating Circuit",
    img: "/eldeco-7-peak/amenities/Skating-Circuit.png",
  },
  {
    title: "Cycling Track",
    img: "/eldeco-7-peak/amenities/Cycling-Track.png",
  },
  {
    title: "Pavilion Stage & Lawn",
    img: "/eldeco-7-peak/amenities/Pavilion-Stage-&-Lawn.png",
  },
  {
    title: "Senior Citizen Garden",
    img: "/eldeco-7-peak/amenities/Senior-Citizen-Garden.png",
  },
  {
    title: "Outdoor Gym",
    img: "/eldeco-7-peak/amenities/Outdoor-Gym.png",
  },
  {
    title: "Jogging Track",
    img: "/eldeco-7-peak/amenities/Cycling-Track.png",
  },
  {
    title: "Leisure Park",
    img: "/eldeco-7-peak/amenities/Leisure-Park.png",
  },
];

function Button({
  children,
  light = false,
  amenities = false,
}: {
  children: React.ReactNode;
  light?: boolean;
  amenities?: boolean;
}) {
  return (
    <CtaButton light={light} amenities={amenities}>
      {children}
    </CtaButton>
  );
}

function SectionTitle({
  eyebrow,
  title,
  dark = false,
  align = "center",
  uppercase = true,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  dark?: boolean;
  align?: "center" | "left";
  uppercase?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`${align === "left" ? "text-left" : "text-center"} ${dark ? "text-white" : ""} ${className}`.trim()}
    >
      {eyebrow && (
        <div className="mb-2.5 font-[family-name:var(--font-7peaks-inter)] text-xl font-medium tracking-[5px] text-black/40">
          {eyebrow}
        </div>
      )}
      <h2
        className={`m-0 font-[family-name:var(--font-7peaks-poppins)] text-[36px] font-normal leading-[1.5] max-[800px]:text-[30px] ${
          uppercase ? "uppercase" : "normal-case"
        }`}
      >
        {title}
      </h2>
    </div>
  );
}

export default function Home() {
  return (
    <SmoothScroll>
      <div className="box-border w-full bg-[#e1f1ea] font-[family-name:var(--font-7peaks-poppins)] text-[#0a0a0a] [&_*]:box-border [&_a]:no-underline [&_button]:font-[inherit] [&_input]:font-[inherit]">
        <SiteHeader logoSrc={assets.logo} />

        <main className="w-full overflow-x-hidden">
          <section id="top" className="w-full">
            <img
              src={assets.hero}
              alt="Eldeco 7 Peaks Residences"
              className="block h-auto w-full"
            />
          </section>

          <section
            id="overview"
            className="flex h-[388px] items-center justify-center bg-[#e1f1ea] text-center max-[800px]:h-auto max-[800px]:min-h-[390px] max-[800px]:py-[50px]"
          >
          <div className="flex w-[min(1219px,calc(100%-48px))] flex-col items-center gap-[23px]">
            <SectionTitle title="OVERVIEW" />
            <p className="-mt-2.5 mb-0 max-w-[1219px] font-[family-name:var(--font-7peaks-cormorant)] text-[28px] leading-[1.46] max-[800px]:text-[22px] max-[800px]:leading-[1.4]">
              Eldeco 7 Peaks Residences in Greater Noida offers premium 3 & 4 BR
              residences in Omicron 1A, Greater Noida. Designed for modern
              luxury living, the project combines spacious residences, oversized
              terraces and lush green surroundings. Starting at ₹2.37 Cr*,
              Eldeco 7 Peaks is positioned as a premium residential address for
              homebuyers looking for expansive living spaces and a
              nature-centric lifestyle in Greater Noida.
            </p>
            <Button>Enquire Now</Button>
          </div>
        </section>

        <section
          id="highlights"
          className="relative mx-auto flex h-[667px] w-[min(1094px,calc(100%-48px))] items-center justify-center text-white max-[800px]:h-auto max-[800px]:min-h-[667px] max-[800px]:py-[60px] mb-[60px]"
        >
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={assets.highlightImage}
              alt=""
              fill
              unoptimized
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[rgba(8,56,40,0.86)]" />
          </div>
          <div className="relative flex w-[min(856px,calc(100%-64px))] flex-col items-center gap-10 text-center">
            <SectionTitle
              dark
              title="Highlights"
              className="w-[601px] max-w-full"
            />
            <p className="-mt-[22px] mb-0 text-lg font-medium capitalize tracking-[0.9px]">
              Indulgence In The Rare - Crafted Once, Remembered Always
            </p>
            <div className="grid w-full grid-cols-3 gap-x-[73px] gap-y-7 max-[800px]:grid-cols-2 max-[800px]:gap-x-6 max-[520px]:grid-cols-1">
              {highlights.map((text, i) => (
                <article
                  key={text}
                  className="flex min-h-[176px] flex-col items-center gap-4 max-[520px]:min-h-0 max-[520px]:border-b max-[520px]:border-white max-[520px]:pb-7 max-[520px]:last:border-b-0 max-[520px]:last:pb-0"
                >
                  <div className="flex h-[62px] w-[62px] items-center justify-center">
                    <Image
                      src={icons[i % icons.length]}
                      alt=""
                      width={62}
                      height={62}
                      unoptimized
                      className="h-[62px] w-[62px] object-contain"
                    />
                  </div>
                  <p className="m-0 text-base capitalize leading-[26px]">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="price"
          className="flex min-h-[614px] flex-col items-center gap-9 bg-[#092119] px-[110px] py-14 text-white max-[1100px]:px-6 max-[800px]:px-5 max-[800px]:py-14"
        >
          <SectionTitle dark title=" Price List" />
          <p className="-mt-5 mb-0 text-lg font-medium tracking-[0.9px]">
            Proposed Area &amp; Pricing Of Luxury Launch
          </p>
          <div className="mx-auto grid w-full max-w-[752px] grid-cols-1 items-center justify-items-center gap-8 min-[760px]:grid-cols-2">
            {prices.map(([type, size, price]) => (
              <article
                key={type}
                className="flex h-[280px] w-full max-w-[360px] flex-col gap-7 rounded-2xl bg-[#ebe7dc] p-8 text-[#122f23] shadow-[0_12px_12px_rgba(0,0,0,0.06)] max-[520px]:h-auto max-[520px]:min-h-[280px]"
              >
                <h3 className="m-0 text-center text-[22px] font-bold">
                  {type}
                </h3>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[#526257]">Size</span>
                    <strong className="text-[15px] font-bold text-[#1c2d24]">
                      {size}
                    </strong>
                  </div>
                  <div className="h-px w-full bg-[#a9aa9f] opacity-65" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[#526257]">Price</span>
                    <b className="text-[15px] font-bold text-[#aa8453]">
                      {price}
                    </b>
                  </div>
                  <div className="h-px w-full bg-[#a9aa9f] opacity-65" />
                </div>
                <CtaButton
                  unstyled
                  slideFill
                  className="btn-7peaks-slide--dark mt-auto flex h-[45px] w-full cursor-pointer items-center justify-center rounded-[2px] border-none text-[11px] font-bold uppercase"
                >
                  View Details
                </CtaButton>
              </article>
            ))}
          </div>
          <Button light>Enquire Now</Button>
        </section>

        <section id="floor-plan" className="w-full">
          <img
            src={assets.sitePlan}
            alt="Eldeco 7 Peaks site plan"
            className="block h-auto w-full"
          />
        </section>

        <section
          id="location"
          className="min-h-[926px] bg-white pt-[60px] max-[800px]:pt-[50px]"
        >
          <div className="pl-[max(90px,calc((100%-1260px)/2))] max-[1100px]:px-6 max-[1100px]:text-center max-[800px]:px-6">
            <SectionTitle
              eyebrow="Location Benefits"
              title="Why Choose Eldeco 7 Peaks Residences"
              align="left"
              className="[&_h2]:text-[36px] [&_h2]:leading-[48px] max-[1100px]:!text-center max-[800px]:[&_h2]:whitespace-normal max-[800px]:[&_h2]:text-[30px] max-[800px]:[&_h2]:leading-[1.25]"
            />
            <p className="mt-4 mb-0 text-left text-base font-medium capitalize max-[1100px]:text-center">
              Experience the perfect balance of spiritual serenity and modern
              convenience.
            </p>
          </div>
          <div className="mx-auto mt-[42px] grid w-[min(1270px,calc(100%-48px))] grid-cols-[611px_611px] items-start gap-12 max-[1100px]:grid-cols-2 max-[800px]:w-[calc(100%-48px)] max-[800px]:grid-cols-1">
            <div className="relative">
              <div className="relative h-[556px] overflow-hidden bg-[#eee] max-[520px]:h-[420px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2480.395115814771!2d77.56311681334556!3d28.455191224707082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cbfc3d742294b%3A0x54eb8c3b5feb8305!2sEldeco%207%20Peaks%20Residences!5e0!3m2!1sen!2sin!4v1788933677232!5m2!1sen!2sin"
                  title="Eldeco 7 Peaks Residences location map"
                  width="600"
                  height="450"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              </div>
              <div className="absolute left-6 top-[358px] flex h-[76px] w-[calc(100%-48px)] items-center gap-3 rounded-[14px] bg-white/95 p-4 shadow-[0_10px_15px_rgba(0,0,0,0.1),0_4px_6px_rgba(0,0,0,0.1)] max-[520px]:top-[250px]">
                <img
                  src="/eldeco-7-peak/location.png"
                  alt=""
                  className="h-6 w-6 object-contain"
                />
                <div>
                  <strong className="block whitespace-nowrap text-base font-bold">
                    Eldeco 7 Peaks Residences, Greater Noida
                  </strong>
                  <span className="mt-0.5 block font-[family-name:var(--font-7peaks-inter)] text-sm text-[#717182]">
                    Omicron 1A
                  </span>
                </div>
              </div>
              <CtaButton
                unstyled
                slideFill
                className="btn-7peaks-slide--map mt-[30px] flex h-16 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border-none font-[family-name:var(--font-7peaks-inter)] text-base font-medium shadow-[0_10px_7.5px_rgba(0,0,0,0.1),0_4px_3px_rgba(0,0,0,0.1)]"
              >
                <img
                  src="/eldeco-7-peak/download.png"
                  alt=""
                  className="h-5 w-5 object-contain transition-[filter] duration-[450ms] ease-[ease]"
                />
                Get Location Map
              </CtaButton>
            </div>
            <div>
              <h3 className="-mt-1 mb-8 text-2xl leading-8 font-[700]">
                Nearby Landmarks
              </h3>
              <div className="flex flex-col gap-4">
                {landmarks.map(([name, distance], i) => (
                  <div
                    key={name}
                    className="grid h-20 grid-cols-[48px_1fr_8px] items-center gap-4 rounded-[14px] bg-[#f9fafb] p-4"
                  >
                    <div className="grid h-12 w-12 place-items-center rounded-[14px]">
                      <Image
                        src={locationIcons[i % locationIcons.length]}
                        alt=""
                        width={24}
                        height={24}
                        unoptimized
                        className="h-6 w-6"
                      />
                    </div>
                    <div>
                      <strong className="block text-base font-medium">
                        {name}
                      </strong>
                      <span className="block text-sm text-[#717182]">
                        {distance}
                      </span>
                    </div>
                    <i className="h-2 w-2 rounded-full bg-[#00c950] not-italic" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="amenities"
          className="flex min-h-[1115px] flex-col items-center gap-9 bg-[linear-gradient(142.25deg,#f9fafb_0%,#f3f4f6_100%)] py-14 max-[800px]:min-h-0 max-[800px]:py-14"
        >
          <SectionTitle title="Amenities" uppercase={false} />
          <div className="grid w-[min(1270px,calc(100%-48px))] grid-cols-4 gap-x-6 gap-y-8 max-[800px]:grid-cols-2 max-[520px]:grid-cols-1">
            {amenities.map((amenity, i) => {
              const isTopRow = i < 4;
              return (
                <div
                  key={amenity.title}
                  className={`flex flex-col items-center justify-start gap-4 rounded-[14px] border-[1.25px] border-[#f3f4f6] bg-white px-[25px] py-[25px] ${
                    isTopRow ? "h-32" : "h-[136px]"
                  }`}
                >
                  <div
                    className={`grid place-items-center ${
                      isTopRow ? "h-[66px] w-[66px]" : "h-12 w-12"
                    }`}
                  >
                    <Image
                      src={amenity.img}
                      alt={amenity.title}
                      width={isTopRow ? 66 : 48}
                      height={isTopRow ? 66 : 48}
                      unoptimized
                      className={
                        isTopRow
                          ? "h-[66px] w-[66px] object-contain"
                          : "h-12 w-12 object-contain"
                      }
                    />
                  </div>
                  <span className="text-center text-sm font-medium">
                    {amenity.title}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="grid w-[min(1270px,calc(100%-48px))] grid-cols-2 gap-6 max-[800px]:grid-cols-1">
            <div className="relative h-80 overflow-hidden rounded-2xl">
              <Image
                src={assets.pool}
                alt="Olympic Size Swimming Pool"
                fill
                unoptimized
                sizes="623px"
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-end bg-[linear-gradient(to_top,#00000099,#00000000)] p-8">
                <h3 className="m-0 font-[family-name:var(--font-7peaks-inter)] text-2xl font-bold leading-8 text-white">
                  Olympic Size Swimming Pool
                </h3>
              </div>
            </div>
            <div className="relative h-80 overflow-hidden rounded-2xl">
              <Image
                src={assets.gym}
                alt="State-of-the-Art Gymnasium"
                fill
                unoptimized
                sizes="623px"
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-end bg-[linear-gradient(to_top,#00000099,#00000000)] p-8">
                <h3 className="m-0 font-[family-name:var(--font-7peaks-inter)] text-2xl font-bold leading-8 text-white">
                  State-of-the-Art Gymnasium
                </h3>
              </div>
            </div>
          </div>
          <Button amenities>Book Site Visit</Button>
        </section>

        <section
          id="gallery"
          className="relative w-full overflow-hidden bg-[#E1F1EA]"
        >
          <img
            src="/eldeco-7-peak/gallery-bg.jpg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-0 h-auto w-full"
          />
          <div className="relative z-10 w-full pb-16 pl-[303px] pt-[152px] max-[1100px]:pl-12 max-[800px]:px-6 max-[800px]:py-20">
            <div className="w-full max-w-[1681px]">
              <h2 className="mb-[68px] mt-0 text-[36px] font-normal uppercase leading-[41px] underline decoration-black decoration-[1.8px] underline-offset-[10px] max-[1100px]:text-center">
                Gallery
              </h2>
              <GallerySlider images={gallery_slider} />
            </div>
          </div>
        </section>

        <section
          id="enquiry"
          className="relative flex min-h-[577px] flex-col items-center justify-center overflow-hidden bg-[#111] px-5 py-[54px] max-[800px]:min-h-[650px] max-[800px]:pb-[50px]"
        >
          <div className="absolute inset-0 after:absolute after:inset-0 after:bg-black/70 after:content-['']">
            <Image
              src={assets.formBg}
              alt=""
              fill
              unoptimized
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="relative z-10 w-full max-w-[557px] text-center text-white">
            <h2 className="m-0 text-center text-[36px] font-medium leading-10 max-[800px]:text-[30px]">
              Schedule Your Site Visit Today
            </h2>
            <p className="mt-4 mb-0 font-[family-name:var(--font-7peaks-inter)] text-base leading-6 text-[#d4d4d4]">
              Experience luxury living firsthand. Our team is ready to assist
              you.
            </p>
          </div>
          <EnquiryForm />
        </section>

        <footer className="grid h-[70px] place-items-center bg-[#147B58] text-white">
          <p className="m-0 text-sm italic">
            Privacy Policy&nbsp; | Digital Media Planned By&nbsp; Ritz Media
            World
          </p>
        </footer>
      </main>
      </div>
    </SmoothScroll>
  );
}
