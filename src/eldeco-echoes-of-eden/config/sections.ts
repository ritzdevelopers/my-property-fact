export type HeroHighlight = {
  label: string;
  value: string;
};

export type EnquiryField = {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea";
  placeholder: string;
  required?: boolean;
};

export const sectionsConfig = {
  hero: {
    id: "home",
    backgroundImage: "/eldeco-echoes-of-eden/images/hero-bg.png",
    location: "Sector 22D, Yamuna Expressway",
    title: "Eldeco Echoes of Eden: 3 BHK Homes Built Around Green Living",
    subtitle: "3 BHK",
    highlights: [
      { label: "Payment Plan", value: "30:20:20:30" },
      { label: "Land Parcel", value: "5 Acres" },
      { label: "Central Greens", value: "3-Acre" },
      { label: "Green Space", value: "80% Open" },
      { label: "Amenities", value: "50+ World-Class Amenities" },
    ] satisfies HeroHighlight[],
    startingPrice: {
      label: "Starting Price",
      value: "₹ 1.64 Cr*",
    },
    enquiry: {
      title: "QUICK ENQUIRY!",
      submitLabel: "SUBMIT NOW",
      consentText:
        "I authorize company representatives to Call, SMS, Email or WhatsApp me about its products and offers. This consent overrides any registration for DNC/NDNC.",
      fields: [
        {
          name: "name",
          label: "Your Name",
          type: "text",
          placeholder: "Your Name",
          required: true,
        },
        {
          name: "email",
          label: "Your Email",
          type: "email",
          placeholder: "Your Email",
          required: true,
        },
        {
          name: "phone",
          label: "Your Phone",
          type: "tel",
          placeholder: "Your Phone",
          required: true,
        },
        {
          name: "message",
          label: "Your Message",
          type: "textarea",
          placeholder: "Your Message",
          required: false,
        },
      ] satisfies EnquiryField[],
    },
  },
  overview: {
    id: "overview",
    title: "Eldeco Echoes of Eden",
    location: "Sector 22D, Yamuna Expressway",
    description:
      "Most projects on this stretch of the Yamuna Expressway compete on size. Eldeco Echoes of Eden competes on how much of that size stays open, with 80% of its 5-acre footprint left as green, walkable space rather than built-up area. If you've been shortlisting 3bhk flats in Noida under 2cr, that trade-off more air and light per home instead of just more towers, it is worth weighing against denser projects nearby at a similar price.",
  },
  highlights: {
    id: "highlight",
    eyebrow: "ELDECO YAMUNA EXPRESSWAY SPECIFICATIONS",
    title: "Our Highlights",
    image: {
      src: "/eldeco-echoes-of-eden/images/highlights-bg.png",
      alt: "Eldeco Echoes of Eden architectural rendering",
    },
    items: [
      "On one of the fastest-appreciating stretches of the Yamuna Expressway corridor",
      "Every 3 BHK oriented to catch daylight and cross-ventilation through the day",
      "Podium-level towers keep sightlines open to the central green, not to the next block",
      "Amenities picked for daily use, not just brochure headcount",
      "Low tower density leaves room for genuine open space between blocks",
      "A quieter, more settled feel than the traffic-heavy pockets closer to the highway",
    ],
    cta: {
      label: "Download Brochure",
    },
  },
} as const;
