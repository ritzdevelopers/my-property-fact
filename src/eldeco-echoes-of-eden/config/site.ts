export type NavLink = {
  label: string;
  href: string;
};

export type SiteColors = {
  cream: string;
  creamFooter: string;
  navy: string;
  green: string;
  navyLight: string;
  textMuted: string;
};

export type FooterRera = {
  projectLabel: string;
  projectValue: string;
  agentLabel: string;
  agentValue: string;
};

export type FooterDisclaimer = {
  label: string;
  shortText: string;
  fullText: string;
  readMoreLabel: string;
  readLessLabel: string;
};

export const siteColors: SiteColors = {
  cream: "#DBE4DD",
  creamFooter: "#D4E0D8",
  navy: "#1D3B2F",
  green: "#2E7D32",
  navyLight: "#2A5244",
  textMuted: "#333333",
};

export const siteConfig = {
  brand: {
    name: "ELDECO",
    href: "/",
  },
  contact: {
    phone: "+91-8929007384",
    phoneHref: "tel:+918929007384",
    whatsappHref: "https://wa.me/918929007384",
  },
  mobileCta: {
    label: "Enquire Now",
  },
  navigation: [
    { label: "HOME", href: "#home" },
    { label: "OVERVIEW", href: "#overview" },
    { label: "HIGHLIGHT", href: "#highlight" },
    { label: "PRICE", href: "#price" },
    { label: "AMENITIES", href: "#amenities" },
    { label: "FLOOR PLAN", href: "#floor-plan" },
    { label: "GALLERY", href: "#gallery" },
    { label: "LOCATION", href: "#location" },
  ] satisfies NavLink[],
  footer: {
    companyName: "Eldeco Group",
    description:
      "Eldeco has been delivering projects since 1985, long enough that its track record in North India can be checked against actual completed developments rather than promises. Across 20 cities, the group's portfolio runs from townships and residential communities to industrial parks, retail, and commercial towers, the kind of range that comes from four decades of staying in business, not a single lucky launch.",
    rera: {
      projectLabel: "Project RERA",
      projectValue: "UPRERAPRJ125342/02/2026",
      agentLabel: "Agent RERA",
      agentValue: "UPRERAAGT10202",
    } satisfies FooterRera,
    disclaimer: {
      label: "Disclaimer:",
      shortText:
        "Disclaimer copy (matching original, legal/compliance text — kept as-is intentionally): The content provided on this website is for information purposes only and does not constitute an offer to avail any service.",
    
      fullText:
        "The prices mentioned are subject to change without prior notice, and the availability of properties mentioned is not guaranteed. The images displayed on the website are for representation purposes only and may not reflect the actual properties accurately. Please note that this is not the official website of an authorized marketing partner.",
    
      readMoreLabel: "Read More",
      readLessLabel: "Read Less",
    } satisfies FooterDisclaimer,
    privacyPolicy: {
      label: "Disclaimer & Privacy Policy",
      href: "#disclaimer-privacy",
    },
    qrCode: {
      alt: "Project QR Code",
      /** Replace with your actual QR image path when available */
      src: "/eldeco-echoes-of-eden/images/qr-code.png",
    },
  },
} as const;
