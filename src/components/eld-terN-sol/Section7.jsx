import Image from "next/image";
import {
  Airplay,
  ArrowRight,
  CircleX,
  ExternalLink,
  MapPin,
  School,
  Star,
  Video,
} from "./ui/Icons";
import { ASSETS } from "./ui/assets";

/*
  Section 7 — Location  (Figma 1:306 .. 1:389)
    1:306 map plate            : 1440x401 at y4686. The photo is drawn at
                                 h-202% / top--33.54% inside the clip.
    1:307 floating-address-card: 340 wide at x1074 / y4716, rounded-16
    1:337 grid-and-actions     : 1250 wide at x102 / y5011 — five flex-1 cards,
                                 gap 20, deliberately overlapping the map
*/

const DESTINATIONS = [
  {
    Icon: Airplay,
    distance: "Approx. 35 km",
    title: "Airport (IGI), Delhi",
    titleWeight: "font-semibold",
    badgeBorder: true,
    description:
      "Reach Indira Gandhi International Airport conveniently through NH-48 and Dwarka Expressway connectivity.",
  },
  {
    Icon: Video,
    distance: "Approx. 18 km",
    title: "Medanta - The Medicity",
    titleWeight: "font-bold",
    badgeBorder: false,
    description:
      "Premium healthcare facilities like Medanta - The Medicity are easily accessible for world-class medical care.",
  },
  {
    Icon: School,
    distance: "Approx. 30 km",
    title: "Cyber City, Gurgaon",
    titleWeight: "font-bold",
    badgeBorder: false,
    description:
      "Stay close to Gurugram's leading business district and corporate ecosystem at Cyber City.",
  },
  {
    Icon: MapPin,
    distance: "Approx. 5 km",
    title: "IMT Manesar",
    titleWeight: "font-bold",
    badgeBorder: false,
    description:
      "Strategically located near IMT Manesar, offering seamless access to one of Gurugram's largest industrial and corporate hubs.",
  },
  {
    Icon: CircleX,
    distance: "Approx. 10 km",
    title: "Dwarka Expressway",
    titleWeight: "font-bold",
    badgeBorder: false,
    description:
      "Well-connected to Dwarka Expressway, ensuring faster travel to Delhi, Gurgaon, and IGI Airport.",
  },
];

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Eldeco+Terra+and+Sol+Sector+107+Noida";

export default function Section7() {
  return (
    <section id="location" className="w-full bg-eld-page">
      {/* ── 1:306 map plate ─────────────────────────────────────── */}
      <div className="relative h-[280px] w-full overflow-hidden lg:h-[401px]">
        <Image
          src={ASSETS.map.src}
          alt="Map showing the location of Eldeco Terra & Sol"
          width={ASSETS.map.width}
          height={ASSETS.map.height}
          sizes="100vw"
          title="Map showing the location of Eldeco Terra & Sol"
          className="absolute top-0 left-0 h-full w-full max-w-none object-cover lg:top-[-33.54%] lg:h-[202%]"
        />

        {/* 1:307 floating-address-card */}
        <div className="absolute top-4 right-4 flex w-[min(340px,calc(100%-2rem))] flex-col items-start gap-[14px] rounded-[16px] bg-white p-[20px] drop-shadow-[0px_12px_12px_rgba(22,18,16,0.08)] lg:top-[30px] lg:right-[26px] lg:w-[340px]">
          {/* 1:308 address-header */}
          <div className="flex w-full items-start justify-between">
            <div className="flex flex-col items-start gap-[4px] leading-[normal] whitespace-nowrap">
              <p className="text-[16px] font-extrabold text-eld-ink">Eldeco Terra &amp; Sol</p>
              <p className="text-[12px] font-normal text-eld-muted">
                Sector 107, Noida, Uttar Pradesh 201301
              </p>
            </div>
            <a
              href={MAPS_URL}
              data-open-popup
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open in Google Maps"
              className="flex size-[32px] shrink-0 flex-col items-center justify-center rounded-[8px] bg-eld-surface transition-opacity hover:opacity-80"
            >
              <ExternalLink className="size-[16px] text-eld-ink" />
            </a>
          </div>

          {/* 1:315 rating-row */}
          <div className="flex items-center gap-[6px]">
            <p className="text-[13px] leading-[normal] font-bold whitespace-nowrap text-eld-ink">
              4.8
            </p>
            <div className="flex items-start gap-[2px]">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="size-[12px] fill-eld-gold text-eld-gold" />
              ))}
            </div>
            <p className="text-[12px] leading-[normal] font-normal whitespace-nowrap text-eld-muted">
              (247 reviews)
            </p>
          </div>

          {/* 1:329 Line */}
          <div aria-hidden="true" className="h-px w-full bg-eld-line" />

          {/* 1:330 action-links */}
          <div className="flex flex-wrap items-center gap-[16px]">
            <a
              href={MAPS_URL}
              data-open-popup
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-[6px]"
            >
              <ArrowRight className="size-[14px] text-eld-gold" />
              <span className="text-[12px] leading-[normal] font-bold whitespace-nowrap text-eld-gold">
                Get Directions
              </span>
            </a>
            <span aria-hidden="true" className="text-[12px] text-eld-line">
              |
            </span>
            <a
              href={MAPS_URL}
              data-open-popup
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] leading-[normal] font-semibold whitespace-nowrap text-eld-muted hover:text-eld-ink"
            >
              View on Google Maps
            </a>
          </div>
        </div>
      </div>

      {/* ── 1:337 grid-and-actions ──────────────────────────────── */}
      <div className="mx-auto w-full max-w-frame px-4 sm:px-8 lg:px-[95px]">
        <div className="-mt-10 flex flex-col items-stretch gap-[20px] sm:flex-row sm:flex-wrap lg:-mt-[76px] lg:flex-nowrap">
          {DESTINATIONS.map(({ Icon, distance, title, titleWeight, badgeBorder, description }) => (
            <article
              key={title}
              className="flex min-w-px flex-1 basis-full flex-col items-start gap-[12px] self-stretch rounded-[16px] border border-eld-line bg-white p-[20px] drop-shadow-[0px_8px_8px_rgba(22,18,16,0.03)] sm:basis-[calc(50%-10px)] lg:basis-0"
            >
              {/* card-header */}
              <div className="flex w-full items-center justify-between">
                <span className="flex size-[40px] shrink-0 flex-col items-center justify-center rounded-[20px] bg-eld-surface">
                  <Icon className="size-[20px] text-eld-bronze" />
                </span>
                <span
                  className={`flex items-start rounded-[100px] bg-eld-surface-2 px-[10px] py-[4px] ${
                    badgeBorder ? "border border-eld-line" : ""
                  }`}
                >
                  <span className="text-[12px] leading-[normal] font-bold whitespace-nowrap text-eld-muted">
                    {distance}
                  </span>
                </span>
              </div>

              {/* card-content */}
              <div className="flex w-full flex-col items-start gap-[4px]">
                <h3 className={`w-full text-[16px] leading-[normal] text-eld-ink ${titleWeight}`}>
                  {title}
                </h3>
                <p className="w-full text-[13px] leading-[1.4] font-normal text-black/60">
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
