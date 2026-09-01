export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const faqConfig = {
  id: "faq",
  title: "FAQ's",
  items: [
    {
      id: "what-is-eldeco-eoe",
      question: "What is Eldeco EOE?",
      answer:
        "Eldeco EOE is simply the shorthand buyers and brokers use for Eldeco Echoes of Eden, the residential project at Sector 22D, Yamuna Expressway. You'll see both names used interchangeably across listings and search results for the same development.",
    },
    {
      id: "location",
      question: "Where is Eldeco Echoes of Eden Sector 22D located?",
      answer:
        "It's on the Yamuna Expressway itself, roughly a 2-minute drive from the highway, in Sector 22D, Greater Noida. That puts Jewar Airport about 15 minutes away and Galgotias University around 10.",
    },
    {
      id: "investment",
      question: "Is Eldeco Echoes of Eden Greater Noida a good investment?",
      answer:
        "It depends on your time horizon. This corridor is still building out its social infrastructure, so the case here rests on the airport ramping up traffic and institutional development following, not on amenities that already exist today the way they do in older localities. For buyers comfortable holding through that build-out, the entry pricing and RERA-backed escrow protection make the risk more manageable.",
    },
    {
      id: "special",
      question: "What makes Eldeco projects in Greater Noida special?",
      answer:
        "The 80% open-space ratio on Echoes of Eden isn't typical for this price band. Most comparable launches on the expressway run denser towers with less land set aside for green cover, so Eldeco's projects tend to read differently on a site visit than they do on a brochure.",
    },
    {
      id: "benefits",
      question:
        "What are the benefits of buying a home in Eldeco Echoes of Eden Yamuna Expressway?",
      answer:
        "Beyond the airport proximity and expressway access, the construction-linked 30:20:20:30 payment plan means you're not funding the entire purchase before possession. Combined with the car-free ground plaza, that's a meaningful difference for families weighing this against denser, cash-heavier alternatives nearby.",
    },
  ] satisfies FaqItem[],
} as const;
