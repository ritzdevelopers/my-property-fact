export type PromoEnquiryField = {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea";
  placeholder: string;
  required?: boolean;
};

export type PricingPlan = {
  id: string;
  type: string;
  size: string;
  price: string;
  ctaLabel: string;
};

export const promoCtaConfig = {
  id: "promo-cta",
  backgroundImage: "/eldeco-echoes-of-eden/images/promo-building.jpg",
  backgroundPosition: "center center",
  heading: "Lock This Month's Pricing on Eldeco EOE",
  enquiry: {
    title: "Interested? Enquire Now",
    submitLabel: "Send Your Message",
    consentText:
      "I authorize company representatives to Call, SMS, Email or Whatsapp me about its products and offers. This content overrides any registration for DNC/NDNC.",
    fields: [
      {
        name: "name",
        label: "Your Name",
        type: "text",
        placeholder: "Your Name",
        required: true,
      },
      {
        name: "phone",
        label: "Your Mobile Number",
        type: "tel",
        placeholder: "Your Mobile Number",
        required: true,
      },
      {
        name: "email",
        label: "Your Email Address",
        type: "email",
        placeholder: "Your Email Address",
        required: true,
      },
      {
        name: "message",
        label: "Your Message",
        type: "textarea",
        placeholder: "Your Message",
        required: false,
      },
    ] satisfies PromoEnquiryField[],
  },
} as const;

export const priceConfig = {
  id: "price",
  eyebrow: "QUALITY THAT FITS YOUR BUDGET",
  title: "Our Price",
  plans: [
    {
      id: "3bhk-1550",
      type: "3 BHK",
      size: "1550 Sq.Ft",
      price: "₹ 1.74 Cr*",
      ctaLabel: "View Details",
    },
    {
      id: "3bhk-1850",
      type: "3 BHK",
      size: "1850 Sq.Ft",
      price: "On Request",
      ctaLabel: "View Details",
    },

  ] satisfies PricingPlan[],
} as const;
