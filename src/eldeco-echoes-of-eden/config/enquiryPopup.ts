export type EnquiryPopupField = {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea";
  placeholder: string;
  required?: boolean;
};

export const enquiryPopupConfig = {
  sessionStorageKey: "eldeco-enquiry-popup-auto-dismissed",
  autoShowDelayMs: 10_000,
  image: {
    src: "/eldeco-echoes-of-eden/images/hero-bg.png",
    alt: "Eldeco Echoes of Eden towers",
  },
  title: "Eldeco Echoes of Eden",
  subtitle: "Find your dream home today with our expert assistance.",
  submitLabel: "Submit",
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
      label: "Message",
      type: "text",
      placeholder: "Message",
      required: false,
    },
  ] satisfies EnquiryPopupField[],
} as const;
