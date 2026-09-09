import Image from "next/image";

const assets = {
  hero: "https://www.figma.com/api/mcp/asset/7a7c09e5-ad7c-43b4-aeff-ed7c2b0f298d.png",
  logo: "https://www.figma.com/api/mcp/asset/bf96019c-23ed-4e97-88e4-450284314f8b.png",
  highlightImage: "https://www.figma.com/api/mcp/asset/7e8939c0-3b24-4627-8676-3e3d07c32f45.png",
  highlightMask: "https://www.figma.com/api/mcp/asset/f3750c6d-42eb-430f-b021-1fbb74a9bc7a.svg",
  sitePlan: "https://www.figma.com/api/mcp/asset/abc8a8ee-6415-493d-a17b-db20548daf1e.png",
  locationMap: "https://www.figma.com/api/mcp/asset/9903602a-a97b-4a3c-97e4-379122c7b166.png",
  amenity1: "https://www.figma.com/api/mcp/asset/6b8e3feb-e9d7-4efc-8ca3-329517eaa3de.png",
  amenity2: "https://www.figma.com/api/mcp/asset/b9c67152-fbb3-452b-81ba-cd7591e8e2b1.png",
  amenity3: "https://www.figma.com/api/mcp/asset/e81871c3-01cd-47cc-bab4-42ac4b78eec4.png",
  amenity4: "https://www.figma.com/api/mcp/asset/2723799b-b760-4e3e-b6fe-efcd229071cc.png",
  pool: "https://www.figma.com/api/mcp/asset/34188eca-61bd-45d4-ad23-642096bb2ab5.png",
  gym: "https://www.figma.com/api/mcp/asset/e47ee9bf-59cf-4678-809a-546081aed4ce.png",
  gallery1: "https://www.figma.com/api/mcp/asset/27639757-28da-40c8-a888-385ea4fbcb38.png",
  gallery2: "https://www.figma.com/api/mcp/asset/b499d872-922f-498d-8653-b013b1f72ea7.png",
  formBg: "https://www.figma.com/api/mcp/asset/cb4eb32d-e6eb-417b-876c-6076377ea4d5.png",
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

const highlights = [
  "Each Floor Having 4 Apartment With 3 Side Open With Infinite Views",
  "Wraparound Balconies And Sunlit Interiors In Every Apartment",
  "4 Swimming Pools – Lap Pool, Tropical Pool, All-weather Heated Pool And Kids’ Pool With Sand Beach",
  "Basement With 28 Cutouts Ensures Abundant Natural Light",
  "3 Large Passenger Lifts And 1 Service Lift In Each Tower",
  "Optimum Utilization Of Stilt Area For Recreational Activities",
];

const prices = [
  ["3 BHK + 2T", "1650 Sq Ft", "₹ 1.88 CR *"],
  ["3 BHK + 3T", "1850 Sq Ft", "₹ 2.12 CR *"],
  ["3 BHK + Servant", "2250 Sq Ft", "₹ 2.58 CR *"],
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
  "Swimming Pool",
  "Gymnasium",
  "Kids Play Area",
  "Clubhouse",
  "Landscaped Gardens",
  "24/7 Security",
  "Covered Parking",
  "High-Speed Internet",
  "Central AC",
  "Cafe & Lounge",
  "Library & Study",
  "Indoor Games",
];

function Button({
  children,
  href = "#enquiry",
  light = false,
  amenities = false,
}: {
  children: React.ReactNode;
  href?: string;
  light?: boolean;
  amenities?: boolean;
}) {
  return (
    <a
      href={href}
      className={[
        "inline-flex min-h-[52px] min-w-[180px] items-center justify-center px-7 py-3.5 text-base font-bold shadow-[0_1px_5px_rgba(0,0,0,0.16)] transition-[transform,opacity] duration-200 hover:-translate-y-0.5 hover:opacity-[0.92]",
        light
          ? "rounded bg-white text-[#133c2e]"
          : amenities
            ? "w-[168px] rounded-[10px] bg-[#1f5341] text-white"
            : "rounded bg-[#147b58] text-white",
      ].join(" ")}
    >
      {children}
    </a>
  );
}

function SectionTitle({
  eyebrow,
  title,
  dark = false,
  align = "center",
  className = "",
}: {
  eyebrow?: string;
  title: string;
  dark?: boolean;
  align?: "center" | "left";
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
      <h2 className="m-0 font-[family-name:var(--font-7peaks-poppins)] text-[36px] font-normal uppercase leading-[1.5] max-[800px]:text-[30px]">
        {title}
      </h2>
    </div>
  );
}

export default function Home() {
  return (
    <main className="box-border w-full overflow-x-hidden bg-[#e1f1ea] font-[family-name:var(--font-7peaks-poppins)] text-[#0a0a0a] [&_*]:box-border [&_a]:no-underline [&_button]:font-[inherit] [&_input]:font-[inherit]">
      <header className="sticky top-0 z-50 h-[85px] w-full bg-white max-[800px]:h-[72px]">
        <div className="mx-auto flex h-[85px] w-[min(1256px,calc(100%-48px))] items-center justify-between gap-12 max-[1100px]:gap-5 max-[800px]:h-[72px] max-[800px]:w-[calc(100%-28px)]">
          <a href="#top" className="block h-[50px] w-[238px] shrink-0 max-[800px]:h-8 max-[800px]:w-[150px]">
            <Image
              src={assets.logo}
              alt="Eldeco 7 Peaks Residences"
              width={238}
              height={50}
              priority
              unoptimized
              className="h-full w-full object-cover"
            />
          </a>
          <nav
            className="flex items-center gap-7 whitespace-nowrap text-base text-[#0a0a0a] max-[1100px]:gap-[15px] max-[1100px]:text-[13px] max-[800px]:hidden [&_a]:text-inherit [&_a]:transition-opacity [&_a]:duration-200 hover:[&_a]:opacity-55"
            aria-label="Primary navigation"
          >
            {[
              ["OVERVIEW", "#overview"],
              ["HIGHLIGHT", "#highlights"],
              ["PRICE", "#price"],
              ["FLOOR PLAN", "#floor-plan"],
              ["AMENITIES", "#amenities"],
              ["LOCATION", "#location"],
              ["GALLERY", "#gallery"],
            ].map(([label, href]) => (
              <a key={label} href={href}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

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
            Eldeco 7 Peaks Residences is a rare low-density haven spread across 7.5 acres in Omicron 1A, Greater Noida, where seven iconic towers rise amidst lush, oxygen-rich greens. With 4-side open towers, expansive balconies, and One Epic View, it offers an elevated lifestyle inspired by the world’s seven great peaks.
          </p>
          <Button>Enquire Now</Button>
        </div>
      </section>

      <section
        id="highlights"
        className="relative mx-auto flex h-[667px] w-[min(1094px,calc(100%-48px))] items-center justify-center text-white max-[800px]:h-auto max-[800px]:min-h-[667px] max-[800px]:py-[60px] mb-[60px]"
      >
        <div className="absolute inset-0 overflow-hidden">
          <Image src={assets.highlightImage} alt="" fill unoptimized sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[rgba(8,56,40,0.86)]" />
        </div>
        <div className="relative flex w-[min(856px,calc(100%-64px))] flex-col items-center gap-10 text-center">
          <SectionTitle dark title="Highlights" className="w-[601px] max-w-full" />
          <p className="-mt-[22px] mb-0 text-lg font-medium capitalize tracking-[0.9px]">
            Indulgence In The Rare - Crafted Once, Remembered Always
          </p>
          <div className="grid w-full grid-cols-3 gap-x-[73px] gap-y-7 max-[800px]:grid-cols-2 max-[800px]:gap-x-6 max-[520px]:grid-cols-1">
            {highlights.map((text, i) => (
              <article
                key={text}
                className="flex min-h-[176px] flex-col items-center gap-4 max-[520px]:min-h-0"
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
                <p className="m-0 text-base capitalize leading-[26px]">{text}</p>
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
        <div className="grid grid-cols-[repeat(3,360px)] gap-8 max-[1100px]:w-full max-[1100px]:grid-cols-3 max-[800px]:grid-cols-1">
          {prices.map(([type, size, price]) => (
            <article
              key={type}
              className="flex h-[280px] w-[360px] flex-col gap-7 rounded-2xl bg-[#ebe7dc] p-8 text-[#122f23] shadow-[0_12px_12px_rgba(0,0,0,0.06)] max-[1100px]:w-auto max-[800px]:w-[min(360px,100%)] max-[520px]:h-auto max-[520px]:min-h-[280px]"
            >
              <h3 className="m-0 text-center text-[22px] font-bold">{type}</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[#526257]">Size</span>
                  <strong className="text-[15px] font-bold text-[#1c2d24]">{size}</strong>
                </div>
                <div className="h-px w-full bg-[#a9aa9f] opacity-65" />
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[#526257]">Price</span>
                  <b className="text-[15px] font-bold text-[#aa8453]">{price}</b>
                </div>
                <div className="h-px w-full bg-[#a9aa9f] opacity-65" />
              </div>
              <a
                href="#enquiry"
                className="mt-auto flex h-[45px] items-center justify-center rounded-[2px] bg-[#122f23] text-[11px] font-bold uppercase text-white"
              >
                View Details
              </a>
            </article>
          ))}
        </div>
        <Button href="#enquiry" light>
          Enquire Now
        </Button>
      </section>

      <section id="floor-plan" className="w-full">
        <img
          src={assets.sitePlan}
          alt="Eldeco 7 Peaks site plan"
          className="block h-auto w-full"
        />
      </section>

      <section id="location" className="min-h-[926px] bg-white pt-[60px] max-[800px]:pt-[50px]">
        <div className="pl-[max(90px,calc((100%-1260px)/2))] max-[800px]:px-6">
          <SectionTitle
            eyebrow="Location Benefits"
            title="Why Choose Eldeco 7 Peaks Residences"
            align="left"
            className="[&_h2]:text-[36px] [&_h2]:leading-[48px] max-[800px]:[&_h2]:whitespace-normal max-[800px]:[&_h2]:text-[30px] max-[800px]:[&_h2]:leading-[1.25]"
          />
          <p className="mt-4 mb-0 text-left text-base font-medium capitalize">
            Experience the perfect balance of spiritual serenity and modern convenience.
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
              <img src="/eldeco-7-peak/location.png" alt="" className="h-6 w-6 object-contain" />
              <div>
                <strong className="block whitespace-nowrap text-base font-bold">
                  Eldeco 7 Peaks Residences, Greater Noida
                </strong>
                <span className="mt-0.5 block font-[family-name:var(--font-7peaks-inter)] text-sm text-[#717182]">
                  Omicron 1A
                </span>
              </div>
            </div>
            <a
              className="mt-[30px] flex h-16 w-full items-center justify-center gap-2 rounded-[10px] bg-[#133c2e] font-[family-name:var(--font-7peaks-inter)] text-base font-medium text-white shadow-[0_10px_7.5px_rgba(0,0,0,0.1),0_4px_3px_rgba(0,0,0,0.1)]"
              href="#location"
            >
              <img src="/eldeco-7-peak/download.png" alt="" className="h-5 w-5 object-contain" />
              Get Location Map
            </a>
          </div>
          <div>
            <h3 className="-mt-1 mb-8 text-2xl leading-8 font-[700]">Nearby Landmarks</h3>
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
                    <strong className="block text-base font-medium">{name}</strong>
                    <span className="block text-sm text-[#717182]">{distance}</span>
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
        <SectionTitle title="Amenities" />
        <div className="grid w-[min(1270px,calc(100%-48px))] grid-cols-4 gap-x-6 gap-y-8 max-[800px]:grid-cols-2 max-[520px]:grid-cols-1">
          {amenities.map((name, i) => {
            const isTopRow = i < 4;
            return (
              <div
                key={name}
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
                    src={icons[(i + 2) % icons.length]}
                    alt=""
                    width={isTopRow ? 66 : 48}
                    height={isTopRow ? 66 : 48}
                    unoptimized
                    className={isTopRow ? "h-[66px] w-[66px] object-contain" : "h-12 w-12 object-contain"}
                  />
                </div>
                <span className="text-center text-sm font-medium">{name}</span>
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
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-8">
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
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-8">
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
        className="relative min-h-[811px] overflow-hidden bg-white pb-0 pl-[303px] pt-[152px] max-[1100px]:pl-12 max-[800px]:min-h-0 max-[800px]:p-20 max-[800px]:px-6"
      >
        <div className="w-[1681px] max-[800px]:w-full">
          <h2 className="mb-[68px] mt-0 w-[145px] border-b-[1.8px] border-black py-2.5 text-[36px] font-normal uppercase leading-[41px]">
            Gallery
          </h2>
          <div className="grid grid-cols-[831px_831px] gap-[19px] max-[800px]:grid-cols-1">
            <div className="relative h-[459px] overflow-hidden rounded-[30px] max-[800px]:h-[260px]">
              <Image
                src={assets.gallery1}
                alt="Eldeco interiors"
                fill
                unoptimized
                sizes="831px"
                className="object-cover"
              />
            </div>
            <div className="relative h-[459px] overflow-hidden rounded-[30px] max-[800px]:h-[260px]">
              <Image
                src={assets.gallery2}
                alt="Eldeco residence exterior"
                fill
                unoptimized
                sizes="831px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="enquiry"
        className="relative h-[577px] overflow-hidden bg-[#111] max-[800px]:h-auto max-[800px]:min-h-[650px] max-[800px]:px-5 max-[800px]:pb-[50px] max-[800px]:pt-[54px]"
      >
        <div className="absolute inset-0 after:absolute after:inset-0 after:bg-black/70 after:content-['']">
          <Image src={assets.formBg} alt="" fill unoptimized sizes="100vw" className="object-cover" />
        </div>
        <div className="absolute left-1/2 top-[54px] w-[557px] -translate-x-1/2 text-center text-white max-[800px]:relative max-[800px]:top-auto max-[800px]:left-auto max-[800px]:w-full max-[800px]:translate-x-0">
          <h2 className="m-0 text-left text-[36px] font-medium leading-10 max-[800px]:text-center max-[800px]:text-[30px]">
            Schedule Your Site Visit Today
          </h2>
          <p className="mt-4 mb-0 font-[family-name:var(--font-7peaks-inter)] text-base leading-6 text-[#d4d4d4]">
            Experience luxury living firsthand. Our team is ready to assist you.
          </p>
        </div>
        <form className="absolute left-1/2 top-[171px] flex h-[337px] w-[952px] -translate-x-1/2 flex-col gap-5 rounded-3xl border-[1.25px] border-[#262626] bg-black/60 p-[33px] shadow-[0_25px_50px_rgba(0,0,0,0.25)] max-[800px]:relative max-[800px]:top-auto max-[800px]:left-auto max-[800px]:mt-[35px] max-[800px]:h-auto max-[800px]:w-full max-[800px]:translate-x-0">
          <div className="grid grid-cols-2 gap-5 max-[800px]:grid-cols-1">
            <label className="flex flex-col gap-2 text-sm font-medium text-white">
              Full Name *
              <input
                name="name"
                placeholder="Enter your name"
                required
                className="h-[50px] rounded-[50px] border-[1.25px] border-[#404040] bg-[#262626] px-4 py-3 text-base text-white outline-none placeholder:text-white/50 focus:border-white"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-white">
              Email Address *
              <input
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                className="h-[50px] rounded-[50px] border-[1.25px] border-[#404040] bg-[#262626] px-4 py-3 text-base text-white outline-none placeholder:text-white/50 focus:border-white"
              />
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm font-medium text-white">
            Phone Number *
            <input
              name="phone"
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              required
              className="h-[50px] rounded-[50px] border-[1.25px] border-[#404040] bg-[#262626] px-4 py-3 text-base text-white outline-none placeholder:text-white/50 focus:border-white"
            />
          </label>
          <button
            type="submit"
            className="mt-auto h-[60px] cursor-pointer rounded-[50px] border-0 bg-white text-lg font-semibold text-black"
          >
            Submit Enquiry
          </button>
        </form>
      </section>

      <footer className="grid h-[70px] place-items-center bg-[#147b58] text-white">
        <p className="m-0 text-sm italic">
          Privacy Policy&nbsp; | Digital Media Planned By&nbsp; Ritz Media World
        </p>
      </footer>
    </main>
  );
}
