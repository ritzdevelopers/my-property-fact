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
    backgroundImage: "/eldeco-echoes-of-eden/images/hero-bg.jpg",
    location: "Sector 22D, Yamuna Expressway",
    title: "Eldeco Echoes of Eden: 3 BHK Homes Built Around Green Living",
    // subtitle: "3 BHK",
    highlights: [
      { label: "Land Parcel", value: "5 Acres" },
      { label: "Central Greens", value: "3-Acre" },
      { label: "Green Space", value: "80% Open" },
      { label: "Amenities", value: "50+ World-Class Amenities" },
    ] satisfies HeroHighlight[],
    offerBanner: {
      headline: "PAY 10%",
      asterisks: "**",
      headlineSuffix: "NOW",
      subline: "and nothing till 24 months",
    },
    startingPrice: {
      label: "Starting Price",
      value: "₹ 1.74 Cr*",
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
    description: [
      "Eldeco Echoes of Eden offers premium 3 BHK and 4 BHK residences in Sector 22D, Yamuna Expressway, Greater Noida. Designed for modern families, the project combines comfortable living spaces with lush green surroundings, creating a peaceful and refreshing lifestyle.",
    
      "Located in the fast-growing Yamuna Expressway region, Eldeco Echoes of Eden offers excellent connectivity to key destinations in Greater Noida and nearby areas. With its strategic location, thoughtfully planned homes, and modern lifestyle features, the project is a great choice for both homebuyers and property investors looking for a well-connected residential property in Greater Noida.",
    ],
  },
  highlights: {
    id: "highlight",
    eyebrow: "ELDECO YAMUNA EXPRESSWAY SPECIFICATIONS",
    title: "Our Highlights",
    image: {
      src: "/eldeco-echoes-of-eden/images/hero-bg.jpg",
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
